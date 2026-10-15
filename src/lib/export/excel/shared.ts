import type { Cell, Row, Workbook, Worksheet } from "exceljs";

import type { ConsolidatedResult } from "@/lib/ai/schemas/result";
import { getPlanningFrameworkInfo } from "@/lib/planning-frameworks";

/**
 * Estilo compartilhado entre as planilhas de todos os frameworks — paleta
 * replicada de `src/app/globals.css` (tokens claros) para que o arquivo
 * exportado mantenha a identidade visual do Planejador de Projetos AI.
 * ExcelJS usa ARGB (8 dígitos hex, sem "#"); por isso os tokens são
 * reescritos aqui em vez de importados do CSS.
 */
export const EXCEL_COLORS = {
  primary: "FF4F46E5",
  primaryDark: "FF3730A3",
  headerText: "FFFFFFFF",
  border: "FFE5E7EB",
  zebra: "FFF1F2F6",
  foreground: "FF111827",
  mutedText: "FF6B7280",
} as const;

export type PriorityLevel = "alta" | "media" | "baixa";

/**
 * Mesmas cores semânticas do `PriorityBadge` (RF-049): destrutivo para
 * alta, atenção para média, neutro para baixa — nunca a cor isolada,
 * sempre acompanhada do rótulo em texto.
 */
export const PRIORITY_STYLES: Record<
  PriorityLevel,
  { fill: string; font: string; label: string }
> = {
  alta: { fill: "FFFEE2E2", font: "FF991B1B", label: "Alta" },
  media: { fill: "FFFEF3C7", font: "FF92400E", label: "Média" },
  baixa: { fill: "FFF1F2F6", font: "FF6B7280", label: "Baixa" },
};

export const NOT_IDENTIFIED = "Não identificado na especificação.";

/** Lista em uma única célula, um "• item" por linha. */
export function listOrNotIdentified(items: string[]) {
  return items.length > 0
    ? items.map((item) => `• ${item}`).join("\n")
    : NOT_IDENTIFIED;
}

export function frameworkLabel(framework: ConsolidatedResult["framework"]) {
  return getPlanningFrameworkInfo(framework)?.name ?? framework;
}

/** Nome de arquivo consistente com `to-markdown.ts` (apenas a extensão muda). */
export function excelFilename(result: ConsolidatedResult) {
  const datePart = new Date(result.generatedAt).toISOString().slice(0, 10);
  return `planejamento-${result.framework}-${datePart}.xlsx`;
}

/** Cabeçalho com a cor primária, texto branco em negrito e quebra automática. */
export function styleHeaderRow(row: Row) {
  row.height = 22;
  row.eachCell({ includeEmpty: true }, (cell) => {
    cell.font = { bold: true, color: { argb: EXCEL_COLORS.headerText } };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: EXCEL_COLORS.primary },
    };
    cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
    cell.border = {
      bottom: { style: "thin", color: { argb: EXCEL_COLORS.primaryDark } },
    };
  });
}

/** Linhas alternadas (zebra) entre `firstDataRow` e `lastDataRow`, inclusive. */
export function applyZebraStripes(
  worksheet: Worksheet,
  firstDataRow: number,
  lastDataRow: number,
) {
  for (let r = firstDataRow; r <= lastDataRow; r += 1) {
    if ((r - firstDataRow) % 2 === 1) {
      worksheet.getRow(r).eachCell({ includeEmpty: true }, (cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: EXCEL_COLORS.zebra },
        };
      });
    }
  }
}

/**
 * Destaque visual de prioridade (alta/média/baixa) numa célula — aplicado
 * depois do zebra para que a cor de prioridade sempre prevaleça sobre a
 * linha alternada.
 */
export function applyPriorityStyle(cell: Cell, level: string) {
  const style = PRIORITY_STYLES[level as PriorityLevel];
  if (!style) return;
  cell.font = { bold: true, color: { argb: style.font } };
  cell.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: style.fill },
  };
  cell.alignment = { vertical: "top", horizontal: "left", wrapText: true };
}

/** Congela a primeira linha (cabeçalho) e habilita o filtro na faixa dada. */
export function freezeAndFilter(worksheet: Worksheet, lastColumnLetter: string, lastDataRow: number) {
  worksheet.views = [{ state: "frozen", xSplit: 0, ySplit: 1 }];
  if (lastDataRow > 1) {
    worksheet.autoFilter = `A1:${lastColumnLetter}1`;
  }
}

/** Alinhamento padrão (quebra de texto + alinhado ao topo) para células de dados. */
export const WRAP_TOP_ALIGNMENT = {
  wrapText: true,
  vertical: "top" as const,
};

/**
 * Aba "Resumo", comum aos 3 frameworks (RF-054: identificação do
 * framework, título e data de geração também na exportação).
 */
export function addSummarySheet(
  workbook: Workbook,
  result: ConsolidatedResult,
  highlights: Array<{ label: string; value: string }>,
) {
  const sheet = workbook.addWorksheet("Resumo", {
    views: [{ state: "frozen", ySplit: 0 }],
  });
  sheet.columns = [
    { key: "label", width: 28 },
    { key: "value", width: 70 },
  ];

  const title = sheet.addRow(["Planejamento gerado por Planejador de Projetos AI"]);
  title.getCell(1).font = { bold: true, size: 14, color: { argb: EXCEL_COLORS.primary } };
  sheet.mergeCells(1, 1, 1, 2);
  sheet.addRow([]);

  const rows: Array<[string, string]> = [
    ["Framework", frameworkLabel(result.framework)],
    [
      "Data de geração",
      new Date(result.generatedAt).toLocaleString("pt-BR"),
    ],
    ...highlights.map(
      ({ label, value }) => [label, value] as [string, string],
    ),
  ];

  rows.forEach(([label, value]) => {
    const row = sheet.addRow([label, value]);
    row.getCell(1).font = { bold: true, color: { argb: EXCEL_COLORS.foreground } };
    row.getCell(2).alignment = WRAP_TOP_ALIGNMENT;
  });

  if (result.notes.length > 0) {
    sheet.addRow([]);
    const notesHeader = sheet.addRow(["Observações da validação"]);
    notesHeader.getCell(1).font = { bold: true, color: { argb: EXCEL_COLORS.foreground } };
    result.notes.forEach((note) => {
      const row = sheet.addRow(["", note]);
      row.getCell(2).alignment = WRAP_TOP_ALIGNMENT;
    });
  }

  sheet.addRow([]);
  const footer = sheet.addRow([
    "Planilha gerada automaticamente a partir do resultado já processado — nenhuma informação foi adicionada além do que consta na especificação original.",
  ]);
  footer.getCell(1).font = { italic: true, color: { argb: EXCEL_COLORS.mutedText } };
  sheet.mergeCells(footer.number, 1, footer.number, 2);
}
