"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ClassicResult } from "@/lib/ai/schemas/result";
import { buildExcelExport } from "@/lib/export/to-excel";
import { buildMarkdownExport } from "@/lib/export/to-markdown";

/**
 * Exportação (RF-054 a RF-058): usa exclusivamente o resultado já em
 * memória — nenhuma nova chamada à IA, nenhuma gravação no banco.
 *
 * PDF via impressão nativa do navegador (`window.print()` + CSS de
 * impressão), não uma biblioteca de geração de PDF: reaproveita o mesmo
 * layout já validado na tela, sem reimplementar posicionamento de texto
 * numa API de desenho — a opção mais simples que ainda produz um PDF com
 * hierarquia visual adequada (RF-054).
 */
export function ExportActions({ result }: { result: ClassicResult }) {
  const [error, setError] = useState<string | null>(null);
  const [isExportingExcel, setIsExportingExcel] = useState(false);

  function handleExportText() {
    try {
      const { filename, content } = buildMarkdownExport(result);
      const blob = new Blob([content], {
        type: "text/markdown;charset=utf-8",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setError(null);
    } catch {
      // FE-12: falha de exportação.
      setError(
        "Não foi possível exportar o arquivo de texto. Tente novamente.",
      );
    }
  }

  function handleExportPdf() {
    try {
      window.print();
      setError(null);
    } catch {
      setError("Não foi possível abrir a exportação em PDF. Tente novamente.");
    }
  }

  async function handleExportExcel() {
    setIsExportingExcel(true);
    try {
      const { filename, buffer } = await buildExcelExport(result);
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setError(null);
    } catch {
      // FE-12: falha de exportação.
      setError("Não foi possível exportar o arquivo Excel. Tente novamente.");
    } finally {
      setIsExportingExcel(false);
    }
  }

  return (
    <div className="flex flex-col gap-2 print:hidden">
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" onClick={handleExportText}>
          <Download className="size-4" data-icon="inline-start" />
          Exportar texto
        </Button>
        <Button type="button" variant="outline" onClick={handleExportPdf}>
          <Printer className="size-4" data-icon="inline-start" />
          Exportar PDF
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleExportExcel}
          disabled={isExportingExcel}
        >
          <FileSpreadsheet className="size-4" data-icon="inline-start" />
          {isExportingExcel ? "Gerando Excel..." : "Exportar Excel"}
        </Button>
      </div>
      {error ? (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      ) : null}
    </div>
  );
}
