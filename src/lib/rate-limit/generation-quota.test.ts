import { randomUUID } from "node:crypto";

import { afterEach, describe, expect, it } from "vitest";

import { prisma } from "@/lib/db/prisma";
import {
  beginGeneration,
  continueGeneration,
  markGenerationCompleted,
} from "@/lib/rate-limit/generation-quota";
import { GENERATION_QUOTA } from "@/lib/rate-limit/config";

/**
 * Testes de integração contra o Postgres real (Neon), não um substituto
 * em memória — o próprio ponto do design é a atomicidade garantida pelo
 * banco sob concorrência real, algo que um mock não consegue comprovar.
 * Ignorados automaticamente se `DATABASE_URL` não estiver configurada.
 *
 * Cada teste usa um `userId` de teste próprio (prefixo `test-genq-`, sem
 * relação com nenhuma linha real de `User` — `Generation`/`GenerationQuota`
 * não têm chave estrangeira para `User` de propósito) e limpa só as
 * linhas que criou.
 */
const hasDatabase = Boolean(process.env.DATABASE_URL);

function testUserId(): string {
  return `test-genq-${randomUUID()}`;
}

const createdUserIds = new Set<string>();

function trackedUserId(): string {
  const id = testUserId();
  createdUserIds.add(id);
  return id;
}

afterEach(async () => {
  if (!hasDatabase || createdUserIds.size === 0) return;
  const ids = Array.from(createdUserIds);
  await prisma.generation.deleteMany({ where: { userId: { in: ids } } });
  await prisma.generationQuota.deleteMany({ where: { userId: { in: ids } } });
  createdUserIds.clear();
});

describe.skipIf(!hasDatabase)("beginGeneration / continueGeneration", () => {
  it("permite a primeira geração do dia e registra a cota", async () => {
    const userId = trackedUserId();
    const generationId = randomUUID();

    const result = await beginGeneration(userId, generationId);
    expect(result).toEqual({ allowed: true });

    const quota = await prisma.generationQuota.findFirst({ where: { userId } });
    expect(quota?.count).toBe(1);
  });

  it("não cobra 2 vezes um retry com o MESMO generationId", async () => {
    const userId = trackedUserId();
    const generationId = randomUUID();

    await beginGeneration(userId, generationId);
    const second = await beginGeneration(userId, generationId);

    expect(second).toEqual({ allowed: true });
    const quota = await prisma.generationQuota.findFirst({ where: { userId } });
    expect(quota?.count).toBe(1);
  });

  it("bloqueia a geração seguinte ao atingir a cota diária", async () => {
    const userId = trackedUserId();

    for (let i = 0; i < GENERATION_QUOTA.dailyLimit; i++) {
      const result = await beginGeneration(userId, randomUUID());
      expect(result.allowed).toBe(true);
    }

    const blocked = await beginGeneration(userId, randomUUID());
    expect(blocked).toEqual({ allowed: false, reason: "quota_exceeded" });

    const quota = await prisma.generationQuota.findFirst({ where: { userId } });
    expect(quota?.count).toBe(GENERATION_QUOTA.dailyLimit);
  });

  it("garante atomicidade do limite diário sob requisições simultâneas (concorrência real)", async () => {
    const userId = trackedUserId();
    const attempts = Array.from(
      { length: GENERATION_QUOTA.dailyLimit + 5 },
      () => randomUUID(),
    );

    const results = await Promise.all(
      attempts.map((id) => beginGeneration(userId, id)),
    );

    const allowedCount = results.filter((r) => r.allowed).length;
    // Nunca mais que o limite, mesmo com (dailyLimit + 5) requisições
    // disparadas ao mesmo tempo — se o incremento não fosse atômico no
    // Postgres, uma corrida poderia deixar passar mais que o limite.
    expect(allowedCount).toBe(GENERATION_QUOTA.dailyLimit);

    const quota = await prisma.generationQuota.findFirst({ where: { userId } });
    expect(quota?.count).toBe(GENERATION_QUOTA.dailyLimit);
  });

  it("nunca bloqueia a continuação (Etapas 2/3) de uma geração já iniciada, mesmo com a cota do dia esgotada por OUTRAS gerações", async () => {
    const userId = trackedUserId();
    const firstGenerationId = randomUUID();

    // Etapa 1 da geração que vamos continuar depois.
    await beginGeneration(userId, firstGenerationId);

    // Esgota o resto da cota do dia com outras gerações.
    for (let i = 1; i < GENERATION_QUOTA.dailyLimit; i++) {
      await beginGeneration(userId, randomUUID());
    }
    const exhausted = await beginGeneration(userId, randomUUID());
    expect(exhausted).toEqual({ allowed: false, reason: "quota_exceeded" });

    // A geração que começou ANTES da cota esgotar ainda pode continuar.
    const continueResult = await continueGeneration(userId, firstGenerationId);
    expect(continueResult).toEqual({ allowed: true });
  });

  it("rejeita continueGeneration para um generationId inexistente", async () => {
    const result = await continueGeneration(trackedUserId(), randomUUID());
    expect(result).toEqual({ allowed: false, reason: "invalid_generation" });
  });

  it("rejeita continueGeneration/beginGeneration quando o generationId pertence a OUTRO usuário", async () => {
    const ownerId = trackedUserId();
    const attackerId = trackedUserId();
    const generationId = randomUUID();

    await beginGeneration(ownerId, generationId);

    const continueAsAttacker = await continueGeneration(attackerId, generationId);
    expect(continueAsAttacker).toEqual({ allowed: false, reason: "invalid_generation" });

    const beginAsAttacker = await beginGeneration(attackerId, generationId);
    expect(beginAsAttacker).toEqual({ allowed: false, reason: "invalid_generation" });
  });

  it("rejeita reaproveitar um generationId já finalizado (replay para gerar de graça)", async () => {
    const userId = trackedUserId();
    const generationId = randomUUID();

    await beginGeneration(userId, generationId);
    await markGenerationCompleted(generationId);

    const continueAfterCompletion = await continueGeneration(userId, generationId);
    expect(continueAfterCompletion).toEqual({
      allowed: false,
      reason: "invalid_generation",
    });

    const beginAfterCompletion = await beginGeneration(userId, generationId);
    expect(beginAfterCompletion).toEqual({
      allowed: false,
      reason: "invalid_generation",
    });
  });

  it("rejeita continueGeneration para um generationId expirado (fora da janela de validade)", async () => {
    const userId = trackedUserId();
    const generationId = randomUUID();

    await beginGeneration(userId, generationId);
    // Simula uma geração iniciada bem antes da janela de validade.
    await prisma.generation.update({
      where: { id: generationId },
      data: {
        createdAt: new Date(Date.now() - GENERATION_QUOTA.generationTtlMs - 1000),
      },
    });

    const result = await continueGeneration(userId, generationId);
    expect(result).toEqual({ allowed: false, reason: "invalid_generation" });
  });
});
