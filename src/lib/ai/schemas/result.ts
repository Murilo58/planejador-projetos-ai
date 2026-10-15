import { z } from "zod";

import { hybridResultSchema } from "@/lib/ai/schemas/hybrid-result";
import { kanbanOutputSchema } from "@/lib/ai/schemas/kanban";
import { scrumOutputSchema } from "@/lib/ai/schemas/scrum";
import { waterfallOutputSchema } from "@/lib/ai/schemas/waterfall";

/**
 * Resultado de uma geração de Scrum, Kanban ou Cascata — o contrato
 * homologado na v1.0, inalterado. Usado pela consolidação desses três
 * frameworks e pelas exportações que ainda não tratam o Híbrido.
 */
export const classicResultSchema = z.discriminatedUnion("framework", [
  z.object({
    framework: z.literal("scrum"),
    generatedAt: z.string(),
    data: scrumOutputSchema,
    notes: z.array(z.string()),
  }),
  z.object({
    framework: z.literal("kanban"),
    generatedAt: z.string(),
    data: kanbanOutputSchema,
    notes: z.array(z.string()),
  }),
  z.object({
    framework: z.literal("cascata"),
    generatedAt: z.string(),
    data: waterfallOutputSchema,
    notes: z.array(z.string()),
  }),
]);

export type ClassicResult = z.infer<typeof classicResultSchema>;

/**
 * Resultado final de uma geração, pronto para `sessionStorage` (RNF-012) e
 * para a tela de resultado. Um discriminated union por `framework` garante
 * que cada geração contenha exclusivamente os artefatos do framework
 * selecionado (RN-006) — nunca uma mistura. Inclui as duas variantes do
 * Planejamento Híbrido (v1.1), cada uma com seu próprio pacote integrado.
 */
export const consolidatedResultSchema = z.discriminatedUnion("framework", [
  ...classicResultSchema.options,
  ...hybridResultSchema.options,
]);

export type ConsolidatedResult = z.infer<typeof consolidatedResultSchema>;

export function isClassicResult(
  result: ConsolidatedResult,
): result is ClassicResult {
  return (
    result.framework === "scrum" ||
    result.framework === "kanban" ||
    result.framework === "cascata"
  );
}
