import type { HybridGovernance, HybridPackage } from "@/lib/ai/schemas/hybrid";
import { createItemReference } from "@/lib/hybrid/references";
import { buildTraceabilityMatrix } from "@/lib/hybrid/traceability";

import {
  backlogToMarkdown,
  firstSprintToMarkdown,
  kanbanBoardToMarkdown,
  tapToMarkdown,
} from "./sections";

/**
 * Corpo da exportação em Markdown do Planejamento Híbrido (v1.1), na
 * mesma ordem da tela: governança (TAP, EAP codificada, fases e marcos),
 * execução ágil com o vínculo de cada item e, por fim, a matriz de
 * rastreabilidade e os pontos de atenção. Sem Kick-off.
 */
export function hybridToMarkdown(pkg: HybridPackage): string[] {
  const { data } = pkg;
  const referenceOf = createItemReference(data);
  const lines: string[] = [
    ...tapToMarkdown(data.tap),
    ...codedEapToMarkdown(data.eap.deliverables),
    ...phasesToMarkdown(data.schedule.phases),
  ];

  if (pkg.variant === "scrum") {
    const { backlog, firstSprint, macroSchedule } = pkg.data;
    lines.push(
      ...backlogToMarkdown(
        backlog.map((story) => ({
          ...story,
          reference: referenceOf(story.id, story.eapCode),
        })),
      ),
      ...firstSprintToMarkdown(
        firstSprint.selectedStoryIds.map((id) => {
          const story = backlog.find((item) => item.id === id);
          return story ? `${id} · ${story.title}` : id;
        }),
        firstSprint.rationale,
      ),
      "## Planejamento macro das Sprints",
      "",
    );
    macroSchedule.sprints.forEach((sprint) => {
      lines.push(`### ${sprint.name}`, "", sprint.focus, "");
      if (sprint.storyIds.length > 0) {
        lines.push(`Histórias: ${sprint.storyIds.join(", ")}`, "");
      }
      if (sprint.dependencies.length > 0) {
        lines.push(`Dependências: ${sprint.dependencies.join(", ")}`, "");
      }
    });
  } else {
    lines.push(
      ...kanbanBoardToMarkdown(
        pkg.data.columns,
        pkg.data.items.map((item) => ({
          ...item,
          reference: referenceOf(item.id, item.eapCode),
        })),
      ),
    );
  }

  lines.push(...traceabilityToMarkdown(pkg));
  return lines;
}

function codedEapToMarkdown(
  deliverables: HybridGovernance["eap"]["deliverables"],
): string[] {
  const lines: string[] = ["## EAP — Estrutura Analítica do Projeto", ""];
  deliverables.forEach((deliverable) => {
    lines.push(`- ${deliverable.code} ${deliverable.name}`);
    deliverable.subDeliverables?.forEach((sub) => {
      lines.push(`  - ${sub.code} ${sub.name}`);
    });
  });
  lines.push("");
  return lines;
}

function phasesToMarkdown(
  phases: HybridGovernance["schedule"]["phases"],
): string[] {
  const lines: string[] = ["## Cronograma macro — fases e marcos", ""];
  phases.forEach((phase) => {
    lines.push(`### ${phase.id} · ${phase.name}`, "");
    if (phase.eapCodes.length > 0) {
      lines.push(`Entregáveis: ${phase.eapCodes.join(", ")}`, "");
    }
    if (phase.milestones.length > 0) {
      lines.push("Marcos:");
      phase.milestones.forEach((milestone) => {
        const eap =
          milestone.eapCodes.length > 0
            ? ` (EAP ${milestone.eapCodes.join(", ")})`
            : "";
        lines.push(`- ${milestone.id} ${milestone.name}${eap}`);
      });
      lines.push("");
    }
    if (phase.dependencies.length > 0) {
      lines.push(`Dependências: ${phase.dependencies.join(", ")}`, "");
    }
  });
  return lines;
}

function traceabilityToMarkdown(pkg: HybridPackage): string[] {
  const { rows, attentionPoints, summary } = buildTraceabilityMatrix(pkg);
  const isScrum = pkg.variant === "scrum";
  const itemsLabel = isScrum ? "Histórias" : "Itens Kanban";
  const linkedLabel = isScrum ? "histórias vinculadas" : "itens vinculados";
  const refs = (list: Array<{ id: string; name?: string; title?: string }>) =>
    list.map((ref) => `${ref.id} ${ref.name ?? ref.title}`).join("; ");

  const lines: string[] = [
    "## Rastreabilidade EAP ↔ execução",
    "",
    `Entregáveis com ${linkedLabel}: ${summary.leavesWithItems} de ${summary.leaves} · ${itemsLabel}: ${summary.items} · Marcos associados à EAP: ${summary.milestonesWithEap} de ${summary.milestones}`,
    "",
    `| EAP | Entregável | Fases | Marcos | ${itemsLabel} |`,
    "| --- | --- | --- | --- | --- |",
  ];
  rows.forEach((row) => {
    const deliverable = row.subDeliverable
      ? `${row.subDeliverable.name} (em ${row.deliverable.code} ${row.deliverable.name})`
      : row.deliverable.name;
    lines.push(
      `| ${[
        row.code,
        deliverable,
        refs(row.phases) || "Nenhuma fase",
        refs(row.milestones) || "—",
        refs(row.items) || "Sem vínculo — revisar",
      ]
        .map(tableCell)
        .join(" | ")} |`,
    );
  });
  lines.push("");

  lines.push("### Pontos de atenção para revisão", "");
  if (attentionPoints.length === 0) {
    lines.push(
      "Nenhum ponto de atenção: todos os entregáveis da EAP têm itens vinculados, e fases e marcos estão associados à EAP.",
      "",
    );
  } else {
    lines.push(
      "Lacunas de vínculo a revisar — não são erros. Um entregável documental, por exemplo, pode legitimamente não ter item ágil.",
      "",
      ...attentionPoints.map((point) => `- ${point.message}`),
      "",
    );
  }

  return lines;
}

/** Célula de tabela Markdown: sem quebras de linha e com `|` escapado. */
function tableCell(value: string): string {
  return value.replace(/\r?\n/g, " ").replace(/\|/g, "\\|");
}
