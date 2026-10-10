import { z } from "zod";

/**
 * Contrato de saída do Kanban (PRD §11.2 / spec §32-35).
 * Exclusivamente: quadro inicial (colunas), itens classificados e
 * priorizados, e limites de WIP justificados.
 */

const priorityLevel = z.enum(["alta", "media", "baixa"]);

const kanbanColumnSchema = z.object({
  name: z
    .string()
    .describe(
      "Nome da coluna. Usar a estrutura padrão (Backlog, A Fazer, Em Andamento, Revisão, Concluído) salvo quando a especificação justificar claramente outro fluxo.",
    ),
  wipLimit: z
    .string()
    .describe(
      'Limite de WIP sugerido para a coluna, como texto curto (ex.: "3"), ou uma breve explicação de por que não se aplica limite a esta coluna (ex.: "Sem limite — coluna de entrada").',
    ),
  wipJustification: z
    .string()
    .describe(
      "Justificativa do limite de WIP (ou de não haver limite). Nunca afirmar que é matematicamente ideal sem dados históricos; não assumir tamanho de equipe.",
    ),
});

const kanbanItemSchema = z.object({
  title: z.string(),
  description: z
    .string()
    .describe("Descrição do item, derivada da especificação."),
  type: z
    .string()
    .describe(
      "Classificação do item (ex.: funcionalidade, melhoria, tarefa técnica).",
    ),
  priority: priorityLevel,
  column: z.string().describe("Nome da coluna à qual o item pertence."),
  dependency: z
    .string()
    .optional()
    .describe("Dependência relevante, apenas se presente na especificação."),
  note: z
    .string()
    .optional()
    .describe("Observação relevante, apenas se presente na especificação."),
});

export const kanbanOutputSchema = z.object({
  columns: z.array(kanbanColumnSchema).min(1),
  items: z.array(kanbanItemSchema).min(1),
});

export type KanbanOutput = z.infer<typeof kanbanOutputSchema>;
