import { z } from "zod";

/**
 * Contrato de saída do Agente de Extração (PRD §22 / RF-029).
 * Apenas informações presentes ou claramente inferíveis na especificação;
 * categorias sem correspondência devem vir como lista vazia — nunca
 * inventadas (RN-003).
 */
export const extractionSchema = z.object({
  title: z
    .string()
    .optional()
    .describe("Título do projeto, se identificável na especificação."),
  objective: z
    .string()
    .optional()
    .describe("Objetivo geral do projeto, se identificável."),
  requirements: z
    .array(z.string())
    .describe("Requisitos e funcionalidades identificados no texto."),
  deliverables: z.array(z.string()).describe("Entregas identificadas."),
  stakeholders: z
    .array(z.string())
    .describe("Stakeholders mencionados explicitamente no texto."),
  assumptions: z.array(z.string()).describe("Premissas identificadas."),
  constraints: z.array(z.string()).describe("Restrições identificadas."),
  dependencies: z.array(z.string()).describe("Dependências identificadas."),
  deadlines: z
    .array(z.string())
    .describe(
      "Prazos ou datas mencionados explicitamente no texto, em formato livre.",
    ),
  milestones: z.array(z.string()).describe("Marcos identificados no texto."),
  additionalRelevantInformation: z
    .array(z.string())
    .describe(
      "Outras informações relevantes ao planejamento que não se encaixem nas categorias acima.",
    ),
});

export type ExtractionResult = z.infer<typeof extractionSchema>;
