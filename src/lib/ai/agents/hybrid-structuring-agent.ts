import { AI_CONFIG } from "@/lib/ai/config";
import { generateStructured } from "@/lib/ai/generate-structured";
import {
  buildHybridPrompt,
  HYBRID_KANBAN_SYSTEM_INSTRUCTION,
  HYBRID_SCRUM_SYSTEM_INSTRUCTION,
} from "@/lib/ai/prompts/hybrid";
import type { ExtractionResult } from "@/lib/ai/schemas/extraction";
import {
  hybridKanbanOutputSchema,
  hybridScrumOutputSchema,
  type HybridKanbanOutput,
  type HybridScrumOutput,
} from "@/lib/ai/schemas/hybrid";
import type { HybridFrameworkId } from "@/lib/hybrid/frameworks";

export type HybridStructuringResult =
  | { framework: "hibrido-scrum"; data: HybridScrumOutput }
  | { framework: "hibrido-kanban"; data: HybridKanbanOutput };

/**
 * Agente 2 — Estruturação, para o Planejamento Híbrido (v1.1): uma única
 * chamada produz governança e execução vinculadas à EAP. A integridade
 * dos vínculos é verificada pelo próprio schema (`superRefine`) dentro de
 * `generateStructured` — uma violação dispara a nova tentativa
 * controlada, como qualquer resposta fora do contrato. Recebe a variante
 * escolhida pelo usuário; nunca a decide (RN-001/RN-002).
 */
export async function runHybridStructuringAgent(
  framework: HybridFrameworkId,
  extraction: ExtractionResult,
): Promise<HybridStructuringResult> {
  switch (framework) {
    case "hibrido-scrum": {
      const data = await generateStructured({
        stage: "structuring_hibrido_scrum",
        schema: hybridScrumOutputSchema,
        systemInstruction: HYBRID_SCRUM_SYSTEM_INSTRUCTION,
        prompt: buildHybridPrompt(extraction),
        maxOutputTokens: AI_CONFIG.hybridMaxOutputTokens,
      });
      return { framework, data };
    }
    case "hibrido-kanban": {
      const data = await generateStructured({
        stage: "structuring_hibrido_kanban",
        schema: hybridKanbanOutputSchema,
        systemInstruction: HYBRID_KANBAN_SYSTEM_INSTRUCTION,
        prompt: buildHybridPrompt(extraction),
        maxOutputTokens: AI_CONFIG.hybridMaxOutputTokens,
      });
      return { framework, data };
    }
  }
}
