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
          maxOutputTokens: AI_CONFIG.maxOutputTokens,
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
      logAiEvent("stage_attempt_failed", {
        stage,
        attempt,
        code: classified.code,
      });

      // Timeout e resposta inválida podem ser recuperados com nova
      // tentativa; indisponibilidade do serviço normalmente não muda em
      // milissegundos, mas uma segunda tentativa ainda é barata e segura.
      if (attempt >= AI_CONFIG.maxAttemptsPerStage) {
        throw classified;
      }
    }
  }

  // Inalcançável (o loop sempre retorna ou lança), mas mantém o TypeScript
  // satisfeito e evita qualquer loop silencioso.
  throw classifyError(lastError);
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
