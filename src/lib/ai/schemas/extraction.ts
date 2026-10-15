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
  successCriteria: z
    .array(z.string())
    .describe(
      "Critérios de sucesso do projeto: condições explícitas para considerar o projeto ou o produto concluído, aceito ou bem-sucedido (ex.: critérios de sucesso, condições de conclusão, critérios de aceitação do projeto, Definição de Pronto do produto/MVP). Nunca critérios de aceite de histórias, funcionalidades ou tarefas individuais. Lista vazia se o texto não os trouxer.",
    ),
  additionalRelevantInformation: z
    .array(z.string())
    .describe(
      "Outras informações relevantes ao planejamento que não se encaixem nas categorias acima.",
    ),
});

export type ExtractionResult = z.infer<typeof extractionSchema>;

/**
 * Revalidação da extração que volta do navegador entre as etapas
 * (RNF-001). Aceita também o formato anterior a `successCriteria` (v1.1)
 * — ausente vira lista vazia —, para que uma geração iniciada antes do
 * deploy não falhe na etapa seguinte. O schema enviado à IA
 * (`extractionSchema`) continua exigindo o campo.
 */
export const extractionRoundTripSchema = extractionSchema.extend({
  successCriteria: extractionSchema.shape.successCriteria.default([]),
});

/** Extração como os prompts a recebem: com ou sem `successCriteria`. */
export type ExtractionPromptInput = Omit<ExtractionResult, "successCriteria"> &
  Partial<Pick<ExtractionResult, "successCriteria">>;

/**
 * A extração sem `successCriteria`, para os frameworks sem TAP (Scrum e
 * Kanban): os dados que eles recebem permanecem exatamente os da v1.0.2,
 * e um critério de conclusão do projeto nunca vira história ou item por
 * engano. A mesma informação continua nas demais categorias (requisitos,
 * entregas…), como pede a instrução de extração.
 */
export function omitSuccessCriteria(
  extraction: ExtractionResult,
): Omit<ExtractionResult, "successCriteria"> {
  return Object.fromEntries(
    Object.entries(extraction).filter(([key]) => key !== "successCriteria"),
  ) as Omit<ExtractionResult, "successCriteria">;
}
