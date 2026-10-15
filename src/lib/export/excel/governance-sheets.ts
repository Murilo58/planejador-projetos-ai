import type { Workbook } from "exceljs";

import type { WaterfallOutput } from "@/lib/ai/schemas/waterfall";

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
 * Abas de governança preditiva — TAP e EAP. Usadas pela Cascata e, na
 * v1.1, pelo Planejamento Híbrido, que parte da mesma governança.
 */

export function addTapSheet(workbook: Workbook, tap: WaterfallOutput["tap"]) {
  const sheet = workbook.addWorksheet("TAP", {
    views: [{ state: "frozen", ySplit: 0 }],
  });
  sheet.columns = [
    { key: "label", width: 24 },
    { key: "value", width: 65 },
  ];

  const header = sheet.addRow(["Termo de Abertura do Projeto"]);
  header.getCell(1).font = {
    bold: true,
    size: 13,
    color: { argb: EXCEL_COLORS.primary },
  };
  sheet.mergeCells(header.number, 1, header.number, 2);
  sheet.addRow([]);

  const rows: Array<[string, string]> = [
    ["Objetivo", tap.objective],
    ["Escopo resumido", tap.scopeSummary],
    ["Stakeholders", listOrNotIdentified(tap.stakeholders)],
    ["Critérios de sucesso", listOrNotIdentified(tap.successCriteria)],
    ["Premissas", listOrNotIdentified(tap.assumptions)],
    ["Restrições", listOrNotIdentified(tap.constraints)],
  ];

  rows.forEach(([label, value]) => {
    const row = sheet.addRow([label, value]);
    row.getCell(1).font = {
      bold: true,
      color: { argb: EXCEL_COLORS.foreground },
    };
    row.getCell(1).alignment = { vertical: "top" };
    row.getCell(2).alignment = WRAP_TOP_ALIGNMENT;
  });
}

export function addEapSheet(
  workbook: Workbook,
  deliverables: WaterfallOutput["eap"]["deliverables"],
) {
  const sheet = workbook.addWorksheet("EAP");
  sheet.columns = [
    { header: "Entregável", key: "name", width: 40 },
    { header: "Subentregáveis", key: "subDeliverables", width: 55 },
  ];
  styleHeaderRow(sheet.getRow(1));

  deliverables.forEach((deliverable) => {
    const row = sheet.addRow({
      name: deliverable.name,
      subDeliverables:
        deliverable.subDeliverables && deliverable.subDeliverables.length > 0
          ? deliverable.subDeliverables.map((sub) => `• ${sub.name}`).join("\n")
          : NOT_IDENTIFIED,
    });
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.alignment = WRAP_TOP_ALIGNMENT;
    });
  });

  applyZebraStripes(sheet, 2, sheet.rowCount);
  freezeAndFilter(sheet, "B", sheet.rowCount);
}
