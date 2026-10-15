import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { AI_CONFIG } from "@/lib/ai/config";
import { CONSOLIDATION_SYSTEM_INSTRUCTION } from "@/lib/ai/prompts/consolidation";
import {
  HYBRID_CONSOLIDATION_ADDENDUM,
  HYBRID_KANBAN_SYSTEM_INSTRUCTION,
  HYBRID_SCRUM_SYSTEM_INSTRUCTION,
} from "@/lib/ai/prompts/hybrid";
import { SCRUM_SYSTEM_INSTRUCTION } from "@/lib/ai/prompts/scrum";
import type { ExtractionResult } from "@/lib/ai/schemas/extraction";
import {
  hybridKanbanOutputSchema,
  hybridScrumOutputSchema,
  type HybridScrumOutput,
} from "@/lib/ai/schemas/hybrid";
import { scrumOutputSchema } from "@/lib/ai/schemas/scrum";
import { AiGenerationError } from "@/lib/ai/errors";
import {
  hybridKanban,
  hybridScrum,
} from "@/lib/hybrid/__fixtures__/hybrid-packages";

/**
 * Pipeline de geração (Server Actions) com a IA, a sessão e a cota
 * simuladas — nenhuma chamada real ao Gemini nem ao banco. Cobre:
 *  - o Planejamento Híbrido (v1.1): feature flag, chamada única de
 *    estruturação, consolidação com o adendo, revalidação dos vínculos;
 *  - a regressão do pipeline atual: Scrum (representando os 3
 *    frameworks) continua enviando exatamente o mesmo à IA.
 */

const mocks = vi.hoisted(() => ({
  generateStructured: vi.fn(),
  auth: vi.fn(),
  beginGeneration: vi.fn(),
  continueGeneration: vi.fn(),
  markGenerationCompleted: vi.fn(),
}));

vi.mock("@/lib/ai/generate-structured", () => ({
  generateStructured: mocks.generateStructured,
}));
vi.mock("@/auth", () => ({ auth: mocks.auth }));
vi.mock("@/lib/rate-limit/generation-quota", () => ({
  generationIdSchema: z.string().uuid(),
  beginGeneration: mocks.beginGeneration,
  continueGeneration: mocks.continueGeneration,
  markGenerationCompleted: mocks.markGenerationCompleted,
}));
vi.mock("@/lib/ai/log", () => ({ logAiEvent: vi.fn() }));

const {
  runConsolidationStep,
  runExtractionStep,
  runHybridConsolidationStep,
  runHybridExtractionStep,
  runHybridStructuringStep,
  runStructuringStep,
} = await import("@/lib/ai/actions");

const GENERATION_ID = "5f0c7b1e-2a3d-4c5b-9e8f-1a2b3c4d5e6f";
const SPEC_TEXT = "Especificação técnica de teste. ".repeat(10);

const extraction: ExtractionResult = {
  title: "Agendamento",
  requirements: ["Agendamento online"],
  deliverables: ["Módulo de agendamento"],
  stakeholders: [],
  assumptions: [],
  constraints: [],
  dependencies: [],
  deadlines: [],
  milestones: [],
  successCriteria: [],
  additionalRelevantInformation: [],
};

const lastCall = () =>
  mocks.generateStructured.mock.calls.at(-1)?.[0] as {
    stage: string;
    schema: unknown;
    systemInstruction: string;
    prompt: string;
    maxOutputTokens?: number;
  };

beforeEach(() => {
  vi.stubEnv("HYBRID_PLANNING_ENABLED", "true");
  mocks.auth.mockResolvedValue({ user: { id: "user-1" } });
  mocks.beginGeneration.mockResolvedValue({ allowed: true });
  mocks.continueGeneration.mockResolvedValue({ allowed: true });
  mocks.markGenerationCompleted.mockResolvedValue(undefined);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

describe("Híbrido — feature flag (kill-switch no servidor)", () => {
  it.each([undefined, "false", "1", ""])(
    "com HYBRID_PLANNING_ENABLED=%s, nenhuma etapa consome IA, cota ou sessão",
    async (value) => {
      if (value === undefined) vi.stubEnv("HYBRID_PLANNING_ENABLED", undefined);
      else vi.stubEnv("HYBRID_PLANNING_ENABLED", value);

      const results = [
        await runHybridExtractionStep({
          sourceType: "text",
          text: SPEC_TEXT,
          framework: "hibrido-scrum",
          generationId: GENERATION_ID,
        }),
        await runHybridStructuringStep(
          "hibrido-scrum",
          extraction,
          GENERATION_ID,
        ),
        await runHybridConsolidationStep(
          "hibrido-scrum",
          extraction,
          { framework: "hibrido-scrum", data: hybridScrum },
          GENERATION_ID,
        ),
      ];

      for (const result of results) {
        expect(result).toEqual({
          success: false,
          code: "validation",
          message: "O Planejamento Híbrido não está disponível no momento.",
        });
      }
      expect(mocks.generateStructured).not.toHaveBeenCalled();
      expect(mocks.beginGeneration).not.toHaveBeenCalled();
      expect(mocks.continueGeneration).not.toHaveBeenCalled();
      expect(mocks.auth).not.toHaveBeenCalled();
    },
  );
});

describe("Híbrido — Etapa 1 (extração)", () => {
  it("abre a geração (cobra a cota uma vez) e extrai, como os demais frameworks", async () => {
    mocks.generateStructured.mockResolvedValueOnce(extraction);

    const result = await runHybridExtractionStep({
      sourceType: "text",
      text: SPEC_TEXT,
      framework: "hibrido-kanban",
      generationId: GENERATION_ID,
    });

    expect(result).toEqual({ success: true, data: extraction });
    expect(mocks.beginGeneration).toHaveBeenCalledWith("user-1", GENERATION_ID);
    expect(lastCall().stage).toBe("extraction");
  });

  it("rejeita no servidor um framework que não é híbrido", async () => {
    const result = await runHybridExtractionStep({
      sourceType: "text",
      text: SPEC_TEXT,
      framework: "scrum" as never,
      generationId: GENERATION_ID,
    });
    expect(result).toMatchObject({ success: false, code: "validation" });
    expect(mocks.beginGeneration).not.toHaveBeenCalled();
  });

  it("devolve sessão expirada sem consumir a cota", async () => {
    mocks.auth.mockResolvedValueOnce(null);
    const result = await runHybridExtractionStep({
      sourceType: "text",
      text: SPEC_TEXT,
      framework: "hibrido-scrum",
      generationId: GENERATION_ID,
    });
    expect(result).toMatchObject({ success: false, code: "session_expired" });
    expect(mocks.beginGeneration).not.toHaveBeenCalled();
  });
});

describe("Híbrido — Etapa 2 (estruturação em chamada única)", () => {
  it.each([
    [
      "hibrido-scrum",
      "structuring_hibrido_scrum",
      hybridScrumOutputSchema,
      HYBRID_SCRUM_SYSTEM_INSTRUCTION,
      hybridScrum,
    ],
    [
      "hibrido-kanban",
      "structuring_hibrido_kanban",
      hybridKanbanOutputSchema,
      HYBRID_KANBAN_SYSTEM_INSTRUCTION,
      hybridKanban,
    ],
  ] as const)(
    "%s: uma única chamada, com o schema, a instrução e o teto de tokens do Híbrido",
    async (framework, stage, schema, instruction, data) => {
      mocks.generateStructured.mockResolvedValueOnce(data);

      const result = await runHybridStructuringStep(
        framework,
        extraction,
        GENERATION_ID,
      );

      expect(result).toEqual({ success: true, data: { framework, data } });
      expect(mocks.generateStructured).toHaveBeenCalledTimes(1);
      expect(lastCall()).toMatchObject({
        stage,
        schema,
        systemInstruction: instruction,
        maxOutputTokens: AI_CONFIG.hybridMaxOutputTokens,
      });
      expect(lastCall().prompt).toContain('"Módulo de agendamento"');
      expect(mocks.continueGeneration).toHaveBeenCalledWith(
        "user-1",
        GENERATION_ID,
      );
      expect(mocks.beginGeneration).not.toHaveBeenCalled();
    },
  );

  it("o teto do Híbrido é maior que o dos demais frameworks, que não muda", () => {
    expect(AI_CONFIG.hybridMaxOutputTokens).toBe(16_384);
    expect(AI_CONFIG.maxOutputTokens).toBe(8192);
  });

  it("propaga a falha da IA (ex.: vínculos inválidos após as tentativas) como resposta inválida", async () => {
    mocks.generateStructured.mockRejectedValueOnce(
      new AiGenerationError("invalid_response", "fora do contrato"),
    );
    const result = await runHybridStructuringStep(
      "hibrido-scrum",
      extraction,
      GENERATION_ID,
    );
    expect(result).toMatchObject({ success: false, code: "invalid_response" });
  });

  it("respeita a cota: geração inexistente ou já concluída não continua", async () => {
    mocks.continueGeneration.mockResolvedValueOnce({
      allowed: false,
      reason: "invalid_generation",
    });
    const result = await runHybridStructuringStep(
      "hibrido-kanban",
      extraction,
      GENERATION_ID,
    );
    expect(result).toMatchObject({
      success: false,
      code: "invalid_generation",
    });
    expect(mocks.generateStructured).not.toHaveBeenCalled();
  });
});

describe("Híbrido — Etapa 3 (consolidação)", () => {
  it("anexa o adendo do Híbrido à instrução existente, usa o teto do Híbrido e conclui a geração", async () => {
    mocks.generateStructured.mockResolvedValueOnce({
      data: hybridScrum,
      notes: ["Vínculos preservados."],
    });

    const result = await runHybridConsolidationStep(
      "hibrido-scrum",
      extraction,
      { framework: "hibrido-scrum", data: hybridScrum },
      GENERATION_ID,
    );

    expect(result).toMatchObject({
      success: true,
      data: {
        framework: "hibrido-scrum",
        data: hybridScrum,
        notes: ["Vínculos preservados."],
      },
    });
    expect(lastCall()).toMatchObject({
      stage: "consolidation_hibrido_scrum",
      systemInstruction: `${CONSOLIDATION_SYSTEM_INSTRUCTION}\n\n${HYBRID_CONSOLIDATION_ADDENDUM}`,
      maxOutputTokens: AI_CONFIG.hybridMaxOutputTokens,
    });
    expect(lastCall().prompt).toContain("Framework: Híbrido — Cascata + Scrum");
    expect(mocks.markGenerationCompleted).toHaveBeenCalledWith(GENERATION_ID);
  });

  it("revalida os vínculos do pacote recebido do cliente antes de consumir a IA", async () => {
    const tampered = structuredClone(hybridScrum) as HybridScrumOutput;
    tampered.backlog[0].eapCode = "9";

    const result = await runHybridConsolidationStep(
      "hibrido-scrum",
      extraction,
      { framework: "hibrido-scrum", data: tampered },
      GENERATION_ID,
    );

    expect(result).toEqual({
      success: false,
      code: "validation",
      message: "Os dados estruturados são inválidos.",
    });
    expect(mocks.generateStructured).not.toHaveBeenCalled();
    expect(mocks.markGenerationCompleted).not.toHaveBeenCalled();
  });

  it("rejeita pacote de uma variante declarado como da outra", async () => {
    const result = await runHybridConsolidationStep(
      "hibrido-kanban",
      extraction,
      { framework: "hibrido-scrum", data: hybridScrum },
      GENERATION_ID,
    );
    expect(result).toMatchObject({ success: false, code: "validation" });
    expect(mocks.generateStructured).not.toHaveBeenCalled();
  });

  it("não conclui a geração se o resultado consolidado violar o contrato", async () => {
    mocks.generateStructured.mockResolvedValueOnce({
      data: { ...hybridKanban, items: [] },
      notes: [],
    });
    const result = await runHybridConsolidationStep(
      "hibrido-kanban",
      extraction,
      { framework: "hibrido-kanban", data: hybridKanban },
      GENERATION_ID,
    );
    expect(result).toMatchObject({ success: false, code: "invalid_response" });
    expect(mocks.markGenerationCompleted).not.toHaveBeenCalled();
  });
});

describe("regressão — pipeline atual de Scrum, Kanban e Cascata", () => {
  const scrumData = {
    backlog: [
      {
        title: "Login",
        statement: "Como usuário, quero entrar, para acessar o sistema.",
        acceptanceCriteria: ["Credenciais inválidas mostram erro"],
        businessValue: "alta",
        complexity: "baixa",
        priorityJustification: "Pré-requisito.",
      },
    ],
    firstSprint: { selectedStoryTitles: ["Login"], rationale: "Base." },
    macroSchedule: {
      sprints: [{ name: "Sprint 1", focus: "Login", dependencies: [] }],
    },
  };

  it("extração continua abrindo a geração e chamando a IA da mesma forma", async () => {
    mocks.generateStructured.mockResolvedValueOnce(extraction);
    const result = await runExtractionStep({
      sourceType: "text",
      text: SPEC_TEXT,
      framework: "scrum",
      generationId: GENERATION_ID,
    });
    expect(result).toEqual({ success: true, data: extraction });
    expect(mocks.beginGeneration).toHaveBeenCalledWith("user-1", GENERATION_ID);
    expect(lastCall().stage).toBe("extraction");
    expect(lastCall().maxOutputTokens).toBeUndefined();
  });

  it("a extração dos frameworks atuais continua rejeitando ids do Híbrido (RN-002)", async () => {
    const result = await runExtractionStep({
      sourceType: "text",
      text: SPEC_TEXT,
      framework: "hibrido-scrum" as never,
      generationId: GENERATION_ID,
    });
    expect(result).toMatchObject({ success: false, code: "validation" });
  });

  it("estruturação Scrum: mesma instrução, mesmo schema, sem teto de tokens do Híbrido", async () => {
    mocks.generateStructured.mockResolvedValueOnce(scrumData);
    await runStructuringStep("scrum", extraction, GENERATION_ID);
    expect(lastCall()).toMatchObject({
      stage: "structuring_scrum",
      schema: scrumOutputSchema,
      systemInstruction: SCRUM_SYSTEM_INSTRUCTION,
    });
    expect(lastCall().maxOutputTokens).toBeUndefined();
  });

  it("consolidação Scrum: instrução EXATAMENTE igual à existente, sem adendo e sem teto do Híbrido", async () => {
    mocks.generateStructured.mockResolvedValueOnce({
      data: scrumData,
      notes: [],
    });
    const result = await runConsolidationStep(
      "scrum",
      extraction,
      { framework: "scrum", data: scrumData as never },
      GENERATION_ID,
    );
    expect(result.success).toBe(true);
    expect(lastCall().systemInstruction).toBe(CONSOLIDATION_SYSTEM_INSTRUCTION);
    expect(lastCall().stage).toBe("consolidation_scrum");
    expect(lastCall().maxOutputTokens).toBeUndefined();
  });

  describe("critérios de sucesso do projeto (successCriteria)", () => {
    const withCriteria: ExtractionResult = {
      ...extraction,
      successCriteria: ["Build de produção aprovado (seção 106)"],
    };
    const legacyExtraction = Object.fromEntries(
      Object.entries(extraction).filter(([key]) => key !== "successCriteria"),
    ) as never;

    it.each([
      ["scrum", scrumData],
      ["kanban", { columns: hybridKanban.columns, items: hybridKanban.items }],
    ] as const)(
      "%s: estruturação e consolidação recebem os dados extraídos da v1.0.2, sem o campo",
      async (framework, data) => {
        mocks.generateStructured.mockResolvedValueOnce(data);
        await runStructuringStep(framework, withCriteria, GENERATION_ID);
        expect(lastCall().prompt).not.toContain("successCriteria");

        mocks.generateStructured.mockResolvedValueOnce({ data, notes: [] });
        await runConsolidationStep(
          framework,
          withCriteria,
          { framework, data: data as never },
          GENERATION_ID,
        );
        expect(lastCall().stage).toBe(`consolidation_${framework}`);
        expect(lastCall().prompt).not.toContain("successCriteria");
      },
    );

    it("Cascata e Híbrido recebem os critérios na estruturação do TAP", async () => {
      mocks.generateStructured.mockResolvedValueOnce({});
      await runStructuringStep("cascata", withCriteria, GENERATION_ID);
      expect(lastCall().prompt).toContain(
        "Build de produção aprovado (seção 106)",
      );

      mocks.generateStructured.mockResolvedValueOnce(hybridScrum);
      await runHybridStructuringStep(
        "hibrido-scrum",
        withCriteria,
        GENERATION_ID,
      );
      expect(lastCall().prompt).toContain(
        "Build de produção aprovado (seção 106)",
      );
    });

    it("aceita, entre as etapas, uma extração anterior ao campo (geração iniciada antes do deploy)", async () => {
      mocks.generateStructured.mockResolvedValueOnce(scrumData);
      const result = await runStructuringStep(
        "scrum",
        legacyExtraction,
        GENERATION_ID,
      );
      expect(result.success).toBe(true);

      mocks.generateStructured.mockResolvedValueOnce(hybridScrum);
      const hybrid = await runHybridStructuringStep(
        "hibrido-scrum",
        legacyExtraction,
        GENERATION_ID,
      );
      expect(hybrid.success).toBe(true);
      expect(lastCall().prompt).toContain('"successCriteria": []');
    });
  });

  it("a flag do Híbrido não afeta os frameworks atuais", async () => {
    vi.stubEnv("HYBRID_PLANNING_ENABLED", "false");
    mocks.generateStructured.mockResolvedValueOnce(scrumData);
    const result = await runStructuringStep("scrum", extraction, GENERATION_ID);
    expect(result.success).toBe(true);
  });
});
