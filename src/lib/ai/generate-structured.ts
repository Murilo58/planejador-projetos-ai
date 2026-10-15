import { ApiError } from "@google/genai";
import { z } from "zod";

import { AI_CONFIG } from "@/lib/ai/config";
import { getAiClient } from "@/lib/ai/client";
import { AiGenerationError } from "@/lib/ai/errors";
import { logAiEvent } from "@/lib/ai/log";

interface GenerateStructuredParams<T> {
  /** Nome curto da etapa, só para logs (ex.: "extraction"). */
  stage: string;
  systemInstruction: string;
  prompt: string;
  schema: z.ZodType<T>;
  /**
   * Teto de tokens de saída (inclui o raciocínio do modelo). Omitido, vale
   * `AI_CONFIG.maxOutputTokens` — o caso de Scrum, Kanban e Cascata. Só o
   * Planejamento Híbrido informa um teto maior (`hybridMaxOutputTokens`).
   */
  maxOutputTokens?: number;
}

/**
 * Chama a IA pedindo saída em JSON aderente ao schema Zod informado,
 * valida a resposta e tenta recuperação controlada em caso de falha
 * (RF-034 / RNF-029): número de tentativas limitado, sem loops.
 *
 * Nunca registra o prompt ou a resposta em log — apenas a classificação
 * do erro, quando houver (RF-066).
 */
export async function generateStructured<T>({
  stage,
  systemInstruction,
  prompt,
  schema,
  maxOutputTokens = AI_CONFIG.maxOutputTokens,
}: GenerateStructuredParams<T>): Promise<T> {
  const responseJsonSchema = z.toJSONSchema(schema);
  let lastError: unknown;

  for (let attempt = 1; attempt <= AI_CONFIG.maxAttemptsPerStage; attempt++) {
    try {
      const response = await getAiClient().models.generateContent({
        model: AI_CONFIG.model,
        contents: prompt,
        config: {
          systemInstruction,
          temperature: AI_CONFIG.temperature,
          maxOutputTokens,
          responseMimeType: "application/json",
          responseJsonSchema,
          abortSignal: AbortSignal.timeout(AI_CONFIG.timeoutMs),
        },
      });

      const blockReason = response.promptFeedback?.blockReason;
      if (blockReason) {
        throw new AiGenerationError(
          "invalid_response",
          `Conteúdo bloqueado pela IA (${blockReason}).`,
        );
      }

      const text = response.text;
      if (!text) {
        throw new AiGenerationError(
          "invalid_response",
          "A IA não retornou conteúdo.",
        );
      }

      let parsedJson: unknown;
      try {
        parsedJson = JSON.parse(text);
      } catch (jsonError) {
        throw new AiGenerationError(
          "invalid_response",
          "A resposta da IA não é um JSON válido.",
          { cause: jsonError },
        );
      }

      const result = schema.safeParse(parsedJson);
      if (!result.success) {
        throw new AiGenerationError(
          "invalid_response",
          "A resposta da IA não corresponde ao formato esperado.",
          { cause: result.error },
        );
      }

      logAiEvent("stage_succeeded", { stage, attempt });
      return result.data;
    } catch (error) {
      lastError = error;
      const classified = classifyError(error);
      const isLastAttempt = attempt >= AI_CONFIG.maxAttemptsPerStage;
      const retryDelayMs =
        !isLastAttempt && isTransientUnavailability(error)
          ? randomRetryDelayMs()
          : 0;
      logAiEvent("stage_attempt_failed", {
        stage,
        attempt,
        code: classified.code,
        retryDelayMs,
      });

      // Timeout e resposta inválida podem ser recuperados com nova
      // tentativa imediata. Já uma indisponibilidade transitória do
      // serviço (ex.: 503 "high demand", 429) não muda em milissegundos:
      // repetir na hora fazia as duas tentativas falharem juntas em ~1s
      // (observado na PoC da v1.1 — docs/v1.1/poc-fase0.md). Por isso,
      // nesses casos, a nova tentativa espera alguns segundos com jitter.
      if (isLastAttempt) {
        throw classified;
      }
      if (retryDelayMs > 0) {
        await sleep(retryDelayMs);
      }
    }
  }

  // Inalcançável (o loop sempre retorna ou lança), mas mantém o TypeScript
  // satisfeito e evita qualquer loop silencioso.
  throw classifyError(lastError);
}

/**
 * Status HTTP da API de IA que indicam indisponibilidade passageira —
 * vale esperar antes de tentar de novo. Erros sem status (falha de rede
 * antes de qualquer resposta) também entram aqui. Timeouts ficam de fora
 * de propósito: já consumiram o tempo máximo da tentativa, e esperar mais
 * só aproximaria a etapa do `maxDuration` da Server Action.
 */
const TRANSIENT_HTTP_STATUSES = new Set([429, 500, 502, 503, 504]);

function isTransientUnavailability(error: unknown): boolean {
  if (error instanceof AiGenerationError) return false;
  if (error instanceof Error && error.name === "TimeoutError") return false;
  if (error instanceof ApiError) {
    return TRANSIENT_HTTP_STATUSES.has(error.status);
  }
  return true;
}

function randomRetryDelayMs(): number {
  const { minMs, maxMs } = AI_CONFIG.transientRetryDelay;
  return Math.round(minMs + Math.random() * (maxMs - minMs));
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function classifyError(error: unknown): AiGenerationError {
  if (error instanceof AiGenerationError) {
    return error;
  }
  if (error instanceof Error && error.name === "TimeoutError") {
    return new AiGenerationError(
      "timeout",
      "A geração excedeu o tempo limite.",
      {
        cause: error,
      },
    );
  }
  return new AiGenerationError(
    "unavailable",
    "Não foi possível se comunicar com o serviço de IA.",
    { cause: error },
  );
}
