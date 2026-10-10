/**
 * Extração de texto de PDF inteiramente no navegador (RF-019 / spec §15).
 *
 * O arquivo original nunca é enviado ao backend — apenas o texto extraído
 * aqui é usado no restante do fluxo (RN-008). Suporta somente PDFs com
 * camada textual (RF-020); PDFs escaneados/sem texto lançam
 * `PdfNoTextFoundError`, tratado na UI com a mensagem amigável definida na
 * especificação original (§16).
 *
 * `pdfjs-dist` é importado dinamicamente: só entra no bundle do cliente
 * quando o usuário realmente escolhe enviar um PDF.
 */

export class PdfTextExtractionError extends Error {}
export class PdfNoTextFoundError extends PdfTextExtractionError {}

export async function extractTextFromPdf(file: File): Promise<string> {
  const pdfjsLib = await import("pdfjs-dist");

  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();

  let buffer: ArrayBuffer;
  try {
    buffer = await file.arrayBuffer();
  } catch {
    throw new PdfTextExtractionError(
      "Não foi possível ler este arquivo. Tente novamente ou cole o conteúdo diretamente.",
    );
  }

  let document: Awaited<ReturnType<typeof pdfjsLib.getDocument>["promise"]>;
  try {
    document = await pdfjsLib.getDocument({ data: buffer }).promise;
  } catch {
    throw new PdfTextExtractionError(
      "Não foi possível processar este arquivo. Verifique se é um PDF válido ou cole o conteúdo diretamente.",
    );
  }

  const pageTexts: string[] = [];
  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber++) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    pageTexts.push(pageText);
  }

  const text = pageTexts
    .join("\n\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (text.length === 0) {
    throw new PdfNoTextFoundError(
      "Não foi possível identificar texto neste PDF. Tente utilizar um PDF com texto selecionável ou cole o conteúdo diretamente no campo de especificação.",
    );
  }

  return text;
}
