import ExcelJS from "exceljs";
import { describe, expect, it } from "vitest";

import type { ClassicResult } from "@/lib/ai/schemas/result";
import { buildExcelExport } from "@/lib/export/to-excel";

/**
 * Testes rodam em Node (Vitest), por isso `exceljs` resolve para o build
 * Node completo (campo `main`) — o mesmo pacote que o navegador usa, só
 * que com o build dedicado a cada ambiente (ver comentário em
 * `to-excel.ts`). Os testes releem o `.xlsx` gerado com o próprio
 * ExcelJS para validar abas, cabeçalhos e dados reais — não apenas que
 * "não lançou erro".
 */

const scrumResult: ClassicResult = {
  framework: "scrum",
  generatedAt: "2026-10-09T12:00:00.000Z",
  data: {
    backlog: [
      {
        title: "Login",
        statement: "Como usuário, quero entrar, para acessar o sistema.",
        acceptanceCriteria: [
          "Credenciais inválidas mostram erro",
          "Login válido redireciona ao painel",
        ],
        businessValue: "alta",
        complexity: "baixa",
        priorityJustification: "Pré-requisito para o restante do fluxo.",
      },
    ],
    firstSprint: {
      selectedStoryTitles: ["Login"],
      rationale: "Base do fluxo.",
    },
    macroSchedule: {
      sprints: [{ name: "Sprint 1", focus: "Login", dependencies: [] }],
    },
  },
  notes: ["Nenhum ajuste necessário."],
};

const kanbanResult: ClassicResult = {
  framework: "kanban",
  generatedAt: "2026-10-09T12:00:00.000Z",
  data: {
    columns: [
      { name: "A Fazer", wipLimit: "3", wipJustification: "Entrada controlada." },
      { name: "Em Andamento", wipLimit: "2", wipJustification: "Evita multitarefa." },
    ],
    items: [
      {
        title: "Cadastro",
        description: "Formulário de cadastro de usuário.",
        type: "funcionalidade",
        priority: "alta",
        column: "A Fazer",
      },
      {
        title: "Ajuste de layout",
        description: "Pequeno ajuste visual.",
        type: "tarefa técnica",
        priority: "baixa",
        column: "Em Andamento",
        note: "Depende do design final.",
      },
    ],
  },
  notes: [],
};

const cascataResult: ClassicResult = {
  framework: "cascata",
  generatedAt: "2026-10-09T12:00:00.000Z",
  data: {
    tap: {
      objective: "Lançar o novo portal.",
      scopeSummary: "Portal público com autenticação.",
      stakeholders: ["Patrocinador"],
      successCriteria: ["Disponibilidade de 99%"],
      assumptions: [],
      constraints: [],
    },
    eap: {
      deliverables: [
        { name: "Infraestrutura", subDeliverables: [{ name: "Banco de dados" }] },
        { name: "Portal" },
      ],
    },
    schedule: {
      phases: [
        { name: "Fase 1", milestones: ["Kick-off"], dependencies: [] },
      ],
    },
    kickoff: {
      title: "Kick-off do Portal",
      objective: "Alinhar o time.",
      scope: "Visão geral do projeto.",
      keyMilestones: ["Início em Fase 1"],
      rolesAndResponsibilities: [
        { role: "Gerente de Projeto", responsibility: "Coordenação geral." },
      ],
    },
  },
  notes: [],
};

async function readWorkbook(buffer: ArrayBuffer) {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer as never);
  return workbook;
}

describe("buildExcelExport", () => {
  it("gera um nome de arquivo com o framework e a data (não um nome genérico)", async () => {
    const { filename } = await buildExcelExport(scrumResult);
    expect(filename).toBe("planejamento-scrum-2026-10-09.xlsx");
  });

  it("Scrum: gera as 4 abas esperadas, com o backlog completo", async () => {
    const { buffer } = await buildExcelExport(scrumResult);
    const workbook = await readWorkbook(buffer);

    expect(workbook.worksheets.map((sheet) => sheet.name)).toEqual([
      "Resumo",
      "Product Backlog",
      "Sprint Inicial",
      "Planejamento Macro",
    ]);

    const backlogSheet = workbook.getWorksheet("Product Backlog")!;
    expect(backlogSheet.getRow(1).getCell(2).value).toBe("Título");
    expect(backlogSheet.getRow(2).getCell(2).value).toBe("Login");
    expect(backlogSheet.getRow(2).getCell(4).value).toContain(
      "Credenciais inválidas mostram erro",
    );
    expect(backlogSheet.getRow(2).getCell(4).value).toContain(
      "Login válido redireciona ao painel",
    );
    expect(backlogSheet.autoFilter).toBeTruthy();
  });

  it("Scrum: destaca a célula de valor de negócio/complexidade com cor de prioridade", async () => {
    const { buffer } = await buildExcelExport(scrumResult);
    const workbook = await readWorkbook(buffer);
    const backlogSheet = workbook.getWorksheet("Product Backlog")!;
    const businessValueCell = backlogSheet.getRow(2).getCell(5);
    expect(businessValueCell.value).toBe("Alta");
    expect((businessValueCell.fill as { fgColor?: { argb?: string } }).fgColor?.argb).toBe(
      "FFFEE2E2",
    );
  });

  it("Kanban: gera as 3 abas esperadas, com itens e prioridade coloridos", async () => {
    const { buffer } = await buildExcelExport(kanbanResult);
    const workbook = await readWorkbook(buffer);

    expect(workbook.worksheets.map((sheet) => sheet.name)).toEqual([
      "Resumo",
      "Quadro Inicial",
      "Atividades",
    ]);

    const itemsSheet = workbook.getWorksheet("Atividades")!;
    expect(itemsSheet.getRow(2).getCell(1).value).toBe("Cadastro");
    expect(itemsSheet.getRow(2).getCell(4).value).toBe("Alta");
    expect(itemsSheet.getRow(3).getCell(7).value).toBe("Depende do design final.");
    // Item sem dependência: nunca inventa valor, usa o texto padrão (RN-004).
    expect(itemsSheet.getRow(2).getCell(6).value).toBe(
      "Não identificado na especificação.",
    );
  });

  it("Cascata: gera as 5 abas esperadas, com TAP, EAP, cronograma e kick-off", async () => {
    const { buffer } = await buildExcelExport(cascataResult);
    const workbook = await readWorkbook(buffer);

    expect(workbook.worksheets.map((sheet) => sheet.name)).toEqual([
      "Resumo",
      "TAP",
      "EAP",
      "Cronograma Macro",
      "Kick-off",
    ]);

    const tapSheet = workbook.getWorksheet("TAP")!;
    const tapRows = tapSheet.getSheetValues().filter(Boolean) as unknown[][];
    expect(tapRows.flat()).toContain("Lançar o novo portal.");

    const eapSheet = workbook.getWorksheet("EAP")!;
    expect(eapSheet.getRow(2).getCell(1).value).toBe("Infraestrutura");
    expect(eapSheet.getRow(2).getCell(2).value).toContain("Banco de dados");

    const kickoffSheet = workbook.getWorksheet("Kick-off")!;
    const kickoffValues = kickoffSheet
      .getSheetValues()
      .filter(Boolean)
      .flat();
    expect(kickoffValues).toContain("Gerente de Projeto");
    expect(kickoffValues).toContain("Coordenação geral.");
  });

  it("nunca inclui nomes internos de agentes ou termos técnicos da API (RF-058)", async () => {
    const { buffer } = await buildExcelExport(scrumResult);
    const workbook = await readWorkbook(buffer);
    const forbidden = [
      "agente",
      "prompt",
      "gemini",
      "api key",
      "temperature",
      "responseJsonSchema",
    ];

    const allText = workbook.worksheets
      .flatMap((sheet) => sheet.getSheetValues())
      .filter(Boolean)
      .flat()
      .filter((value): value is string => typeof value === "string")
      .join(" ")
      .toLowerCase();

    for (const term of forbidden) {
      expect(allText).not.toContain(term);
    }
  });
});
