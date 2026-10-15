import { z } from "zod";

import { kanbanOutputSchema } from "@/lib/ai/schemas/kanban";
import { scrumOutputSchema } from "@/lib/ai/schemas/scrum";
import { waterfallOutputSchema } from "@/lib/ai/schemas/waterfall";

/**
 * Contrato de saída do Planejamento Híbrido (v1.1): governança preditiva
 * (TAP, EAP codificada, cronograma macro com fases e marcos) integrada à
 * execução ágil — Scrum (backlog, primeira Sprint, Sprints macro) ou
 * Kanban (quadro, itens, WIP) — com rastreabilidade obrigatória entre os
 * entregáveis da EAP e os itens de execução.
 *
 * Gerado por uma ÚNICA chamada de estruturação (decisão da Fase 0,
 * docs/v1.1/poc-fase0.md); o mesmo schema é usado pela consolidação.
 * Kick-off fora do escopo da v1.1.
 *
 * As peças reaproveitadas de Cascata, Scrum e Kanban são obtidas via
 * `.shape`/`.element` — os schemas desses três frameworks não são
 * alterados (contrato congelado em `ai-contract.baseline.test.ts`).
 *
 * A integridade referencial é verificada deterministicamente em código
 * (`findHybridIntegrityIssues`, ligada ao schema via `superRefine`) — não
 * depende da IA. O `superRefine` não aparece no JSON Schema enviado ao
 * Gemini, mas vale no `safeParse` de `generateStructured`, então uma
 * violação dispara a nova tentativa controlada. Lacunas de cobertura
 * (entregável sem item, fase sem entregável…) NÃO são erro: viram pontos
 * de atenção em `buildTraceabilityMatrix` (src/lib/hybrid/traceability.ts).
 */

export type HybridVariant = "scrum" | "kanban";

const tapSchema = waterfallOutputSchema.shape.tap;
const backlogItemBase = scrumOutputSchema.shape.backlog.element;
const firstSprintRationale =
  scrumOutputSchema.shape.firstSprint.shape.rationale;
const kanbanColumnSchema = kanbanOutputSchema.shape.columns.element;
const kanbanItemBase = kanbanOutputSchema.shape.items.element;

// --- Governança preditiva (comum às duas variantes) -----------------------

/** Código de entregável ("1") ou subentregável ("1.2"). */
export const EAP_CODE_PATTERN = /^[1-9]\d*(\.[1-9]\d*)?$/;

const eapSubDeliverableSchema = z.object({
  code: z
    .string()
    .describe(
      'Código do subentregável: código do entregável pai + "." + sequência ("1.1", "1.2", "2.1"…). Único em toda a EAP.',
    ),
  name: z
    .string()
    .describe(
      "Nome do subentregável (substantivo, não uma atividade/verbo de ação).",
    ),
});

const eapDeliverableSchema = z.object({
  code: z
    .string()
    .describe(
      'Código do entregável de alto nível: "1", "2", "3"… Único em toda a EAP.',
    ),
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

const milestoneSchema = z.object({
  id: z
    .string()
    .describe(
      'Identificador do marco: "M1", "M2"… Único em todo o cronograma.',
    ),
  name: z.string().describe("Nome do marco, derivado da especificação."),
  eapCodes: z
    .array(z.string())
    .describe(
      "Códigos da EAP cuja conclusão caracteriza este marco. Somente códigos existentes na EAP.",
    ),
});

const phaseSchema = z.object({
  id: z.string().describe('Identificador da fase: "F1", "F2"… Único.'),
  name: z.string(),
  eapCodes: z
    .array(z.string())
    .describe(
      "Códigos da EAP produzidos (total ou parcialmente) nesta fase. Somente códigos existentes na EAP.",
    ),
  milestones: z.array(milestoneSchema),
  dependencies: z
    .array(z.string())
    .describe(
      "Dependências relevantes entre fases, sem detalhamento operacional de tarefas.",
    ),
});

const governanceShape = {
  tap: tapSchema,
  eap: z.object({ deliverables: z.array(eapDeliverableSchema).min(1) }),
  schedule: z.object({
    phases: z
      .array(phaseSchema)
      .min(1)
      .describe(
        "Fases e marcos, em sequência lógica. Usar datas apenas se identificadas na especificação; nunca inventar calendário.",
      ),
  }),
};

const eapCodeLinkDescription =
  "Código da EAP ao qual este item está vinculado — preferir o nó mais específico (subentregável). Somente códigos existentes na EAP.";

// --- Execução ágil — Cascata + Scrum --------------------------------------

const hybridBacklogItemSchema = z.object({
  id: z
    .string()
    .describe('Identificador da história: "US-01", "US-02"… Único.'),
  eapCode: z.string().describe(eapCodeLinkDescription),
  ...backlogItemBase.shape,
});

const hybridScrumShape = {
  ...governanceShape,
  backlog: z
    .array(hybridBacklogItemSchema)
    .min(1)
    .describe(
      "Backlog priorizado — a ordem dos itens no array representa a ordem de prioridade.",
    ),
  firstSprint: z.object({
    selectedStoryIds: z
      .array(z.string())
      .describe(
        "Ids das histórias do backlog selecionadas para a primeira Sprint.",
      ),
    rationale: firstSprintRationale,
  }),
  macroSchedule: z.object({
    sprints: z
      .array(
        z.object({
          name: z.string().describe('Ex.: "Sprint 1".'),
          focus: z.string().describe("Foco principal da Sprint."),
          storyIds: z
            .array(z.string())
            .describe("Ids das histórias previstas para esta Sprint."),
          dependencies: z
            .array(z.string())
            .describe(
              "Dependências relevantes, sem inventar datas ou duração.",
            ),
        }),
      )
      .min(1),
  }),
};

// --- Execução ágil — Cascata + Kanban -------------------------------------

const hybridKanbanItemSchema = z.object({
  id: z.string().describe('Identificador do item: "KB-01", "KB-02"… Único.'),
  eapCode: z.string().describe(eapCodeLinkDescription),
  ...kanbanItemBase.shape,
});

const hybridKanbanShape = {
  ...governanceShape,
  columns: z.array(kanbanColumnSchema).min(1),
  items: z.array(hybridKanbanItemSchema).min(1),
};

// --- Schemas exportados -----------------------------------------------------

export const hybridScrumOutputSchema = z
  .object(hybridScrumShape)
  .superRefine((value, ctx) => {
    for (const message of findHybridIntegrityIssues({
      variant: "scrum",
      data: value,
    })) {
      ctx.addIssue({ code: "custom", message });
    }
  });

export const hybridKanbanOutputSchema = z
  .object(hybridKanbanShape)
  .superRefine((value, ctx) => {
    for (const message of findHybridIntegrityIssues({
      variant: "kanban",
      data: value,
    })) {
      ctx.addIssue({ code: "custom", message });
    }
  });

// Tipos derivados do shape (não do schema refinado), para evitar uma
// referência circular com o `superRefine` que os utiliza.
export type HybridScrumOutput = z.infer<z.ZodObject<typeof hybridScrumShape>>;
export type HybridKanbanOutput = z.infer<z.ZodObject<typeof hybridKanbanShape>>;
export type HybridGovernance = z.infer<z.ZodObject<typeof governanceShape>>;
export type HybridEapDeliverable = z.infer<typeof eapDeliverableSchema>;

export type HybridPackage =
  | { variant: "scrum"; data: HybridScrumOutput }
  | { variant: "kanban"; data: HybridKanbanOutput };

/** Item de execução (história ou item Kanban) visto pela rastreabilidade. */
export interface ExecutionItemRef {
  id: string;
  title: string;
  eapCode: string;
}

export function executionItemsOf(pkg: HybridPackage): ExecutionItemRef[] {
  const items = pkg.variant === "scrum" ? pkg.data.backlog : pkg.data.items;
  return items.map(({ id, title, eapCode }) => ({ id, title, eapCode }));
}

/** Todos os códigos da EAP, na ordem em que aparecem. */
export function eapCodesOf(governance: HybridGovernance): string[] {
  return governance.eap.deliverables.flatMap((deliverable) => [
    deliverable.code,
    ...(deliverable.subDeliverables ?? []).map((sub) => sub.code),
  ]);
}

// --- Integridade referencial ---------------------------------------------

/**
 * Violações de integridade do pacote híbrido, como mensagens legíveis.
 * Lista vazia = pacote íntegro. Função pura — reutilizada pelo schema
 * (`superRefine`) e disponível para testes e diagnósticos.
 *
 * São erro apenas: identificadores duplicados ou malformados e
 * referências a algo que não existe. Lacunas de cobertura não são erro.
 */
export function findHybridIntegrityIssues(pkg: HybridPackage): string[] {
  const issues: string[] = [];
  const { data } = pkg;

  // EAP: formato, hierarquia e unicidade dos códigos.
  const codes: string[] = [];
  for (const deliverable of data.eap.deliverables) {
    codes.push(deliverable.code);
    if (
      !EAP_CODE_PATTERN.test(deliverable.code) ||
      deliverable.code.includes(".")
    ) {
      issues.push(
        `Entregável "${deliverable.name}" tem código inválido "${deliverable.code}" (esperado "1", "2"…).`,
      );
    }
    for (const sub of deliverable.subDeliverables ?? []) {
      codes.push(sub.code);
      const [parent, child] = sub.code.split(".");
      if (!EAP_CODE_PATTERN.test(sub.code) || child === undefined) {
        issues.push(
          `Subentregável "${sub.name}" tem código inválido "${sub.code}" (esperado "${deliverable.code}.1", "${deliverable.code}.2"…).`,
        );
      } else if (parent !== deliverable.code) {
        issues.push(
          `Subentregável "${sub.code}" não pertence ao entregável pai "${deliverable.code}".`,
        );
      }
    }
  }
  pushDuplicates(issues, codes, "Código EAP");
  const codeSet = new Set(codes);

  // Cronograma: fases e marcos.
  const phases = data.schedule.phases;
  pushDuplicates(
    issues,
    phases.map((phase) => phase.id),
    "Id de fase",
  );
  pushDuplicates(
    issues,
    phases.flatMap((phase) =>
      phase.milestones.map((milestone) => milestone.id),
    ),
    "Id de marco",
  );
  for (const phase of phases) {
    for (const code of phase.eapCodes) {
      if (!codeSet.has(code)) {
        issues.push(
          `Fase "${phase.id}" referencia código EAP inexistente "${code}".`,
        );
      }
    }
    for (const milestone of phase.milestones) {
      for (const code of milestone.eapCodes) {
        if (!codeSet.has(code)) {
          issues.push(
            `Marco "${milestone.id}" referencia código EAP inexistente "${code}".`,
          );
        }
      }
    }
  }

  // Execução: itens vinculados à EAP.
  const items = executionItemsOf(pkg);
  const itemIds = items.map((item) => item.id);
  pushDuplicates(issues, itemIds, "Id de item");
  for (const item of items) {
    if (!codeSet.has(item.eapCode)) {
      issues.push(
        `Item "${item.id}" vinculado a código EAP inexistente "${item.eapCode}".`,
      );
    }
  }

  const itemIdSet = new Set(itemIds);
  if (pkg.variant === "scrum") {
    for (const id of pkg.data.firstSprint.selectedStoryIds) {
      if (!itemIdSet.has(id)) {
        issues.push(`Primeira Sprint cita história inexistente "${id}".`);
      }
    }
    for (const sprint of pkg.data.macroSchedule.sprints) {
      for (const id of sprint.storyIds) {
        if (!itemIdSet.has(id)) {
          issues.push(`"${sprint.name}" cita história inexistente "${id}".`);
        }
      }
    }
  } else {
    const columnNames = pkg.data.columns.map((column) => column.name);
    pushDuplicates(issues, columnNames, "Nome de coluna");
    const columnSet = new Set(columnNames);
    for (const item of pkg.data.items) {
      if (!columnSet.has(item.column)) {
        issues.push(
          `Item "${item.id}" está na coluna inexistente "${item.column}".`,
        );
      }
    }
  }

  return issues;
}

function pushDuplicates(issues: string[], values: string[], label: string) {
  const seen = new Set<string>();
  const reported = new Set<string>();
  for (const value of values) {
    if (seen.has(value) && !reported.has(value)) {
      issues.push(`${label} duplicado: "${value}".`);
      reported.add(value);
    }
    seen.add(value);
  }
}
