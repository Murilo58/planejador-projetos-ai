import type { ConsolidatedResult } from "@/lib/ai/schemas/result";

import { addCascataSheets } from "./excel/cascata-sheet";
import { addKanbanSheets } from "./excel/kanban-sheet";
import { addScrumSheets } from "./excel/scrum-sheet";
import { addSummarySheet, excelFilename } from "./excel/shared";

/**
 * Exportação para Excel (.xlsx) — usa exclusivamente o resultado já
 * processado (mesma regra do `to-markdown.ts`): nenhuma nova chamada à
 * IA, nenhum dado inventado. Cada framework recebe suas próprias abas,
 * além de uma aba "Resumo" comum (RF-054: identificação do framework,
 * título e data de geração também na exportação).
 *
 * `exceljs` é importado dinamicamente: só entra no bundle do cliente
 * quando o usuário realmente exporta para Excel — mesmo padrão já usado
 * para `pdfjs-dist` (`src/lib/pdf/extract-text.ts`).
 *
 * Importa explicitamente o subcaminho `exceljs/dist/exceljs.min.js` (o
 * próprio build que o pacote expõe no campo `browser`), em vez de depender
 * implicitamente da resolução de `"exceljs"` — verificado por inspeção do
 * bundle de produção (`next build` + grep no chunk gerado) que o Turbopack
 * já resolve esse campo corretamente mesmo sem o subcaminho explícito;
 * ainda assim, importar o caminho exato remove qualquer dependência dessa
 * resolução implícita (garantida independente de bundler/versão).
 *
 * Esse build de navegador do próprio ExcelJS inclui suporte a CSV (não
 * usado aqui) e por isso não é pequeno (~900 KB antes de compressão) — o
 * import dinâmico garante que esse custo só é pago quando o usuário clica
 * em "Exportar Excel", nunca no carregamento inicial da página.
 */
export async function buildExcelExport(
  result: ConsolidatedResult,
): Promise<{ filename: string; buffer: ArrayBuffer }> {
  const ExcelJS = (await import("exceljs/dist/exceljs.min.js")).default;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Planejador de Projetos AI";
  workbook.created = new Date(result.generatedAt);

  if (result.framework === "scrum") {
    addSummarySheet(workbook, result, [
      { label: "Itens no backlog", value: String(result.data.backlog.length) },
      {
        label: "Sprints no planejamento macro",
        value: String(result.data.macroSchedule.sprints.length),
      },
    ]);
    addScrumSheets(workbook, result.data);
  } else if (result.framework === "kanban") {
    addSummarySheet(workbook, result, [
      { label: "Colunas do quadro", value: String(result.data.columns.length) },
      { label: "Itens classificados", value: String(result.data.items.length) },
    ]);
    addKanbanSheets(workbook, result.data);
  } else {
    addSummarySheet(workbook, result, [
      { label: "Entregáveis da EAP", value: String(result.data.eap.deliverables.length) },
      { label: "Fases do cronograma", value: String(result.data.schedule.phases.length) },
    ]);
    addCascataSheets(workbook, result.data);
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return { filename: excelFilename(result), buffer };
}
