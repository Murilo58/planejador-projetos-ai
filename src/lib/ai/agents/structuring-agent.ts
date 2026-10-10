import type { FrameworkId } from "@/lib/frameworks";
import { generateStructured } from "@/lib/ai/generate-structured";
import {
  buildScrumPrompt,
  SCRUM_SYSTEM_INSTRUCTION,
} from "@/lib/ai/prompts/scrum";
import {
  buildKanbanPrompt,
  KANBAN_SYSTEM_INSTRUCTION,
} from "@/lib/ai/prompts/kanban";
import {
  buildWaterfallPrompt,
  WATERFALL_SYSTEM_INSTRUCTION,
} from "@/lib/ai/prompts/waterfall";
import type { ExtractionResult } from "@/lib/ai/schemas/extraction";
import { scrumOutputSchema, type ScrumOutput } from "@/lib/ai/schemas/scrum";
import { kanbanOutputSchema, type KanbanOutput } from "@/lib/ai/schemas/kanban";
import {
  waterfallOutputSchema,
  type WaterfallOutput,
} from "@/lib/ai/schemas/waterfall";

export type StructuringResult =
  | { framework: "scrum"; data: ScrumOutput }
  | { framework: "kanban"; data: KanbanOutput }
  | { framework: "cascata"; data: WaterfallOutput };

/**
 * Agente 2 — Estruturação (PRD §23).
 * Recebe o framework escolhido pelo usuário e os dados do Agente de
 * Extração; nunca decide ou troca o framework (RN-001/RN-002) — apenas
 * aplica a instrução e o schema correspondentes ao que já foi escolhido.
 */
export async function runStructuringAgent(
  framework: FrameworkId,
  extraction: ExtractionResult,
): Promise<StructuringResult> {
  switch (framework) {
    case "scrum": {
      const data = await generateStructured({
        stage: "structuring_scrum",
        schema: scrumOutputSchema,
        systemInstruction: SCRUM_SYSTEM_INSTRUCTION,
        prompt: buildScrumPrompt(extraction),
      });
      return { framework: "scrum", data };
    }
    case "kanban": {
      const data = await generateStructured({
        stage: "structuring_kanban",
        schema: kanbanOutputSchema,
        systemInstruction: KANBAN_SYSTEM_INSTRUCTION,
        prompt: buildKanbanPrompt(extraction),
      });
      return { framework: "kanban", data };
    }
    case "cascata": {
      const data = await generateStructured({
        stage: "structuring_cascata",
        schema: waterfallOutputSchema,
        systemInstruction: WATERFALL_SYSTEM_INSTRUCTION,
        prompt: buildWaterfallPrompt(extraction),
      });
      return { framework: "cascata", data };
    }
  }
}
