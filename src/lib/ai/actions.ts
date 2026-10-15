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
  classicResultSchema,
  type ClassicResult,
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
import {
  runHybridStructuringAgent,
  type HybridStructuringResult,
} from "@/lib/ai/agents/hybrid-structuring-agent";
import { AI_CONFIG } from "@/lib/ai/config";
import { HYBRID_CONSOLIDATION_ADDENDUM } from "@/lib/ai/prompts/hybrid";
import {
  hybridKanbanOutputSchema,
  hybridScrumOutputSchema,
} from "@/lib/ai/schemas/hybrid";
import {
  hybridResultSchema,
  type HybridResult,
} from "@/lib/ai/schemas/hybrid-result";
import {
  HYBRID_LABEL,
  hybridFrameworkIdSchema,
  hybridSpecificationInputSchema,
  isHybridPlanningEnabled,
  type HybridFrameworkId,
} from "@/lib/hybrid/frameworks";

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

  return extractForGeneration(
    userId,
    parsedGenerationId.data,
    parsed.data.text,
  );
}

/**
 * Abre a geração (cobrança única da cota — A1) e executa o Agente de
 * Extração. Compartilhado pela Etapa 1 de todos os frameworks, inclusive
 * o Planejamento Híbrido: a extração não depende do framework.
 */
async function extractForGeneration(
  userId: string,
  generationId: string,
  text: string,
): Promise<StageResult<ExtractionResult>> {
  let gate: GenerationGateResult;
  try {
    gate = await beginGeneration(userId, generationId);
  } catch {
    return GENERATION_UNAVAILABLE_RESULT;
  }
  if (!gate.allowed) {
    return toGenerationGateFailure(gate);
  }

  try {
    const data = await runExtractionAgent(text);
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
): Promise<StageResult<ClassicResult>> {
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

    const result = classicResultSchema.safeParse({
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

// --- Planejamento Híbrido (v1.1) ------------------------------------------
//
// Mesmas 3 etapas e mesmas garantias dos demais frameworks (sessão
// revalidada, cota cobrada uma única vez na Etapa 1, entrada revalidada a
// cada fronteira), em actions próprias: as actions de Scrum, Kanban e
// Cascata acima não mudam de assinatura nem de comportamento. Todas
// respeitam a feature flag no servidor (`isHybridPlanningEnabled`) — com
// ela desligada, nenhuma etapa do Híbrido consome a IA ou a cota.

const HYBRID_DISABLED_RESULT = {
  success: false as const,
  code: "validation" as const,
  message: "O Planejamento Híbrido não está disponível no momento.",
};

const INVALID_STRUCTURED_DATA_RESULT = {
  success: false as const,
  code: "validation" as const,
  message: "Os dados estruturados são inválidos.",
};

/** Etapa 1 — Extração, para o Planejamento Híbrido. */
export async function runHybridExtractionStep(input: {
  sourceType: "text" | "pdf";
  fileName?: string;
  text: string;
  framework: HybridFrameworkId;
  generationId: string;
}): Promise<StageResult<ExtractionResult>> {
  if (!isHybridPlanningEnabled()) {
    return HYBRID_DISABLED_RESULT;
  }

  const userId = await requireUserId();
  if (!userId) {
    return SESSION_EXPIRED_RESULT;
  }

  const parsedGenerationId = generationIdSchema.safeParse(input.generationId);
  const parsed = hybridSpecificationInputSchema.safeParse(input);
  if (!parsedGenerationId.success || !parsed.success) {
    return {
      success: false,
      code: "validation",
      message: "A especificação informada é inválida.",
    };
  }

  return extractForGeneration(
    userId,
    parsedGenerationId.data,
    parsed.data.text,
  );
}

/**
 * Etapa 2 — Estruturação híbrida: uma única chamada gera governança e
 * execução vinculadas à EAP (decisão da Fase 0 da v1.1).
 */
export async function runHybridStructuringStep(
  framework: HybridFrameworkId,
  extraction: ExtractionResult,
  generationId: string,
): Promise<StageResult<HybridStructuringResult>> {
  if (!isHybridPlanningEnabled()) {
    return HYBRID_DISABLED_RESULT;
  }

  const userId = await requireUserId();
  if (!userId) {
    return SESSION_EXPIRED_RESULT;
  }

  const parsedFramework = hybridFrameworkIdSchema.safeParse(framework);
  const parsedGenerationId = generationIdSchema.safeParse(generationId);
  const parsedExtraction = extractionSchema.safeParse(extraction);
  if (
    !parsedFramework.success ||
    !parsedGenerationId.success ||
    !parsedExtraction.success
  ) {
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
    const data = await runHybridStructuringAgent(
      parsedFramework.data,
      parsedExtraction.data,
    );
    return { success: true, data };
  } catch (error) {
    return toStageFailure(error);
  }
}

/**
 * Etapa 3 — Consolidação híbrida. O pacote estruturado volta do cliente e
 * é revalidado (inclusive a integridade dos vínculos com a EAP) antes de
 * consumir a IA; o resultado consolidado é validado de novo pelo mesmo
 * contrato antes de ser devolvido.
 */
export async function runHybridConsolidationStep(
  framework: HybridFrameworkId,
  extraction: ExtractionResult,
  structuring: HybridStructuringResult,
  generationId: string,
): Promise<StageResult<HybridResult>> {
  if (!isHybridPlanningEnabled()) {
    return HYBRID_DISABLED_RESULT;
  }

  const userId = await requireUserId();
  if (!userId) {
    return SESSION_EXPIRED_RESULT;
  }

  const parsedFramework = hybridFrameworkIdSchema.safeParse(framework);
  const parsedGenerationId = generationIdSchema.safeParse(generationId);
  const parsedExtraction = extractionSchema.safeParse(extraction);
  if (
    !parsedFramework.success ||
    !parsedGenerationId.success ||
    !parsedExtraction.success ||
    structuring.framework !== parsedFramework.data
  ) {
    return INVALID_STRUCTURED_DATA_RESULT;
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

    switch (parsedFramework.data) {
      case "hibrido-scrum": {
        const parsedStructuring = hybridScrumOutputSchema.safeParse(
          structuring.data,
        );
        if (!parsedStructuring.success) {
          return INVALID_STRUCTURED_DATA_RESULT;
        }
        consolidated = await runConsolidationAgent({
          frameworkLabel: HYBRID_LABEL["hibrido-scrum"],
          stage: "consolidation_hibrido_scrum",
          dataSchema: hybridScrumOutputSchema,
          extraction: parsedExtraction.data,
          structuredOutput: parsedStructuring.data,
          additionalInstruction: HYBRID_CONSOLIDATION_ADDENDUM,
          maxOutputTokens: AI_CONFIG.hybridMaxOutputTokens,
        });
        break;
      }
      case "hibrido-kanban": {
        const parsedStructuring = hybridKanbanOutputSchema.safeParse(
          structuring.data,
        );
        if (!parsedStructuring.success) {
          return INVALID_STRUCTURED_DATA_RESULT;
        }
        consolidated = await runConsolidationAgent({
          frameworkLabel: HYBRID_LABEL["hibrido-kanban"],
          stage: "consolidation_hibrido_kanban",
          dataSchema: hybridKanbanOutputSchema,
          extraction: parsedExtraction.data,
          structuredOutput: parsedStructuring.data,
          additionalInstruction: HYBRID_CONSOLIDATION_ADDENDUM,
          maxOutputTokens: AI_CONFIG.hybridMaxOutputTokens,
        });
        break;
      }
    }

    const result = hybridResultSchema.safeParse({
      framework: parsedFramework.data,
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
