import { z } from "zod";

import { prisma } from "@/lib/db/prisma";
import { Prisma } from "@/generated/prisma/client";

import { GENERATION_QUOTA } from "./config";

/**
 * Proteção contra uso indevido da API Gemini (A1 da auditoria de
 * produção): uma cota diária por usuário, cobrada **uma única vez por
 * geração completa** (Extração + Estruturação + Consolidação), nunca por
 * chamada individual — ver `src/lib/ai/actions.ts`.
 */

export const generationIdSchema = z.string().uuid();

export type GenerationGateResult =
  | { allowed: true }
  | { allowed: false; reason: "quota_exceeded" | "invalid_generation" };

function startOfUtcDay(date: Date): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function isUniqueConstraintViolation(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

/**
 * Chamada apenas pela Etapa 1 (Extração) — é o único ponto em que a cota
 * diária é verificada/incrementada.
 *
 * - `generationId` novo: tenta reservar 1 unidade da cota do dia e, só se
 *   conseguir, registra a geração. O incremento é feito por um único
 *   UPDATE condicional no Postgres (`ON CONFLICT ... WHERE count < limite`)
 *   — atômico mesmo com muitas requisições simultâneas de instâncias
 *   diferentes da Vercel, porque a garantia vem do próprio banco (lock de
 *   linha), não de um "ler e depois escrever" da aplicação.
 * - `generationId` já registrado e ainda em andamento (ex.: retry de rede
 *   antes da resposta chegar ao cliente): tratado como a mesma tentativa,
 *   nunca cobrado de novo.
 * - `generationId` já finalizado (`completedAt` presente) ou pertencente
 *   a outro usuário: rejeitado — impede reaproveitar um id antigo para
 *   disparar uma nova chamada à IA sem pagar cota.
 */
export async function beginGeneration(
  userId: string,
  generationId: string,
): Promise<GenerationGateResult> {
  const existing = await prisma.generation.findUnique({
    where: { id: generationId },
  });

  if (existing) {
    if (existing.userId !== userId || existing.completedAt) {
      return { allowed: false, reason: "invalid_generation" };
    }
    return { allowed: true };
  }

  const day = startOfUtcDay(new Date());

  const quotaRows = await prisma.$queryRaw<{ count: number }[]>`
    INSERT INTO "GenerationQuota" ("userId", "day", "count", "updatedAt")
    VALUES (${userId}, ${day}, 1, now())
    ON CONFLICT ("userId", "day")
    DO UPDATE SET "count" = "GenerationQuota"."count" + 1, "updatedAt" = now()
    WHERE "GenerationQuota"."count" < ${GENERATION_QUOTA.dailyLimit}
    RETURNING "count"
  `;

  if (quotaRows.length === 0) {
    return { allowed: false, reason: "quota_exceeded" };
  }

  try {
    await prisma.generation.create({ data: { id: generationId, userId } });
  } catch (error) {
    // Corrida rara: outra requisição com o MESMO generationId já inseriu
    // entre a leitura inicial e aqui. A cota já foi paga por uma das duas
    // (nunca pelas duas: cada requisição faz seu próprio incremento
    // condicional acima) — trata como a mesma tentativa, sem cobrar de
    // novo nem rejeitar.
    if (!isUniqueConstraintViolation(error)) throw error;
  }

  return { allowed: true };
}

/**
 * Chamada pelas Etapas 2 e 3 (Estruturação, Consolidação) — nunca
 * verifica ou altera a cota, só confirma que o `generationId` pertence a
 * uma geração do próprio usuário, ainda em andamento e dentro da janela
 * de validade. Por isso nunca bloqueia a continuação normal de uma
 * geração já iniciada, mesmo que a cota diária do usuário se esgote
 * entre as etapas.
 */
export async function continueGeneration(
  userId: string,
  generationId: string,
): Promise<GenerationGateResult> {
  const existing = await prisma.generation.findUnique({
    where: { id: generationId },
  });

  if (!existing || existing.userId !== userId || existing.completedAt) {
    return { allowed: false, reason: "invalid_generation" };
  }

  const ageMs = Date.now() - existing.createdAt.getTime();
  if (ageMs > GENERATION_QUOTA.generationTtlMs) {
    return { allowed: false, reason: "invalid_generation" };
  }

  return { allowed: true };
}

/**
 * Marca a geração como finalizada após a Etapa 3 (Consolidação) ter
 * sucesso — impede que o mesmo `generationId` seja reaproveitado depois
 * para disparar novas chamadas à Estruturação/Consolidação de graça.
 * Melhor esforço: uma falha aqui não compromete o resultado já gerado,
 * só deixa o id elegível para rejeição um pouco mais tarde (pela janela
 * de validade, que também expira).
 */
export async function markGenerationCompleted(
  generationId: string,
): Promise<void> {
  try {
    await prisma.generation.update({
      where: { id: generationId },
      data: { completedAt: new Date() },
    });
  } catch {
    // Melhor esforço — não propaga.
  }
}
