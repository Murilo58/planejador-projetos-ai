import { z } from "zod";

/**
 * Contrato de saída da Cascata (PRD §11.3 / spec §36-40).
 * Exclusivamente: TAP, EAP, cronograma macro e material de Kick-off.
 */

const NOT_IDENTIFIED_HINT =
  'Usar exatamente "Não identificado na especificação." quando a informação não existir no texto.';

const tapSchema = z.object({
  objective: z.string().describe(`Objetivo do projeto. ${NOT_IDENTIFIED_HINT}`),
  scopeSummary: z
    .string()
    .describe(`Escopo resumido do projeto. ${NOT_IDENTIFIED_HINT}`),
  stakeholders: z
    .array(z.string())
    .describe("Stakeholders identificados na especificação."),
  successCriteria: z
    .array(z.string())
    .describe("Critérios de sucesso identificados na especificação."),
  assumptions: z.array(z.string()).describe("Premissas identificadas."),
  constraints: z.array(z.string()).describe("Restrições identificadas."),
});

/**
 * EAP em dois níveis fixos (entregável → subentregáveis): cada nó é um
 * entregável (nunca uma atividade como "realizar reunião" ou "desenvolver
 * código"), seguindo a regra dos 100% — os subentregáveis de um entregável
 * devem, juntos, representá-lo totalmente.
 *
 * Deliberadamente não recursiva: o Gemini não suporta de forma confiável
 * `$ref`/schemas autorreferentes em `responseJsonSchema` (confirmado via
 * inspeção do JSON Schema gerado pelo Zod — `z.lazy` produzia `"$ref": "#"`,
 * padrão rejeitado pela API em muitos casos). Dois níveis já representam
 * adequadamente uma EAP macro para o MVP.
 */
const eapSubDeliverableSchema = z.object({
  name: z
    .string()
    .describe(
      "Nome do subentregável (substantivo, não uma atividade/verbo de ação).",
    ),
});

const eapDeliverableSchema = z.object({
  name: z
    .string()
    .describe(
      "Nome do entregável de alto nível (substantivo, não uma atividade/verbo de ação).",
    ),
  subDeliverables: z
    .array(eapSubDeliverableSchema)
    .optional()
    .describe(
      "Subentregáveis que, juntos, representam totalmente este entregável (regra dos 100%).",
    ),
});

export type EapDeliverable = z.infer<typeof eapDeliverableSchema>;

const scheduleSchema = z.object({
  phases: z
    .array(
      z.object({
        name: z.string(),
        milestones: z.array(z.string()),
        dependencies: z
          .array(z.string())
          .describe(
            "Dependências relevantes entre fases, sem detalhamento operacional de tarefas.",
          ),
      }),
    )
    .min(1)
    .describe(
      "Fases e marcos, em sequência lógica. Usar datas apenas se identificadas na especificação; nunca inventar calendário.",
    ),
});

const kickoffSchema = z.object({
  title: z.string(),
  objective: z.string(),
  scope: z.string(),
  keyMilestones: z.array(z.string()),
  rolesAndResponsibilities: z
    .array(
      z.object({
        role: z.string(),
        responsibility: z.string(),
      }),
    )
    .describe("Papéis e responsabilidades identificados na especificação."),
});

export const waterfallOutputSchema = z.object({
  tap: tapSchema,
  eap: z.object({
    deliverables: z.array(eapDeliverableSchema).min(1),
  }),
  schedule: scheduleSchema,
  kickoff: kickoffSchema,
});

export type WaterfallOutput = z.infer<typeof waterfallOutputSchema>;
