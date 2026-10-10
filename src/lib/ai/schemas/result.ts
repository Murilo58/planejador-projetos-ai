import { z } from "zod";

import { kanbanOutputSchema } from "@/lib/ai/schemas/kanban";
import { scrumOutputSchema } from "@/lib/ai/schemas/scrum";
import { waterfallOutputSchema } from "@/lib/ai/schemas/waterfall";

/**
 * Resultado final de uma geração, pronto para `sessionStorage` (RNF-012) e
 * para a tela de resultado. Um discriminated union por `framework` garante
 * que cada geração contenha exclusivamente os artefatos do framework
 * selecionado (RN-006) — nunca uma mistura dos três.
 */
export const consolidatedResultSchema = z.discriminatedUnion("framework", [
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

export type ConsolidatedResult = z.infer<typeof consolidatedResultSchema>;
