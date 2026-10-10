import type { Workbook } from "exceljs";

import type { KanbanOutput } from "@/lib/ai/schemas/kanban";

import {
  applyPriorityStyle,
  applyZebraStripes,
  freezeAndFilter,
  NOT_IDENTIFIED,
  styleHeaderRow,
  WRAP_TOP_ALIGNMENT,
} from "./shared";

/**
 * Abas do Kanban (além de "Resumo"): Quadro Inicial (colunas + limites de
 * WIP) e Atividades (itens, com prioridade, classificação e status
 * inicial — a coluna à qual pertencem). "Prioridades" e "classificações"
 * são colunas desta mesma tabela, não abas isoladas: são atributos de
 * cada atividade, não entidades próprias (ver proposta aprovada).
 */
export function addKanbanSheets(workbook: Workbook, data: KanbanOutput) {
  addBoardSheet(workbook, data);
  addItemsSheet(workbook, data);
}

function addBoardSheet(workbook: Workbook, data: KanbanOutput) {
  const sheet = workbook.addWorksheet("Quadro Inicial");
  sheet.columns = [
    { header: "Coluna (status inicial)", key: "name", width: 26 },
    { header: "Limite de WIP", key: "wipLimit", width: 18 },
    { header: "Justificativa do limite", key: "wipJustification", width: 55 },
  ];
  styleHeaderRow(sheet.getRow(1));

  data.columns.forEach((column) => {
    const row = sheet.addRow({
      name: column.name,
      wipLimit: column.wipLimit,
      wipJustification: column.wipJustification,
    });
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.alignment = WRAP_TOP_ALIGNMENT;
    });
  });

  applyZebraStripes(sheet, 2, sheet.rowCount);
  freezeAndFilter(sheet, "C", sheet.rowCount);
}

function addItemsSheet(workbook: Workbook, data: KanbanOutput) {
  const sheet = workbook.addWorksheet("Atividades");
  sheet.columns = [
    { header: "Título", key: "title", width: 26 },
    { header: "Descrição", key: "description", width: 45 },
    { header: "Classificação", key: "type", width: 18 },
    { header: "Prioridade", key: "priority", width: 14 },
    { header: "Coluna (status inicial)", key: "column", width: 24 },
    { header: "Dependência", key: "dependency", width: 28 },
    { header: "Observação", key: "note", width: 28 },
  ];
  styleHeaderRow(sheet.getRow(1));

  data.items.forEach((item) => {
    const row = sheet.addRow({
      title: item.title,
      description: item.description,
      type: item.type,
      priority: "",
      column: item.column,
      dependency: item.dependency ?? NOT_IDENTIFIED,
      note: item.note ?? NOT_IDENTIFIED,
    });
    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.alignment = WRAP_TOP_ALIGNMENT;
    });

    const priorityCell = row.getCell("priority");
    priorityCell.value = labelFor(item.priority);
    applyPriorityStyle(priorityCell, item.priority);
  });

  applyZebraStripes(sheet, 2, sheet.rowCount);
  freezeAndFilter(sheet, "G", sheet.rowCount);
}

function labelFor(level: KanbanOutput["items"][number]["priority"]) {
  return level === "alta" ? "Alta" : level === "media" ? "Média" : "Baixa";
}
