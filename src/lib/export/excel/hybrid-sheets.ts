import type { Cell, Workbook, Worksheet } from "exceljs";

import type {
  HybridGovernance,
  HybridKanbanOutput,
  HybridPackage,
  HybridScrumOutput,
} from "@/lib/ai/schemas/hybrid";
import { createEapLabel } from "@/lib/hybrid/references";
import {
  buildTraceabilityMatrix,
  type AttentionPointKind,
  type TraceabilityMatrix,
} from "@/lib/hybrid/traceability";

import { addTapSheet } from "./governance-sheets";
import { addBoardSheet } from "./kanban-sheet";
import { addFirstSprintSheet } from "./scrum-sheet";
import {
  applyHighlightsAfterZebra,
  applyZebraStripes,
  freezeAndFilter,
  listOrNotIdentified,
  NOT_IDENTIFIED,
  PRIORITY_STYLES,
  styleHeaderRow,
  WRAP_TOP_ALIGNMENT,
} from "./shared";

/**
 * Abas do Planejamento Híbrido (v1.1), além de "Resumo": TAP, EAP com
 * códigos, Cronograma Macro (fases e marcos), a execução ágil com o
 * vínculo de cada item (Scrum: Product Backlog, Sprint Inicial e
 * Planejamento Macro; Kanban: Quadro Inicial e Atividades) e, por fim,
 * Rastreabilidade e Pontos de Atenção. Sem Kick-off.
 */
export function addHybridSheets(
  workbook: Workbook,
  pkg: HybridPackage,
  matrix: TraceabilityMatrix = buildTraceabilityMatrix(pkg),
) {
  const eapLabel = createEapLabel(pkg.data);

  addTapSheet(workbook, pkg.data.tap);
  addCodedEapSheet(workbook, pkg.data);
  addPhasesSheet(workbook, pkg.data);

  if (pkg.variant === "scrum") {
    addLinkedBacklogSheet(workbook, pkg.data, eapLabel);
    addFirstSprintSheet(
      workbook,
      pkg.data.firstSprint.selectedStoryIds.map((id) => {
        const story = pkg.data.backlog.find((item) => item.id === id);
        return story ? `${id} · ${story.title}` : id;
      }),
      pkg.data.firstSprint.rationale,
    );
    addSprintsSheet(workbook, pkg.data);
  } else {
    addBoardSheet(workbook, pkg.data.columns);
    addLinkedItemsSheet(workbook, pkg.data, eapLabel);
  }

  addTraceabilitySheet(workbook, matrix, pkg.variant);
  addAttentionPointsSheet(workbook, matrix);
}

function wrapRow(sheet: Worksheet, values: Record<string, unknown>) {
  const row = sheet.addRow(values);
  row.eachCell({ includeEmpty: true }, (cell) => {
    cell.alignment = WRAP_TOP_ALIGNMENT;
  });
  return row;
}

function addCodedEapSheet(workbook: Workbook, data: HybridGovernance) {
  const sheet = workbook.addWorksheet("EAP");
  sheet.columns = [
    { header: "Código", key: "code", width: 10 },
    { header: "Entregável", key: "name", width: 50 },
    { header: "Nível", key: "level", width: 16 },
  ];
  styleHeaderRow(sheet.getRow(1));

  data.eap.deliverables.forEach((deliverable) => {
    const parent = wrapRow(sheet, {
      code: deliverable.code,
      name: deliverable.name,
      level: "Entregável",
    });
    parent.getCell("code").font = { bold: true };
    parent.getCell("name").font = { bold: true };
    deliverable.subDeliverables?.forEach((sub) => {
      wrapRow(sheet, {
        code: sub.code,
        name: sub.name,
        level: "Subentregável",
      });
    });
  });

  applyZebraStripes(sheet, 2, sheet.rowCount);
  freezeAndFilter(sheet, "C", sheet.rowCount);
}

function addPhasesSheet(workbook: Workbook, data: HybridGovernance) {
  const sheet = workbook.addWorksheet("Cronograma Macro");
  sheet.columns = [
    { header: "Fase", key: "id", width: 8 },
    { header: "Nome", key: "name", width: 30 },
    { header: "Entregáveis (EAP)", key: "eapCodes", width: 20 },
    { header: "Marcos", key: "milestones", width: 45 },
    { header: "Dependências", key: "dependencies", width: 40 },
  ];
  styleHeaderRow(sheet.getRow(1));

  data.schedule.phases.forEach((phase) => {
    wrapRow(sheet, {
      id: phase.id,
      name: phase.name,
      eapCodes: phase.eapCodes.join(", ") || NOT_IDENTIFIED,
      milestones: listOrNotIdentified(
        phase.milestones.map(
          (milestone) =>
            `${milestone.id} ${milestone.name}${
              milestone.eapCodes.length > 0
                ? ` (EAP ${milestone.eapCodes.join(", ")})`
                : ""
            }`,
        ),
      ),
      dependencies: listOrNotIdentified(phase.dependencies),
    });
  });

  applyZebraStripes(sheet, 2, sheet.rowCount);
  freezeAndFilter(sheet, "E", sheet.rowCount);
}

function addLinkedBacklogSheet(
  workbook: Workbook,
  data: HybridScrumOutput,
  eapLabel: (code: string) => string,
) {
  const sheet = workbook.addWorksheet("Product Backlog");
  sheet.columns = [
    { header: "#", key: "order", width: 6 },
    { header: "ID", key: "id", width: 9 },
    { header: "EAP", key: "eap", width: 28 },
    { header: "Título", key: "title", width: 28 },
    { header: "História", key: "statement", width: 45 },
    { header: "Critérios de aceite", key: "acceptanceCriteria", width: 50 },
    { header: "Valor de negócio", key: "businessValue", width: 16 },
    { header: "Complexidade", key: "complexity", width: 16 },
    {
      header: "Justificativa da prioridade",
      key: "priorityJustification",
      width: 45,
    },
  ];
  styleHeaderRow(sheet.getRow(1));

  const highlights: Array<[Cell, string]> = [];
  data.backlog.forEach((story, index) => {
    const row = wrapRow(sheet, {
      order: index + 1,
      id: story.id,
      eap: eapLabel(story.eapCode),
      title: story.title,
      statement: story.statement,
      acceptanceCriteria: story.acceptanceCriteria
        .map((criterion) => `• ${criterion}`)
        .join("\n"),
      businessValue: "",
      complexity: "",
      priorityJustification: story.priorityJustification,
    });

    const businessValueCell = row.getCell("businessValue");
    businessValueCell.value = PRIORITY_STYLES[story.businessValue].label;
    highlights.push([businessValueCell, story.businessValue]);

    const complexityCell = row.getCell("complexity");
    complexityCell.value = PRIORITY_STYLES[story.complexity].label;
    highlights.push([complexityCell, story.complexity]);
  });

  applyZebraStripes(sheet, 2, sheet.rowCount);
  applyHighlightsAfterZebra(highlights);
  freezeAndFilter(sheet, "I", sheet.rowCount);
}

function addSprintsSheet(workbook: Workbook, data: HybridScrumOutput) {
  const sheet = workbook.addWorksheet("Planejamento Macro");
  sheet.columns = [
    { header: "Sprint", key: "name", width: 20 },
    { header: "Foco", key: "focus", width: 45 },
    { header: "Histórias", key: "storyIds", width: 24 },
    { header: "Dependências", key: "dependencies", width: 40 },
  ];
  styleHeaderRow(sheet.getRow(1));

  data.macroSchedule.sprints.forEach((sprint) => {
    wrapRow(sheet, {
      name: sprint.name,
      focus: sprint.focus,
      storyIds: sprint.storyIds.join(", ") || NOT_IDENTIFIED,
      dependencies: listOrNotIdentified(sprint.dependencies),
    });
  });

  applyZebraStripes(sheet, 2, sheet.rowCount);
  freezeAndFilter(sheet, "D", sheet.rowCount);
}

function addLinkedItemsSheet(
  workbook: Workbook,
  data: HybridKanbanOutput,
  eapLabel: (code: string) => string,
) {
  const sheet = workbook.addWorksheet("Atividades");
  sheet.columns = [
    { header: "ID", key: "id", width: 9 },
    { header: "EAP", key: "eap", width: 28 },
    { header: "Título", key: "title", width: 26 },
    { header: "Descrição", key: "description", width: 45 },
    { header: "Classificação", key: "type", width: 18 },
    { header: "Prioridade", key: "priority", width: 14 },
    { header: "Coluna (status inicial)", key: "column", width: 24 },
    { header: "Dependência", key: "dependency", width: 28 },
    { header: "Observação", key: "note", width: 28 },
  ];
  styleHeaderRow(sheet.getRow(1));

  const highlights: Array<[Cell, string]> = [];
  data.items.forEach((item) => {
    const row = wrapRow(sheet, {
      id: item.id,
      eap: eapLabel(item.eapCode),
      title: item.title,
      description: item.description,
      type: item.type,
      priority: "",
      column: item.column,
      dependency: item.dependency ?? NOT_IDENTIFIED,
      note: item.note ?? NOT_IDENTIFIED,
    });

    const priorityCell = row.getCell("priority");
    priorityCell.value = PRIORITY_STYLES[item.priority].label;
    highlights.push([priorityCell, item.priority]);
  });

  applyZebraStripes(sheet, 2, sheet.rowCount);
  applyHighlightsAfterZebra(highlights);
  freezeAndFilter(sheet, "I", sheet.rowCount);
}

function addTraceabilitySheet(
  workbook: Workbook,
  matrix: TraceabilityMatrix,
  variant: HybridPackage["variant"],
) {
  const sheet = workbook.addWorksheet("Rastreabilidade");
  sheet.columns = [
    { header: "EAP", key: "code", width: 8 },
    { header: "Entregável", key: "deliverable", width: 32 },
    { header: "Subentregável", key: "subDeliverable", width: 32 },
    { header: "Fases", key: "phases", width: 28 },
    { header: "Marcos", key: "milestones", width: 32 },
    {
      header: variant === "scrum" ? "Histórias" : "Itens Kanban",
      key: "items",
      width: 40,
    },
    { header: "Situação", key: "status", width: 22 },
  ];
  styleHeaderRow(sheet.getRow(1));

  const refs = (list: Array<{ id: string; name: string }>) =>
    list.map((ref) => `• ${ref.id} ${ref.name}`).join("\n");

  const highlights: Array<[Cell, string]> = [];
  matrix.rows.forEach((row) => {
    const linked = row.items.length > 0;
    const sheetRow = wrapRow(sheet, {
      code: row.code,
      deliverable: `${row.deliverable.code} ${row.deliverable.name}`,
      subDeliverable: row.subDeliverable?.name ?? "—",
      phases: refs(row.phases) || "Nenhuma fase",
      milestones: refs(row.milestones) || "—",
      items:
        refs(row.items.map(({ id, title }) => ({ id, name: title }))) ||
        "Sem vínculo — revisar",
      status: linked ? "Vinculado" : "Sem vínculo — revisar",
    });
    sheetRow.getCell("code").font = { bold: true };
    if (!linked) {
      // Mesma cor de atenção (âmbar) da tela — sempre com o texto.
      highlights.push([sheetRow.getCell("status"), "media"]);
    }
  });

  applyZebraStripes(sheet, 2, sheet.rowCount);
  applyHighlightsAfterZebra(highlights);
  freezeAndFilter(sheet, "G", sheet.rowCount);
}

const ATTENTION_KIND_LABEL: Record<AttentionPointKind, string> = {
  entregavel_sem_item: "Entregável sem item",
  entregavel_sem_fase: "Entregável sem fase",
  item_em_entregavel_agregador: "Vínculo pouco preciso",
  fase_sem_entregavel: "Fase sem entregável",
  marco_sem_entregavel: "Marco sem entregável",
  historia_fora_das_sprints: "História fora das Sprints",
};

function addAttentionPointsSheet(
  workbook: Workbook,
  matrix: TraceabilityMatrix,
) {
  const sheet = workbook.addWorksheet("Pontos de Atenção");
  sheet.columns = [
    { header: "Tipo", key: "kind", width: 26 },
    { header: "Referência", key: "ref", width: 12 },
    { header: "Descrição", key: "message", width: 80 },
  ];
  styleHeaderRow(sheet.getRow(1));

  if (matrix.attentionPoints.length === 0) {
    wrapRow(sheet, {
      kind: "—",
      ref: "—",
      message:
        "Nenhum ponto de atenção: todos os entregáveis da EAP têm itens vinculados, e fases e marcos estão associados à EAP.",
    });
    return;
  }

  matrix.attentionPoints.forEach((point) => {
    wrapRow(sheet, {
      kind: ATTENTION_KIND_LABEL[point.kind],
      ref: point.ref,
      message: point.message,
    });
  });

  sheet.addRow([]);
  const note = sheet.addRow([
    "Lacunas de vínculo a revisar — não são erros. Um entregável documental, por exemplo, pode legitimamente não ter item ágil.",
  ]);
  note.getCell(1).font = { italic: true };

  applyZebraStripes(sheet, 2, matrix.attentionPoints.length + 1);
  freezeAndFilter(sheet, "C", matrix.attentionPoints.length + 1);
}
