// `exceljs` só declara tipos para o pacote raiz ("exceljs" → index.d.ts);
// o subcaminho do build de navegador (ver src/lib/export/to-excel.ts) não
// tem declaração própria. Reaproveita exatamente os mesmos tipos do
// pacote raiz, já que é o mesmo contrato de API (Workbook, Worksheet etc.).
declare module "exceljs/dist/exceljs.min.js" {
  import ExcelJS from "exceljs";

  export default ExcelJS;
}
