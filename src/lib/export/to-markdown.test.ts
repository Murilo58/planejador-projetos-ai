import { describe, expect, it } from "vitest";

import { buildMarkdownExport } from "@/lib/export/to-markdown";
import type { ConsolidatedResult } from "@/lib/ai/schemas/result";

const scrumResult: ConsolidatedResult = {
  framework: "scrum",
  generatedAt: "2026-10-09T12:00:00.000Z",
  data: {
    backlog: [
      {
        title: "Login",
        statement: "Como usuário, quero entrar, para acessar o sistema.",
        acceptanceCriteria: ["Credenciais inválidas mostram erro"],
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

describe("buildMarkdownExport", () => {
  it("gera um nome de arquivo com o framework e a data (não um nome genérico)", () => {
    const { filename } = buildMarkdownExport(scrumResult);
    expect(filename).toBe("planejamento-scrum-2026-10-09.md");
  });

  it("inclui o título, o framework e a data de geração (RF-054/055)", () => {
    const { content } = buildMarkdownExport(scrumResult);
    expect(content).toContain("# Planejamento — Scrum");
    expect(content).toContain("Backlog priorizado");
  });

  it("inclui o conteúdo real do backlog", () => {
    const { content } = buildMarkdownExport(scrumResult);
    expect(content).toContain("Login");
    expect(content).toContain("Credenciais inválidas mostram erro");
  });

  it("nunca inclui nomes internos de agentes ou termos técnicos da API (RF-058)", () => {
    const { content } = buildMarkdownExport(scrumResult);
    const forbidden = [
      "agente",
      "prompt",
      "gemini",
      "api key",
      "temperature",
      "responseJsonSchema",
    ];
    const lowerContent = content.toLowerCase();
    for (const term of forbidden) {
      expect(lowerContent).not.toContain(term);
    }
  });
});
