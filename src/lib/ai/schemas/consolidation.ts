import { z } from "zod";

/**
 * Envelope genérico da saída do Agente de Consolidação (PRD §24 / RF-031):
 * os dados estruturados corrigidos (no schema do framework correspondente)
 * mais observações curtas sobre o que foi ajustado ou confirmado. O schema
 * de dados em si permanece independente por framework (spec §25) — este
 * envelope só evita duplicar a mesma estrutura três vezes.
 */
export function createConsolidationSchema<T extends z.ZodType>(dataSchema: T) {
  return z.object({
    data: dataSchema,
    notes: z
      .array(z.string())
      .describe(
        "Observações curtas sobre o que foi ajustado, removido ou confirmado durante a consolidação.",
      ),
  });
}
