import type { ConsolidatedResult } from "@/lib/ai/schemas/result";
import type { ScrumOutput } from "@/lib/ai/schemas/scrum";
import type { KanbanOutput } from "@/lib/ai/schemas/kanban";
import type { WaterfallOutput } from "@/lib/ai/schemas/waterfall";
import { FRAMEWORKS } from "@/lib/frameworks";

/**
 * Exportação para texto (RF-055 / PRD OQ-002).
 *
 * Resolve a questão aberta do PRD a favor de `.md`: o resultado tem
 * hierarquia (seções, listas, itens aninhados) que Markdown representa
 * de forma legível tanto em um editor de texto simples quanto em
 * qualquer visualizador de Markdown — sem exigir nenhuma ferramenta além
 * de um editor de texto.
 *
 * Usa exclusivamente o resultado já processado (RF-056): nenhuma chamada
 * à IA, nenhum dado novo. Nunca inclui prompt, nome interno de agente ou
 * informação técnica da API (RF-058).
 */
export function buildMarkdownExport(result: ConsolidatedResult): {
  filename: string;
  content: string;
} {
  const frameworkName =
    FRAMEWORKS.find((item) => item.id === result.framework)?.name ??
    result.framework;
  const generatedAt = new Date(result.generatedAt);

  const header = [
    `# Planejamento — ${frameworkName}`,
    "",
    `Gerado por Planejador de Projetos AI em ${generatedAt.toLocaleString("pt-BR")}.`,
    "",
  ];

  const body =
    result.framework === "scrum"
      ? scrumToMarkdown(result.data)
      : result.framework === "kanban"
        ? kanbanToMarkdown(result.data)
        : cascataToMarkdown(result.data);

  const datePart = generatedAt.toISOString().slice(0, 10);
  const filename = `planejamento-${result.framework}-${datePart}.md`;

  return { filename, content: [...header, ...body].join("\n") };
}

function scrumToMarkdown(data: ScrumOutput): string[] {
  const lines: string[] = ["## Backlog priorizado", ""];

  data.backlog.forEach((story, index) => {
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

  lines.push("## Primeira Sprint sugerida", "");
  data.firstSprint.selectedStoryTitles.forEach((title) => {
    lines.push(`- ${title}`);
  });
  lines.push("", data.firstSprint.rationale, "");

  lines.push("## Cronograma macro", "");
  data.macroSchedule.sprints.forEach((sprint) => {
    lines.push(`### ${sprint.name}`, "", sprint.focus, "");
    if (sprint.dependencies.length > 0) {
      lines.push(`Dependências: ${sprint.dependencies.join(", ")}`, "");
    }
  });

  return lines;
}

function kanbanToMarkdown(data: KanbanOutput): string[] {
  const lines: string[] = ["## Quadro Kanban", ""];

  data.columns.forEach((column) => {
    const items = data.items.filter((item) => item.column === column.name);
    lines.push(`### ${column.name}`, "");
    lines.push(`WIP: ${column.wipLimit} — ${column.wipJustification}`, "");

    if (items.length === 0) {
      lines.push("_Nenhum item nesta coluna._", "");
      return;
    }

    items.forEach((item) => {
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

function cascataToMarkdown(data: WaterfallOutput): string[] {
  const lines: string[] = [];

  lines.push("## TAP — Termo de Abertura do Projeto", "");
  lines.push(`**Objetivo:** ${data.tap.objective}`, "");
  lines.push(`**Escopo resumido:** ${data.tap.scopeSummary}`, "");
  lines.push(...listSection("Stakeholders", data.tap.stakeholders));
  lines.push(...listSection("Critérios de sucesso", data.tap.successCriteria));
  lines.push(...listSection("Premissas", data.tap.assumptions));
  lines.push(...listSection("Restrições", data.tap.constraints));

  lines.push("## EAP — Estrutura Analítica do Projeto", "");
  data.eap.deliverables.forEach((deliverable) => {
    lines.push(`- ${deliverable.name}`);
    deliverable.subDeliverables?.forEach((sub) => {
      lines.push(`  - ${sub.name}`);
    });
  });
  lines.push("");

  lines.push("## Cronograma macro", "");
  data.schedule.phases.forEach((phase) => {
    lines.push(`### ${phase.name}`, "");
    if (phase.milestones.length > 0) {
      lines.push(`Marcos: ${phase.milestones.join(", ")}`, "");
    }
    if (phase.dependencies.length > 0) {
      lines.push(`Dependências: ${phase.dependencies.join(", ")}`, "");
    }
  });

  lines.push("## Material de Kick-off", "");
  lines.push(`### ${data.kickoff.title}`, "");
  lines.push(`**Objetivo:** ${data.kickoff.objective}`, "");
  lines.push(`**Escopo:** ${data.kickoff.scope}`, "");
  lines.push(...listSection("Principais marcos", data.kickoff.keyMilestones));
  lines.push("**Papéis e responsabilidades:**", "");
  if (data.kickoff.rolesAndResponsibilities.length === 0) {
    lines.push("Não identificado na especificação.", "");
  } else {
    data.kickoff.rolesAndResponsibilities.forEach((item) => {
      lines.push(`- **${item.role}:** ${item.responsibility}`);
    });
    lines.push("");
  }

  return lines;
}

function listSection(title: string, items: string[]): string[] {
  if (items.length === 0) {
    return [`**${title}:** Não identificado na especificação.`, ""];
  }
  return [`**${title}:**`, ...items.map((item) => `- ${item}`), ""];
}
