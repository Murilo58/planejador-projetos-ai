import { z } from "zod";

/**
 * Contrato de saída do Scrum (PRD §11.1 / spec §26-31).
 * Exclusivamente: backlog priorizado (histórias + critérios de aceite),
 * sugestão da primeira Sprint e cronograma macro. Nenhum outro artefato.
 */

const priorityLevel = z.enum(["alta", "media", "baixa"]);

const backlogItemSchema = z.object({
  title: z.string().describe("Título curto da história."),
  statement: z
    .string()
    .describe(
      'Formato "Como [perfil], quero [necessidade], para [benefício]" quando um perfil puder ser identificado com segurança; caso contrário, uma formulação adequada sem inventar stakeholder.',
    ),
  acceptanceCriteria: z
    .array(z.string())
    .min(1)
    .describe(
      "Critérios objetivos, verificáveis e derivados da especificação.",
    ),
  businessValue: priorityLevel.describe("Valor de negócio estimado."),
  complexity: priorityLevel.describe("Complexidade estimada."),
  priorityJustification: z
    .string()
    .describe(
      "Justificativa da priorização (valor de negócio × complexidade), sem falsa precisão.",
    ),
});

export const scrumOutputSchema = z.object({
  backlog: z
    .array(backlogItemSchema)
    .min(1)
    .describe(
      "Backlog priorizado — a ordem dos itens no array representa a ordem de prioridade.",
    ),
  firstSprint: z.object({
    selectedStoryTitles: z
      .array(z.string())
      .describe(
        "Títulos das histórias do backlog selecionadas para a primeira Sprint.",
      ),
    rationale: z
      .string()
      .describe(
        "Razão da escolha dos itens da primeira Sprint, sem assumir velocidade, story points, capacidade ou quantidade de desenvolvedores.",
      ),
  }),
  macroSchedule: z.object({
    sprints: z
      .array(
        z.object({
          name: z.string().describe('Ex.: "Sprint 1".'),
          focus: z.string().describe("Foco principal da Sprint."),
          dependencies: z
            .array(z.string())
            .describe(
              "Dependências relevantes, sem inventar datas ou duração.",
            ),
        }),
      )
      .min(1),
  }),
});

export type ScrumOutput = z.infer<typeof scrumOutputSchema>;
