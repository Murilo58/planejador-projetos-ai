import { z } from "zod";

import { MAX_TEXT_LENGTH, MIN_TEXT_LENGTH } from "@/lib/specification/limits";

/**
 * Payload validado da etapa de entrada — consumido pela Etapa 4
 * (agente de Extração). Nunca inclui o PDF original (RN-008): apenas o
 * texto já extraído no navegador, a origem e o framework escolhido
 * manualmente pelo usuário (RN-001, RN-002).
 */
export const specificationInputSchema = z.object({
  sourceType: z.enum(["text", "pdf"]),
  fileName: z.string().trim().min(1).optional(),
  text: z
    .string()
    .trim()
    .min(
      MIN_TEXT_LENGTH,
      `A especificação deve ter pelo menos ${MIN_TEXT_LENGTH} caracteres.`,
    )
    .max(
      MAX_TEXT_LENGTH,
      `A especificação deve ter no máximo ${MAX_TEXT_LENGTH} caracteres.`,
    ),
  framework: z.enum(["scrum", "kanban", "cascata"]),
});

export type SpecificationInput = z.infer<typeof specificationInputSchema>;
