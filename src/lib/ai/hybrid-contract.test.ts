import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  buildHybridPrompt,
  HYBRID_CONSOLIDATION_ADDENDUM,
  HYBRID_KANBAN_SYSTEM_INSTRUCTION,
  HYBRID_SCRUM_SYSTEM_INSTRUCTION,
} from "@/lib/ai/prompts/hybrid";
import { createConsolidationSchema } from "@/lib/ai/schemas/consolidation";
import {
  hybridKanbanOutputSchema,
  hybridScrumOutputSchema,
} from "@/lib/ai/schemas/hybrid";
import { hybridResultSchema } from "@/lib/ai/schemas/hybrid-result";
import {
  hybridKanban,
  hybridScrum,
} from "@/lib/hybrid/__fixtures__/hybrid-packages";

/**
 * Contrato do Planejamento Híbrido com a IA (v1.1, Fase 3): JSON Schemas
 * e instruções enviados ao Gemini nas etapas de estruturação e
 * consolidação do Híbrido. Mesma regra dos snapshots dos frameworks
 * atuais (`ai-contract.baseline.test.ts`): atualizar é uma decisão
 * consciente, a ser revalidada contra o Gemini.
 */

const SNAPSHOT_DIR = "./__snapshots__/hybrid-contract";

const SCHEMAS = {
  "structuring-hibrido-scrum": hybridScrumOutputSchema,
  "structuring-hibrido-kanban": hybridKanbanOutputSchema,
  "consolidation-hibrido-scrum": createConsolidationSchema(
    hybridScrumOutputSchema,
  ),
  "consolidation-hibrido-kanban": createConsolidationSchema(
    hybridKanbanOutputSchema,
  ),
} as const;

describe("contrato do Híbrido com a IA", () => {
  it.each(Object.entries(SCHEMAS))(
    "%s: JSON Schema congelado e compatível com o Gemini",
    async (name, schema) => {
      const json = JSON.stringify(z.toJSONSchema(schema), null, 2);
      for (const keyword of ['"$ref"', '"oneOf"', '"anyOf"', '"allOf"']) {
        expect(json).not.toContain(keyword);
      }
      await expect(json).toMatchFileSnapshot(
        `${SNAPSHOT_DIR}/${name}.schema.json`,
      );
    },
  );

  it.each(
    Object.entries({
      "hibrido-scrum": HYBRID_SCRUM_SYSTEM_INSTRUCTION,
      "hibrido-kanban": HYBRID_KANBAN_SYSTEM_INSTRUCTION,
      "consolidation-addendum": HYBRID_CONSOLIDATION_ADDENDUM,
    }),
  )("%s: instrução congelada", async (name, instruction) => {
    await expect(instruction).toMatchFileSnapshot(
      `${SNAPSHOT_DIR}/${name}.system-instruction.txt`,
    );
  });

  it("instruções exigem rastreabilidade e proíbem invenção e Kick-off", () => {
    for (const instruction of [
      HYBRID_SCRUM_SYSTEM_INSTRUCTION,
      HYBRID_KANBAN_SYSTEM_INSTRUCTION,
    ]) {
      expect(instruction).toContain('"eapCode"');
      expect(instruction).toContain('"M1", "M2"');
      expect(instruction).toContain("Não produza material de Kick-off.");
      expect(instruction).toContain("capacidade do time");
    }
  });

  it("o prompt de usuário leva apenas os dados extraídos, nunca o texto original", () => {
    const prompt = buildHybridPrompt({
      requirements: ["Agendamento"],
      deliverables: [],
      stakeholders: [],
      assumptions: [],
      constraints: [],
      dependencies: [],
      deadlines: [],
      milestones: [],
      additionalRelevantInformation: [],
    });
    expect(
      prompt.startsWith("Dados extraídos da especificação original (JSON):"),
    ).toBe(true);
    expect(prompt).toContain('"Agendamento"');
  });
});

describe("hybridResultSchema", () => {
  it("aceita resultados das duas variantes e rejeita a combinação trocada", () => {
    const base = { generatedAt: "2026-10-14T12:00:00.000Z", notes: [] };
    expect(
      hybridResultSchema.safeParse({
        ...base,
        framework: "hibrido-scrum",
        data: hybridScrum,
      }).success,
    ).toBe(true);
    expect(
      hybridResultSchema.safeParse({
        ...base,
        framework: "hibrido-kanban",
        data: hybridKanban,
      }).success,
    ).toBe(true);
    expect(
      hybridResultSchema.safeParse({
        ...base,
        framework: "hibrido-kanban",
        data: hybridScrum,
      }).success,
    ).toBe(false);
  });

  it("não aceita os frameworks atuais (contratos separados até a Fase 5)", () => {
    expect(
      hybridResultSchema.safeParse({
        framework: "scrum",
        generatedAt: "2026-10-14T12:00:00.000Z",
        data: hybridScrum,
        notes: [],
      }).success,
    ).toBe(false);
  });
});
