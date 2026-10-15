import type { Workbook } from "exceljs";

import type { WaterfallOutput } from "@/lib/ai/schemas/waterfall";

import { addEapSheet, addTapSheet } from "./governance-sheets";
import {
  applyZebraStripes,
  EXCEL_COLORS,
  freezeAndFilter,
  listOrNotIdentified,
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
  addTapSheet(workbook, data.tap);
  addEapSheet(workbook, data.eap.deliverables);
  addScheduleSheet(workbook, data);
  addKickoffSheet(workbook, data);
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
