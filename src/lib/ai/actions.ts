"use server";

import { auth } from "@/auth";
import { runConsolidationAgent } from "@/lib/ai/agents/consolidation-agent";
import { runExtractionAgent } from "@/lib/ai/agents/extraction-agent";
import {
  runStructuringAgent,
  type StructuringResult,
} from "@/lib/ai/agents/structuring-agent";
import { AiGenerationError, type AiErrorCode } from "@/lib/ai/errors";
import { logAiEvent } from "@/lib/ai/log";
import {
  extractionSchema,
  type ExtractionResult,
} from "@/lib/ai/schemas/extraction";
import {
  consolidatedResultSchema,
  type ConsolidatedResult,
} from "@/lib/ai/schemas/result";
import { kanbanOutputSchema } from "@/lib/ai/schemas/kanban";
import { scrumOutputSchema } from "@/lib/ai/schemas/scrum";
import { waterfallOutputSchema } from "@/lib/ai/schemas/waterfall";
import type { FrameworkId } from "@/lib/frameworks";
import {
  beginGeneration,
  continueGeneration,
  generationIdSchema,
  markGenerationCompleted,
  type GenerationGateResult,
} from "@/lib/rate-limit/generation-quota";
import { specificationInputSchema } from "@/lib/specification/schema";

export type StageResult<T> =
  | { success: true; data: T }
  | {
      success: false;
      code:
        | AiErrorCode
        | "validation"
        | "session_expired"
        | "quota_exceeded"
        | "invalid_generation";
      message: string;
    };

/**
 * Cada Server Action da geração revalida a sessão (FE-10): o `proxy.ts`
 * protege apenas o carregamento das páginas, não as chamadas de servidor
 * já em andamento — se a sessão expirar no meio do fluxo, a próxima etapa
 * não pode simplesmente continuar consumindo a IA. Retorna o id do
 * usuário (não só um booleano) porque as 3 etapas agora também precisam
 * dele para os controles de cota (A1).
 */
async function requireUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

const SESSION_EXPIRED_RESULT = {
  success: false as const,
  code: "session_expired" as const,
  message: "Sua sessão expirou. Faça login novamente para continuar.",
};

const QUOTA_EXCEEDED_RESULT = {
  success: false as const,
  code: "quota_exceeded" as const,
  message:
    "Você atingiu o limite de gerações por hoje. Tente novamente mais tarde.",
};

const INVALID_GENERATION_RESULT = {
  success: false as const,
  code: "invalid_generation" as const,
  message: "Não foi possível continuar esta geração. Inicie uma nova.",
};

const GENERATION_UNAVAILABLE_RESULT = {
  success: false as const,
  code: "unavailable" as const,
  message:
    "O serviço de IA está indisponível no momento. Tente novamente em alguns instantes.",
};

function toGenerationGateFailure(
  gate: Extract<GenerationGateResult, { allowed: false }>,
) {
  return gate.reason === "quota_exceeded"
    ? QUOTA_EXCEEDED_RESULT
    : INVALID_GENERATION_RESULT;
}

const FRIENDLY_MESSAGES: Record<AiErrorCode, string> = {
  unavailable:
    "O serviço de IA está indisponível no momento. Tente novamente em alguns instantes.",
  timeout: "A geração excedeu o tempo limite. Tente novamente.",
  invalid_response:
    "Não foi possível gerar um resultado válido a partir da sua especificação. Tente novamente ou revise o conteúdo enviado.",
};

function toStageFailure(error: unknown): {
  success: false;
  code: AiErrorCode;
  message: string;
} {
  const classified =
    error instanceof AiGenerationError
      ? error
      : new AiGenerationError("unavailable", "Erro inesperado.", {
          cause: error,
        });
  logAiEvent("stage_failed", { code: classified.code });
  return {
    success: false,
    code: classified.code,
    message: FRIENDLY_MESSAGES[classified.code],
  };
}

/**
 * Etapa 1 — Extração. Revalida a entrada (nunca confiar apenas na
 * validação já feita no cliente — RNF-001) antes de consumir a IA.
 */
export async function runExtractionStep(input: {
  sourceType: "text" | "pdf";
  fileName?: string;
  text: string;
  framework: FrameworkId;
  generationId: string;
}): Promise<StageResult<ExtractionResult>> {
  const userId = await requireUserId();
  if (!userId) {
    return SESSION_EXPIRED_RESULT;
  }

  const parsedGenerationId = generationIdSchema.safeParse(input.generationId);
  const parsed = specificationInputSchema.safeParse(input);
  if (!parsedGenerationId.success || !parsed.success) {
    return {
      success: false,
      code: "validation",
      message: "A especificação informada é inválida.",
    };
  }

  let gate: GenerationGateResult;
  try {
    gate = await beginGeneration(userId, parsedGenerationId.data);
  } catch {
    return GENERATION_UNAVAILABLE_RESULT;
  }
  if (!gate.allowed) {
    return toGenerationGateFailure(gate);
  }

  try {
    const data = await runExtractionAgent(parsed.data.text);
    return { success: true, data };
  } catch (error) {
    return toStageFailure(error);
  }
}

/**
 * Etapa 2 — Estruturação. Revalida os dados de extração recebidos de
 * volta do cliente antes de usá-los (fronteira de confiança).
 */
export async function runStructuringStep(
  framework: FrameworkId,
  extraction: ExtractionResult,
  generationId: string,
): Promise<StageResult<StructuringResult>> {
  const userId = await requireUserId();
  if (!userId) {
    return SESSION_EXPIRED_RESULT;
  }

  const parsedGenerationId = generationIdSchema.safeParse(generationId);
  const parsedExtraction = extractionSchema.safeParse(extraction);
  if (!parsedGenerationId.success || !parsedExtraction.success) {
    return {
      success: false,
      code: "validation",
      message: "Os dados extraídos são inválidos.",
    };
  }

  let gate: GenerationGateResult;
  try {
    gate = await continueGeneration(userId, parsedGenerationId.data);
  } catch {
    return GENERATION_UNAVAILABLE_RESULT;
  }
  if (!gate.allowed) {
    return toGenerationGateFailure(gate);
  }

  try {
    const data = await runStructuringAgent(framework, parsedExtraction.data);
    return { success: true, data };
  } catch (error) {
    return toStageFailure(error);
  }
}

/**
 * Etapa 3 — Consolidação. Produz o resultado final já no formato
 * consumido pela tela de resultado (sessionStorage, RNF-012).
 */
export async function runConsolidationStep(
  framework: FrameworkId,
  extraction: ExtractionResult,
  structuring: StructuringResult,
  generationId: string,
): Promise<StageResult<ConsolidatedResult>> {
  const userId = await requireUserId();
  if (!userId) {
    return SESSION_EXPIRED_RESULT;
  }

  const parsedGenerationId = generationIdSchema.safeParse(generationId);
  const parsedExtraction = extractionSchema.safeParse(extraction);
  if (
    !parsedGenerationId.success ||
    !parsedExtraction.success ||
    structuring.framework !== framework
  ) {
    return {
      success: false,
      code: "validation",
      message: "Os dados estruturados são inválidos.",
    };
  }

  let gate: GenerationGateResult;
  try {
    gate = await continueGeneration(userId, parsedGenerationId.data);
  } catch {
    return GENERATION_UNAVAILABLE_RESULT;
  }
  if (!gate.allowed) {
    return toGenerationGateFailure(gate);
  }

  try {
    let consolidated: { data: unknown; notes: string[] };

    switch (structuring.framework) {
      case "scrum": {
        const parsedStructuring = scrumOutputSchema.safeParse(structuring.data);
        if (!parsedStructuring.success) {
          return {
            success: false,
            code: "validation",
            message: "Os dados estruturados são inválidos.",
          };
        }
        consolidated = await runConsolidationAgent({
          frameworkLabel: "Scrum",
          stage: "consolidation_scrum",
          dataSchema: scrumOutputSchema,
          extraction: parsedExtraction.data,
          structuredOutput: parsedStructuring.data,
        });
        break;
      }
      case "kanban": {
        const parsedStructuring = kanbanOutputSchema.safeParse(
          structuring.data,
        );
        if (!parsedStructuring.success) {
          return {
            success: false,
            code: "validation",
            message: "Os dados estruturados são inválidos.",
          };
        }
        consolidated = await runConsolidationAgent({
          frameworkLabel: "Kanban",
          stage: "consolidation_kanban",
          dataSchema: kanbanOutputSchema,
          extraction: parsedExtraction.data,
          structuredOutput: parsedStructuring.data,
        });
        break;
      }
      case "cascata": {
        const parsedStructuring = waterfallOutputSchema.safeParse(
          structuring.data,
        );
        if (!parsedStructuring.success) {
          return {
            success: false,
            code: "validation",
            message: "Os dados estruturados são inválidos.",
          };
        }
        consolidated = await runConsolidationAgent({
          frameworkLabel: "Cascata",
          stage: "consolidation_cascata",
          dataSchema: waterfallOutputSchema,
          extraction: parsedExtraction.data,
          structuredOutput: parsedStructuring.data,
        });
        break;
      }
    }

    const result = consolidatedResultSchema.safeParse({
      framework,
      generatedAt: new Date().toISOString(),
      data: consolidated.data,
      notes: consolidated.notes,
    });

    if (!result.success) {
      logAiEvent("stage_failed", { code: "invalid_response" });
      return {
        success: false,
        code: "invalid_response",
        message: FRIENDLY_MESSAGES.invalid_response,
      };
    }

    await markGenerationCompleted(parsedGenerationId.data);
    return { success: true, data: result.data };
  } catch (error) {
    return toStageFailure(error);
  }
}
