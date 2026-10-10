import type { Workbook } from "exceljs";

import type { ScrumOutput } from "@/lib/ai/schemas/scrum";

import {
  applyPriorityStyle,
  applyZebraStripes,
  freezeAndFilter,
  styleHeaderRow,
  WRAP_TOP_ALIGNMENT,
} from "./shared";

/**
 * Abas do Scrum (além de "Resumo"): Product Backlog, Sprint Inicial e
 * Planejamento Macro — exatamente os 3 artefatos do
 * `scrumOutputSchema` (`src/lib/ai/schemas/scrum.ts`).
 */
export function addScrumSheets(workbook: Workbook, data: ScrumOutput) {
  addBacklogSheet(workbook, data);
  addFirstSprintSheet(workbook, data);
  addMacroScheduleSheet(workbook, data);
}

function addBacklogSheet(workbook: Workbook, data: ScrumOutput) {
  const sheet = workbook.addWorksheet("Product Backlog");
  sheet.columns = [
    { header: "#", key: "order", width: 6 },
    { header: "Título", key: "title", width: 28 },
    { header: "História", key: "statement", width: 45 },
    {
      header: "Critérios de aceite",
      key: "acceptanceCriteria",
      width: 50,
    },
    { header: "Valor de negócio", key: "businessValue", width: 16 },
    { header: "Complexidade", key: "complexity", width: 16 },
    { header: "Justificativa da prioridade", key: "priorityJustification", width: 45 },
  ];
  styleHeaderRow(sheet.getRow(1));

  data.backlog.forEach((story, index) => {
    const row = sheet.addRow({
      order: index + 1,
      title: story.title,
      statement: story.statement,
      // Critérios de aceite exportados integralmente — uma linha por
      // critério dentro da mesma célula (nunca truncados ou resumidos).
      acceptanceCriteria: story.acceptanceCriteria
        .map((criterion) => `• ${criterion}`)
        .join("\n"),
      businessValue: "",
      complexity: "",
      priorityJustification: story.priorityJustification,
    });
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.alignment = WRAP_TOP_ALIGNMENT;
    });

    const businessValueCell = row.getCell("businessValue");
    businessValueCell.value = labelFor(story.businessValue);
    applyPriorityStyle(businessValueCell, story.businessValue);

    const complexityCell = row.getCell("complexity");
    complexityCell.value = labelFor(story.complexity);
    applyPriorityStyle(complexityCell, story.complexity);
  });

  applyZebraStripes(sheet, 2, sheet.rowCount);
  freezeAndFilter(sheet, "G", sheet.rowCount);
}

function addFirstSprintSheet(workbook: Workbook, data: ScrumOutput) {
  const sheet = workbook.addWorksheet("Sprint Inicial");
  sheet.columns = [
    { header: "História selecionada", key: "title", width: 45 },
  ];
  styleHeaderRow(sheet.getRow(1));

  data.firstSprint.selectedStoryTitles.forEach((title) => {
    sheet.addRow({ title }).getCell(1).alignment = WRAP_TOP_ALIGNMENT;
  });
  applyZebraStripes(sheet, 2, sheet.rowCount);

  sheet.addRow([]);
  const rationaleHeader = sheet.addRow(["Justificativa da escolha"]);
  rationaleHeader.getCell(1).font = { bold: true };
  const rationaleRow = sheet.addRow([data.firstSprint.rationale]);
  rationaleRow.getCell(1).alignment = WRAP_TOP_ALIGNMENT;
}

function addMacroScheduleSheet(workbook: Workbook, data: ScrumOutput) {
  const sheet = workbook.addWorksheet("Planejamento Macro");
  sheet.columns = [
    { header: "Sprint", key: "name", width: 20 },
    { header: "Foco", key: "focus", width: 45 },
    { header: "Dependências", key: "dependencies", width: 40 },
  ];
  styleHeaderRow(sheet.getRow(1));

  data.macroSchedule.sprints.forEach((sprint) => {
    const row = sheet.addRow({
      name: sprint.name,
      focus: sprint.focus,
      dependencies:
        sprint.dependencies.length > 0
          ? sprint.dependencies.map((item) => `• ${item}`).join("\n")
          : "Não identificado na especificação.",
    });
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.alignment = WRAP_TOP_ALIGNMENT;
    });
  });

  applyZebraStripes(sheet, 2, sheet.rowCount);
  freezeAndFilter(sheet, "C", sheet.rowCount);
}

function labelFor(level: ScrumOutput["backlog"][number]["businessValue"]) {
  return level === "alta" ? "Alta" : level === "media" ? "Média" : "Baixa";
}
