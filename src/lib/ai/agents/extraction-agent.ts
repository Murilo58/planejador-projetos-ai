import { AI_CONFIG } from "@/lib/ai/config";
import { generateStructured } from "@/lib/ai/generate-structured";
import {
  buildExtractionPrompt,
  EXTRACTION_SYSTEM_INSTRUCTION,
} from "@/lib/ai/prompts/extraction";
import {
  extractionSchema,
  type ExtractionResult,
} from "@/lib/ai/schemas/extraction";

/** Agente 1 — Extração (PRD §21). */
export async function runExtractionAgent(
  specificationText: string,
): Promise<ExtractionResult> {
  return generateStructured({
    stage: "extraction",
    schema: extractionSchema,
    systemInstruction: EXTRACTION_SYSTEM_INSTRUCTION,
    prompt: buildExtractionPrompt(specificationText),
    thinkingLevel: AI_CONFIG.extractionThinkingLevel,
  });
}
