import type { ConsolidatedResult } from "@/lib/ai/schemas/result";
import type { ScrumOutput } from "@/lib/ai/schemas/scrum";
import type { KanbanOutput } from "@/lib/ai/schemas/kanban";
import type { WaterfallOutput } from "@/lib/ai/schemas/waterfall";
import { FRAMEWORKS } from "@/lib/frameworks";
import { HYBRID_LABEL, isHybridFrameworkId } from "@/lib/hybrid/frameworks";

import {
  backlogToMarkdown,
  eapToMarkdown,
  firstSprintToMarkdown,
  kanbanBoardToMarkdown,
  listSection,
  sprintsToMarkdown,
  tapToMarkdown,
} from "./markdown/sections";
import { hybridToMarkdown } from "./markdown/hybrid";

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
  const generatedAt = new Date(result.generatedAt);
  // "Planejamento Híbrido — Cascata + Scrum" (o rótulo já traz o travessão).
  const title = isHybridFrameworkId(result.framework)
    ? `# Planejamento ${HYBRID_LABEL[result.framework]}`
    : `# Planejamento — ${
        FRAMEWORKS.find((item) => item.id === result.framework)?.name ??
        result.framework
      }`;

  const header = [
    title,
    "",
    `Gerado por Planejador de Projetos AI em ${generatedAt.toLocaleString("pt-BR")}.`,
    "",
  ];

  const body = bodyOf(result);

  const datePart = generatedAt.toISOString().slice(0, 10);
  const filename = `planejamento-${result.framework}-${datePart}.md`;

  return { filename, content: [...header, ...body].join("\n") };
}

function bodyOf(result: ConsolidatedResult): string[] {
  switch (result.framework) {
    case "scrum":
      return scrumToMarkdown(result.data);
    case "kanban":
      return kanbanToMarkdown(result.data);
    case "cascata":
      return cascataToMarkdown(result.data);
    case "hibrido-scrum":
      return hybridToMarkdown({ variant: "scrum", data: result.data });
    case "hibrido-kanban":
      return hybridToMarkdown({ variant: "kanban", data: result.data });
  }
}

function scrumToMarkdown(data: ScrumOutput): string[] {
  return [
    ...backlogToMarkdown(data.backlog),
    ...firstSprintToMarkdown(
      data.firstSprint.selectedStoryTitles,
      data.firstSprint.rationale,
    ),
    ...sprintsToMarkdown(data.macroSchedule.sprints),
  ];
}

function kanbanToMarkdown(data: KanbanOutput): string[] {
  return kanbanBoardToMarkdown(data.columns, data.items);
}

function cascataToMarkdown(data: WaterfallOutput): string[] {
  const lines: string[] = [
    ...tapToMarkdown(data.tap),
    ...eapToMarkdown(data.eap.deliverables),
  ];

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
