import ExcelJS from "exceljs";
import { describe, expect, it } from "vitest";

import {
  classicResultSchema,
  consolidatedResultSchema,
} from "@/lib/ai/schemas/result";
import { HYBRID_GOLDEN_RESULTS } from "@/lib/export/__fixtures__/golden-hybrid-results";
import { GOLDEN_RESULTS } from "@/lib/export/__fixtures__/golden-results";
import { buildExcelExport } from "@/lib/export/to-excel";
import { buildMarkdownExport } from "@/lib/export/to-markdown";

/**
 * Rede de proteção da v1.1 (Fase 1): saída COMPLETA das exportações de
 * Scrum, Kanban e Cascata congelada em snapshots — Markdown byte a byte e
 * Excel por estrutura, valores e estilos relevantes. Qualquer diferença
 * nas exportações atuais durante a implementação do Planejamento Híbrido
 * faz estes testes falharem.
 *
 * Atualizar um snapshot (`vitest -u`) é uma decisão consciente de mudar
 * uma exportação já homologada — nunca um passo de rotina.
 *
 * As datas de geração são formatadas em pt-BR no fuso local; o fuso é
 * fixado aqui para que os snapshots não dependam da máquina.
 */
process.env.TZ = "America/Sao_Paulo";

const SNAPSHOT_DIR = "./__snapshots__/golden";

describe.each(Object.entries(GOLDEN_RESULTS))(
  "exportações golden — %s",
  (name, result) => {
    it("o resultado de referência continua válido no contrato atual", () => {
      expect(classicResultSchema.safeParse(result).success).toBe(true);
    });

    it("Markdown idêntico ao homologado", async () => {
      const { filename, content } = buildMarkdownExport(result);
      expect(filename).toBe(`planejamento-${result.framework}-2026-10-09.md`);
      await expect(content).toMatchFileSnapshot(`${SNAPSHOT_DIR}/${name}.md`);
    });

    it("Excel idêntico ao homologado (abas, valores e estilos)", async () => {
      const { filename, buffer } = await buildExcelExport(result);
      expect(filename).toBe(`planejamento-${result.framework}-2026-10-09.xlsx`);

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer as never);
      await expect(
        JSON.stringify(describeWorkbook(workbook), null, 2),
      ).toMatchFileSnapshot(`${SNAPSHOT_DIR}/${name}.xlsx.json`);
    });
  },
);

/**
 * Planejamento Híbrido (v1.1, Fase 6): mesma rede de proteção, com
 * snapshots próprios — incluindo um pacote com lacunas para fixar a
 * exportação dos pontos de atenção.
 */
describe.each(Object.entries(HYBRID_GOLDEN_RESULTS))(
  "exportações golden — %s",
  (name, result) => {
    it("o resultado de referência é válido no contrato (inclusive vínculos)", () => {
      expect(consolidatedResultSchema.safeParse(result).success).toBe(true);
    });

    it("Markdown idêntico ao homologado", async () => {
      const { filename, content } = buildMarkdownExport(result);
      expect(filename).toBe(`planejamento-${result.framework}-2026-10-09.md`);
      expect(content).not.toMatch(/kick-?off/i);
      await expect(content).toMatchFileSnapshot(`${SNAPSHOT_DIR}/${name}.md`);
    });

    it("Excel idêntico ao homologado (abas, valores e estilos)", async () => {
      const { filename, buffer } = await buildExcelExport(result);
      expect(filename).toBe(`planejamento-${result.framework}-2026-10-09.xlsx`);

      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer as never);
      await expect(
        JSON.stringify(describeWorkbook(workbook), null, 2),
      ).toMatchFileSnapshot(`${SNAPSHOT_DIR}/${name}.xlsx.json`);
    });
  },
);

/**
 * Representação estável da planilha para o snapshot: abas, colunas,
 * painéis congelados, filtros, mesclagens e cada célula com valor e os
 * estilos que a exportação define (negrito, cores, quebra de linha).
 */
function describeWorkbook(workbook: ExcelJS.Workbook) {
  return workbook.worksheets.map((sheet) => ({
    name: sheet.name,
    views: (sheet.views ?? []).map((view) => ({
      state: view.state,
      ySplit: "ySplit" in view ? view.ySplit : undefined,
    })),
    autoFilter: sheet.autoFilter ?? null,
    merges: [...(sheet.model.merges ?? [])].sort(),
    columnWidths: (sheet.columns ?? []).map((column) => column.width ?? null),
    rows: collectRows(sheet),
  }));
}

function collectRows(sheet: ExcelJS.Worksheet) {
  const rows: Array<{ row: number; height?: number; cells: unknown[] }> = [];
  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    const cells: unknown[] = [];
    row.eachCell({ includeEmpty: false }, (cell) => {
      cells.push({
        address: cell.address,
        value: cell.value,
        ...(cell.font?.bold ? { bold: true } : {}),
        ...(cell.font?.italic ? { italic: true } : {}),
        ...(cell.font?.color?.argb ? { color: cell.font.color.argb } : {}),
        ...(cell.font?.size ? { size: cell.font.size } : {}),
        ...fillOf(cell),
        ...(cell.alignment?.wrapText ? { wrap: true } : {}),
      });
    });
    rows.push({
      row: rowNumber,
      ...(row.height ? { height: row.height } : {}),
      cells,
    });
  });
  return rows;
}

function fillOf(cell: ExcelJS.Cell) {
  const fill = cell.fill as { fgColor?: { argb?: string } } | undefined;
  return fill?.fgColor?.argb ? { fill: fill.fgColor.argb } : {};
}
