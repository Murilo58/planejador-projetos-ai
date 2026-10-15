import {
  eapCodesOf,
  executionItemsOf,
  type HybridPackage,
} from "@/lib/ai/schemas/hybrid";

/**
 * Matriz de rastreabilidade do Planejamento Híbrido: EAP → fases →
 * marcos → itens de execução, calculada em código a partir dos vínculos
 * (`eapCode`, `eapCodes`) — nunca gerada pela IA. Função pura: a mesma
 * matriz alimenta a tela de resultado e as exportações (PDF, Excel,
 * TXT/MD), garantindo que todas mostrem exatamente os mesmos vínculos.
 *
 * Cada linha é uma FOLHA da EAP: o subentregável ou, quando o entregável
 * não tem subentregáveis, o próprio entregável. Vínculos ao entregável
 * agregador (código "1" quando existem "1.1", "1.2"…) aparecem na própria
 * linha de cada folha herdada (fases e marcos) ou como ponto de atenção
 * (itens), sem duplicar o item em todas as folhas.
 *
 * Lacunas são PONTOS DE ATENÇÃO para revisão, nunca erros: um entregável
 * documental, por exemplo, pode legitimamente não ter item ágil. A
 * integridade referencial (códigos inexistentes, duplicidades) já é
 * garantida antes, por `findHybridIntegrityIssues`.
 */

export type AttentionPointKind =
  | "entregavel_sem_item"
  | "entregavel_sem_fase"
  | "item_em_entregavel_agregador"
  | "fase_sem_entregavel"
  | "marco_sem_entregavel"
  | "historia_fora_das_sprints";

export interface AttentionPoint {
  kind: AttentionPointKind;
  /** Código EAP, id de fase, de marco ou de item a que o ponto se refere. */
  ref: string;
  message: string;
}

export interface TraceabilityRow {
  /** Código da folha da EAP ("1.2", ou "3" se o entregável não tem filhos). */
  code: string;
  deliverable: { code: string; name: string };
  subDeliverable?: { code: string; name: string };
  phases: Array<{ id: string; name: string }>;
  milestones: Array<{ id: string; name: string }>;
  items: Array<{ id: string; title: string }>;
}

export interface TraceabilityMatrix {
  rows: TraceabilityRow[];
  attentionPoints: AttentionPoint[];
  summary: {
    leaves: number;
    leavesWithItems: number;
    items: number;
    /** Itens vinculados a uma folha (o vínculo mais preciso possível). */
    itemsOnLeaves: number;
    milestones: number;
    milestonesWithEap: number;
  };
}

export function buildTraceabilityMatrix(
  pkg: HybridPackage,
): TraceabilityMatrix {
  const { data } = pkg;
  const items = executionItemsOf(pkg);
  const phases = data.schedule.phases;
  const allMilestones = phases.flatMap((phase) => phase.milestones);

  // Uma referência ao entregável agregador cobre todas as suas folhas.
  const covers = (refs: string[], leafCode: string, parentCode: string) =>
    refs.includes(leafCode) || refs.includes(parentCode);

  const rows: TraceabilityRow[] = [];
  const attentionPoints: AttentionPoint[] = [];

  for (const deliverable of data.eap.deliverables) {
    const subs = deliverable.subDeliverables ?? [];
    const leaves =
      subs.length > 0
        ? subs.map((sub) => ({ code: sub.code, sub }))
        : [{ code: deliverable.code, sub: undefined }];

    for (const leaf of leaves) {
      const row: TraceabilityRow = {
        code: leaf.code,
        deliverable: { code: deliverable.code, name: deliverable.name },
        ...(leaf.sub
          ? { subDeliverable: { code: leaf.sub.code, name: leaf.sub.name } }
          : {}),
        phases: phases
          .filter((phase) =>
            covers(phase.eapCodes, leaf.code, deliverable.code),
          )
          .map(({ id, name }) => ({ id, name })),
        milestones: allMilestones
          .filter((milestone) =>
            covers(milestone.eapCodes, leaf.code, deliverable.code),
          )
          .map(({ id, name }) => ({ id, name })),
        items: items
          .filter((item) => item.eapCode === leaf.code)
          .map(({ id, title }) => ({ id, title })),
      };
      rows.push(row);

      const label = `${leaf.code} ${leaf.sub?.name ?? deliverable.name}`;
      if (row.items.length === 0) {
        attentionPoints.push({
          kind: "entregavel_sem_item",
          ref: leaf.code,
          message: `${label}: nenhum item de execução vinculado. Revise se é esperado (ex.: entregável documental) ou se falta trabalho no ${pkg.variant === "scrum" ? "backlog" : "quadro"}.`,
        });
      }
      if (row.phases.length === 0) {
        attentionPoints.push({
          kind: "entregavel_sem_fase",
          ref: leaf.code,
          message: `${label}: não está associado a nenhuma fase do cronograma macro.`,
        });
      }
    }

    if (subs.length > 0) {
      for (const item of items) {
        if (item.eapCode === deliverable.code) {
          attentionPoints.push({
            kind: "item_em_entregavel_agregador",
            ref: item.id,
            message: `${item.id} está vinculado ao entregável ${deliverable.code} ${deliverable.name}, e não a um de seus subentregáveis — vínculo menos preciso.`,
          });
        }
      }
    }
  }

  for (const phase of phases) {
    if (phase.eapCodes.length === 0) {
      attentionPoints.push({
        kind: "fase_sem_entregavel",
        ref: phase.id,
        message: `Fase ${phase.id} ${phase.name}: não produz nenhum entregável da EAP.`,
      });
    }
    for (const milestone of phase.milestones) {
      if (milestone.eapCodes.length === 0) {
        attentionPoints.push({
          kind: "marco_sem_entregavel",
          ref: milestone.id,
          message: `Marco ${milestone.id} ${milestone.name}: não está associado a nenhum entregável da EAP.`,
        });
      }
    }
  }

  if (pkg.variant === "scrum") {
    const scheduled = new Set(
      pkg.data.macroSchedule.sprints.flatMap((sprint) => sprint.storyIds),
    );
    for (const story of pkg.data.backlog) {
      if (!scheduled.has(story.id)) {
        attentionPoints.push({
          kind: "historia_fora_das_sprints",
          ref: story.id,
          message: `${story.id} ${story.title}: não está prevista em nenhuma Sprint do cronograma macro.`,
        });
      }
    }
  }

  const leafCodes = new Set(rows.map((row) => row.code));
  const codeSet = new Set(eapCodesOf(data));
  return {
    rows,
    attentionPoints,
    summary: {
      leaves: rows.length,
      leavesWithItems: rows.filter((row) => row.items.length > 0).length,
      items: items.length,
      itemsOnLeaves: items.filter(
        (item) => leafCodes.has(item.eapCode) && codeSet.has(item.eapCode),
      ).length,
      milestones: allMilestones.length,
      milestonesWithEap: allMilestones.filter(
        (milestone) => milestone.eapCodes.length > 0,
      ).length,
    },
  };
}
