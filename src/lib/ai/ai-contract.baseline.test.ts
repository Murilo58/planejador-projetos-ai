import { createHash } from "node:crypto";

import { describe, expect, it } from "vitest";
import { z } from "zod";

import { AI_CONFIG } from "@/lib/ai/config";
import {
  buildConsolidationPrompt,
  CONSOLIDATION_SYSTEM_INSTRUCTION,
} from "@/lib/ai/prompts/consolidation";
import {
  buildExtractionPrompt,
  EXTRACTION_SYSTEM_INSTRUCTION,
} from "@/lib/ai/prompts/extraction";
import {
  buildKanbanPrompt,
  KANBAN_SYSTEM_INSTRUCTION,
} from "@/lib/ai/prompts/kanban";
import {
  buildScrumPrompt,
  SCRUM_SYSTEM_INSTRUCTION,
} from "@/lib/ai/prompts/scrum";
import {
  buildWaterfallPrompt,
  WATERFALL_SYSTEM_INSTRUCTION,
} from "@/lib/ai/prompts/waterfall";
import { createConsolidationSchema } from "@/lib/ai/schemas/consolidation";
import {
  extractionSchema,
  type ExtractionResult,
} from "@/lib/ai/schemas/extraction";
import { kanbanOutputSchema } from "@/lib/ai/schemas/kanban";
import { scrumOutputSchema } from "@/lib/ai/schemas/scrum";
import { waterfallOutputSchema } from "@/lib/ai/schemas/waterfall";

/**
 * Rede de proteção da v1.1 (Fase 1): congela o contrato que Scrum,
 * Kanban e Cascata enviam hoje ao Gemini — JSON Schemas de saída,
 * instruções de sistema, montagem dos prompts e configuração da IA. O
 * Planejamento Híbrido deve ser construído inteiramente ao lado disso:
 * qualquer alteração aqui muda a geração dos 3 frameworks em produção.
 *
 * Atualizar um snapshot (`vitest -u`) é uma decisão consciente de mudar
 * o comportamento de um framework já homologado — nunca um passo de
 * rotina.
 */

const SNAPSHOT_DIR = "./__snapshots__/ai-contract";

const jsonSchemaOf = (schema: z.ZodType) =>
  JSON.stringify(z.toJSONSchema(schema), null, 2);

const SCHEMAS_SENT_TO_GEMINI = {
  extraction: extractionSchema,
  "structuring-scrum": scrumOutputSchema,
  "structuring-kanban": kanbanOutputSchema,
  "structuring-cascata": waterfallOutputSchema,
  "consolidation-scrum": createConsolidationSchema(scrumOutputSchema),
  "consolidation-kanban": createConsolidationSchema(kanbanOutputSchema),
  "consolidation-cascata": createConsolidationSchema(waterfallOutputSchema),
} as const;

describe("contrato com a IA — JSON Schemas", () => {
  it.each(Object.entries(SCHEMAS_SENT_TO_GEMINI))(
    "%s: JSON Schema idêntico ao homologado",
    async (name, schema) => {
      await expect(jsonSchemaOf(schema)).toMatchFileSnapshot(
        `${SNAPSHOT_DIR}/${name}.schema.json`,
      );
    },
  );

  it("bate com a linha de base registrada na Fase 0 (docs/v1.1/poc-fase0.md)", () => {
    const hash = (schema: z.ZodType) =>
      createHash("sha256")
        .update(JSON.stringify(z.toJSONSchema(schema)))
        .digest("hex")
        .slice(0, 16);

    expect({
      scrum: hash(scrumOutputSchema),
      kanban: hash(kanbanOutputSchema),
      cascata: hash(waterfallOutputSchema),
    }).toEqual({
      scrum: "0487214337a63398",
      kanban: "d755e04e9e0ddcc9",
      cascata: "e70ef7dc8ac9011e",
    });
  });
});

describe("contrato com a IA — instruções e prompts", () => {
  const SYSTEM_INSTRUCTIONS = {
    extraction: EXTRACTION_SYSTEM_INSTRUCTION,
    scrum: SCRUM_SYSTEM_INSTRUCTION,
    kanban: KANBAN_SYSTEM_INSTRUCTION,
    cascata: WATERFALL_SYSTEM_INSTRUCTION,
    consolidation: CONSOLIDATION_SYSTEM_INSTRUCTION,
  };

  it.each(Object.entries(SYSTEM_INSTRUCTIONS))(
    "%s: instrução de sistema idêntica à homologada",
    async (name, instruction) => {
      await expect(instruction).toMatchFileSnapshot(
        `${SNAPSHOT_DIR}/${name}.system-instruction.txt`,
      );
    },
  );

  const extraction: ExtractionResult = {
    title: "Portal",
    objective: "Lançar o portal.",
    requirements: ["Login"],
    deliverables: ["Portal"],
    stakeholders: [],
    assumptions: [],
    constraints: [],
    dependencies: [],
    deadlines: [],
    milestones: [],
    additionalRelevantInformation: [],
  };

  it("montagem dos prompts de usuário idêntica à homologada", async () => {
    const prompts = [
      buildExtractionPrompt("Especificação de exemplo."),
      buildScrumPrompt(extraction),
      buildKanbanPrompt(extraction),
      buildWaterfallPrompt(extraction),
      buildConsolidationPrompt({
        frameworkLabel: "Scrum",
        extraction,
        structuredOutput: { exemplo: true },
      }),
    ].join("\n\n=====\n\n");

    await expect(prompts).toMatchFileSnapshot(
      `${SNAPSHOT_DIR}/user-prompts.txt`,
    );
  });
});

describe("contrato com a IA — configuração", () => {
  it("parâmetros de geração idênticos aos homologados (v1.0.2)", () => {
    expect(AI_CONFIG.model).toBe(
      process.env.GEMINI_MODEL?.trim() || "gemini-flash-latest",
    );
    expect({
      temperature: AI_CONFIG.temperature,
      maxOutputTokens: AI_CONFIG.maxOutputTokens,
      timeoutMs: AI_CONFIG.timeoutMs,
      maxAttemptsPerStage: AI_CONFIG.maxAttemptsPerStage,
      transientRetryDelay: AI_CONFIG.transientRetryDelay,
    }).toEqual({
      temperature: 0.3,
      maxOutputTokens: 8192,
      timeoutMs: 60_000,
      maxAttemptsPerStage: 2,
      transientRetryDelay: { minMs: 2_000, maxMs: 5_000 },
    });
  });
});
