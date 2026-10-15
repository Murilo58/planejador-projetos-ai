import type { KanbanOutput } from "@/lib/ai/schemas/kanban";
import type { ScrumOutput } from "@/lib/ai/schemas/scrum";
import type { WaterfallOutput } from "@/lib/ai/schemas/waterfall";

/**
 * Seções da exportação em Markdown, uma por artefato. Cada framework
 * monta seu documento combinando-as (`to-markdown.ts`) — e o Planejamento
 * Híbrido (v1.1) reaproveita as da Cascata junto com as de Scrum ou
 * Kanban. Cada função devolve linhas, já com a linha em branco final.
 */

export function tapToMarkdown(tap: WaterfallOutput["tap"]): string[] {
  return [
    "## TAP — Termo de Abertura do Projeto",
    "",
    `**Objetivo:** ${tap.objective}`,
    "",
    `**Escopo resumido:** ${tap.scopeSummary}`,
    "",
    ...listSection("Stakeholders", tap.stakeholders),
    ...listSection("Critérios de sucesso", tap.successCriteria),
    ...listSection("Premissas", tap.assumptions),
    ...listSection("Restrições", tap.constraints),
  ];
}

export function eapToMarkdown(
  deliverables: WaterfallOutput["eap"]["deliverables"],
): string[] {
  const lines: string[] = ["## EAP — Estrutura Analítica do Projeto", ""];
  deliverables.forEach((deliverable) => {
    lines.push(`- ${deliverable.name}`);
    deliverable.subDeliverables?.forEach((sub) => {
      lines.push(`  - ${sub.name}`);
    });
  });
  lines.push("");
  return lines;
}

export function backlogToMarkdown(backlog: ScrumOutput["backlog"]): string[] {
  const lines: string[] = ["## Backlog priorizado", ""];

  backlog.forEach((story, index) => {
    lines.push(`### ${index + 1}. ${story.title}`);
    lines.push("");
    lines.push(story.statement);
    lines.push("");
    lines.push(
      `Valor de negócio: ${story.businessValue} · Complexidade: ${story.complexity}`,
    );
    lines.push("");
    lines.push("Critérios de aceite:");
    story.acceptanceCriteria.forEach((criterion) => {
      lines.push(`- ${criterion}`);
    });
    lines.push("");
    lines.push(`Justificativa da prioridade: ${story.priorityJustification}`);
    lines.push("");
  });

  return lines;
}

export function firstSprintToMarkdown(
  storyTitles: string[],
  rationale: string,
): string[] {
  return [
    "## Primeira Sprint sugerida",
    "",
    ...storyTitles.map((title) => `- ${title}`),
    "",
    rationale,
    "",
  ];
}

export function sprintsToMarkdown(
  sprints: ScrumOutput["macroSchedule"]["sprints"],
): string[] {
  const lines: string[] = ["## Cronograma macro", ""];
  sprints.forEach((sprint) => {
    lines.push(`### ${sprint.name}`, "", sprint.focus, "");
    if (sprint.dependencies.length > 0) {
      lines.push(`Dependências: ${sprint.dependencies.join(", ")}`, "");
    }
  });
  return lines;
}

export function kanbanBoardToMarkdown(
  columns: KanbanOutput["columns"],
  items: KanbanOutput["items"],
): string[] {
  const lines: string[] = ["## Quadro Kanban", ""];

  columns.forEach((column) => {
    const columnItems = items.filter((item) => item.column === column.name);
    lines.push(`### ${column.name}`, "");
    lines.push(`WIP: ${column.wipLimit} — ${column.wipJustification}`, "");

    if (columnItems.length === 0) {
      lines.push("_Nenhum item nesta coluna._", "");
      return;
    }

    columnItems.forEach((item) => {
      lines.push(
        `- **${item.title}** (${item.type}, prioridade ${item.priority})`,
      );
      lines.push(`  ${item.description}`);
      if (item.dependency) lines.push(`  Dependência: ${item.dependency}`);
      if (item.note) lines.push(`  Obs.: ${item.note}`);
    });
    lines.push("");
  });

  return lines;
}

export function listSection(title: string, items: string[]): string[] {
  if (items.length === 0) {
    return [`**${title}:** Não identificado na especificação.`, ""];
  }
  return [`**${title}:**`, ...items.map((item) => `- ${item}`), ""];
}
