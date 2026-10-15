import { z } from "zod";

import {
  hybridKanbanOutputSchema,
  hybridScrumOutputSchema,
} from "@/lib/ai/schemas/hybrid";

/**
 * Resultado final de uma geração híbrida, no mesmo formato dos demais
 * (`consolidatedResultSchema`): framework, data de geração, pacote e
 * observações da validação. Fica separado de `consolidatedResultSchema`
 * até a integração da tela de resultado e das exportações (Fases 5 e 6),
 * para que o contrato atual de Scrum, Kanban e Cascata — e todo código
 * que o consome — não mude antes disso.
 *
 * A matriz de rastreabilidade não é armazenada: é sempre recalculada a
 * partir do pacote (`buildTraceabilityMatrix`), para nunca divergir dele.
 */
export const hybridResultSchema = z.discriminatedUnion("framework", [
  z.object({
    framework: z.literal("hibrido-scrum"),
    generatedAt: z.string(),
    data: hybridScrumOutputSchema,
    notes: z.array(z.string()),
  }),
  z.object({
    framework: z.literal("hibrido-kanban"),
    generatedAt: z.string(),
    data: hybridKanbanOutputSchema,
    notes: z.array(z.string()),
  }),
]);

export type HybridResult = z.infer<typeof hybridResultSchema>;
