import type { Workbook } from "exceljs";

import type { WaterfallOutput } from "@/lib/ai/schemas/waterfall";

import {
  applyZebraStripes,
  EXCEL_COLORS,
  freezeAndFilter,
  NOT_IDENTIFIED,
  styleHeaderRow,
  WRAP_TOP_ALIGNMENT,
} from "./shared";

/**
 * Abas da Cascata (além de "Resumo"): TAP, EAP, Cronograma Macro e
 * Kick-off — os 4 artefatos do `waterfallOutputSchema`
 * (`src/lib/ai/schemas/waterfall.ts`). "Marcos" e "dependências" são
 * colunas da tabela de Cronograma Macro, não abas isoladas: são
 * atributos de cada fase, não entidades próprias (ver proposta aprovada).
 */
export function addCascataSheets(workbook: Workbook, data: WaterfallOutput) {
  addTapSheet(workbook, data);
  addEapSheet(workbook, data);
  addScheduleSheet(workbook, data);
  addKickoffSheet(workbook, data);
}

function listOrNotIdentified(items: string[]) {
  return items.length > 0
    ? items.map((item) => `• ${item}`).join("\n")
    : NOT_IDENTIFIED;
}

function addTapSheet(workbook: Workbook, data: WaterfallOutput) {
  const sheet = workbook.addWorksheet("TAP", {
    views: [{ state: "frozen", ySplit: 0 }],
  });
  sheet.columns = [
    { key: "label", width: 24 },
    { key: "value", width: 65 },
  ];

  const header = sheet.addRow(["Termo de Abertura do Projeto"]);
  header.getCell(1).font = { bold: true, size: 13, color: { argb: EXCEL_COLORS.primary } };
  sheet.mergeCells(header.number, 1, header.number, 2);
  sheet.addRow([]);

  const rows: Array<[string, string]> = [
    ["Objetivo", data.tap.objective],
    ["Escopo resumido", data.tap.scopeSummary],
    ["Stakeholders", listOrNotIdentified(data.tap.stakeholders)],
    ["Critérios de sucesso", listOrNotIdentified(data.tap.successCriteria)],
    ["Premissas", listOrNotIdentified(data.tap.assumptions)],
    ["Restrições", listOrNotIdentified(data.tap.constraints)],
  ];

  rows.forEach(([label, value]) => {
    const row = sheet.addRow([label, value]);
    row.getCell(1).font = { bold: true, color: { argb: EXCEL_COLORS.foreground } };
    row.getCell(1).alignment = { vertical: "top" };
    row.getCell(2).alignment = WRAP_TOP_ALIGNMENT;
  });
}

function addEapSheet(workbook: Workbook, data: WaterfallOutput) {
  const sheet = workbook.addWorksheet("EAP");
  sheet.columns = [
    { header: "Entregável", key: "name", width: 40 },
    { header: "Subentregáveis", key: "subDeliverables", width: 55 },
  ];
  styleHeaderRow(sheet.getRow(1));

  data.eap.deliverables.forEach((deliverable) => {
    const row = sheet.addRow({
      name: deliverable.name,
      subDeliverables:
        deliverable.subDeliverables && deliverable.subDeliverables.length > 0
          ? deliverable.subDeliverables
              .map((sub) => `• ${sub.name}`)
              .join("\n")
          : NOT_IDENTIFIED,
    });
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.alignment = WRAP_TOP_ALIGNMENT;
    });
  });

  applyZebraStripes(sheet, 2, sheet.rowCount);
  freezeAndFilter(sheet, "B", sheet.rowCount);
}

function addScheduleSheet(workbook: Workbook, data: WaterfallOutput) {
  const sheet = workbook.addWorksheet("Cronograma Macro");
  sheet.columns = [
    { header: "Fase", key: "name", width: 26 },
    { header: "Marcos", key: "milestones", width: 45 },
    { header: "Dependências", key: "dependencies", width: 40 },
  ];
  styleHeaderRow(sheet.getRow(1));

  data.schedule.phases.forEach((phase) => {
    const row = sheet.addRow({
      name: phase.name,
      milestones: listOrNotIdentified(phase.milestones),
      dependencies: listOrNotIdentified(phase.dependencies),
    });
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.alignment = WRAP_TOP_ALIGNMENT;
    });
  });

  applyZebraStripes(sheet, 2, sheet.rowCount);
  freezeAndFilter(sheet, "C", sheet.rowCount);
}

function addKickoffSheet(workbook: Workbook, data: WaterfallOutput) {
  const sheet = workbook.addWorksheet("Kick-off", {
    views: [{ state: "frozen", ySplit: 0 }],
  });
  sheet.columns = [
    { key: "label", width: 24 },
    { key: "value", width: 65 },
  ];

  const header = sheet.addRow([data.kickoff.title]);
  header.getCell(1).font = { bold: true, size: 13, color: { argb: EXCEL_COLORS.primary } };
  sheet.mergeCells(header.number, 1, header.number, 2);
  sheet.addRow([]);

  const rows: Array<[string, string]> = [
    ["Objetivo", data.kickoff.objective],
    ["Escopo", data.kickoff.scope],
    ["Principais marcos", listOrNotIdentified(data.kickoff.keyMilestones)],
  ];
  rows.forEach(([label, value]) => {
    const row = sheet.addRow([label, value]);
    row.getCell(1).font = { bold: true, color: { argb: EXCEL_COLORS.foreground } };
    row.getCell(1).alignment = { vertical: "top" };
    row.getCell(2).alignment = WRAP_TOP_ALIGNMENT;
  });

  sheet.addRow([]);
  const rolesHeaderRow = sheet.addRow(["Papéis e responsabilidades"]);
  rolesHeaderRow.getCell(1).font = { bold: true, color: { argb: EXCEL_COLORS.foreground } };
  sheet.mergeCells(rolesHeaderRow.number, 1, rolesHeaderRow.number, 2);

  if (data.kickoff.rolesAndResponsibilities.length === 0) {
    const row = sheet.addRow(["", NOT_IDENTIFIED]);
    row.getCell(2).alignment = WRAP_TOP_ALIGNMENT;
    return;
  }

  const tableHeaderRowNumber = sheet.rowCount + 1;
  sheet.addRow(["Papel", "Responsabilidade"]);
  styleHeaderRow(sheet.getRow(tableHeaderRowNumber));

  data.kickoff.rolesAndResponsibilities.forEach((item) => {
    const row = sheet.addRow([item.role, item.responsibility]);
    row.getCell(1).alignment = WRAP_TOP_ALIGNMENT;
    row.getCell(2).alignment = WRAP_TOP_ALIGNMENT;
  });

  applyZebraStripes(sheet, tableHeaderRowNumber + 1, sheet.rowCount);
}
