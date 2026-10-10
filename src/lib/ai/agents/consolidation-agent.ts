import { z } from "zod";

import { generateStructured } from "@/lib/ai/generate-structured";
import {
  buildConsolidationPrompt,
  CONSOLIDATION_SYSTEM_INSTRUCTION,
} from "@/lib/ai/prompts/consolidation";
import { createConsolidationSchema } from "@/lib/ai/schemas/consolidation";
import type { ExtractionResult } from "@/lib/ai/schemas/extraction";

/**
 * Agente 3 — Consolidação (PRD §24).
 * Valida aderência ao framework, duplicidades, consistência interna e
 * possíveis informações inventadas; devolve a versão final dos dados
 * (no schema do framework) e observações curtas. Não reinterpreta a
 * especificação do zero — recebe apenas os dados já extraídos e o pacote
 * já estruturado.
 */
export async function runConsolidationAgent<T extends z.ZodType>({
  frameworkLabel,
  stage,
  dataSchema,
  extraction,
  structuredOutput,
}: {
  frameworkLabel: string;
  stage: string;
  dataSchema: T;
  extraction: ExtractionResult;
  structuredOutput: z.infer<T>;
}): Promise<{ data: z.infer<T>; notes: string[] }> {
  const schema = createConsolidationSchema(dataSchema);

  // `z.infer` sobre um schema construído a partir de T genérico não reduz
  // para o tipo simples abaixo (limitação de inferência do Zod sobre
  // schemas genéricos, não uma incerteza real de runtime: a validação via
  // `schema.safeParse` dentro de `generateStructured` já garante o shape).
  const result = await generateStructured({
    stage,
    schema,
    systemInstruction: CONSOLIDATION_SYSTEM_INSTRUCTION,
    prompt: buildConsolidationPrompt({
      frameworkLabel,
      extraction,
      structuredOutput,
    }),
  });

  return result as { data: z.infer<T>; notes: string[] };
}
