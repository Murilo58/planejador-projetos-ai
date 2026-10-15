import type { ConsolidatedResult } from "@/lib/ai/schemas/result";
import {
  hybridKanban,
  hybridScrum,
} from "@/lib/hybrid/__fixtures__/hybrid-packages";

/**
 * Resultados de referência do Planejamento Híbrido para os testes golden
 * das exportações (v1.1, Fase 6). As duas variantes completas usam os
 * pacotes íntegros dos testes de domínio; a variante "com lacunas"
 * exercita todos os tipos de ponto de atenção e o escape de `|` na
 * tabela Markdown.
 *
 * Mesma regra de `golden-results.ts`: alterar estes dados ou os snapshots
 * é uma decisão consciente, nunca um passo de rotina.
 */

const GENERATED_AT = "2026-10-09T12:00:00.000Z";

export const goldenHybridScrum: ConsolidatedResult = {
  framework: "hibrido-scrum",
  generatedAt: GENERATED_AT,
  data: hybridScrum,
  notes: ["Vínculos com a EAP preservados."],
};

export const goldenHybridKanban: ConsolidatedResult = {
  framework: "hibrido-kanban",
  generatedAt: GENERATED_AT,
  data: hybridKanban,
  notes: [],
};

const withGaps = structuredClone(hybridScrum);
// 1.1 sem história; US-02 no entregável agregador "1"; US-03 fora das
// Sprints; fase e marco sem entregável; "|" num título que aparece na
// tabela de rastreabilidade.
withGaps.backlog = [
  { ...withGaps.backlog[1], eapCode: "1" },
  { ...withGaps.backlog[2], title: "Gerar relatório | faltas" },
];
withGaps.firstSprint.selectedStoryIds = ["US-02"];
withGaps.macroSchedule.sprints = [
  { name: "Sprint 1", focus: "Agenda", storyIds: ["US-02"], dependencies: [] },
];
withGaps.schedule.phases.push({
  id: "F3",
  name: "Operação assistida",
  eapCodes: [],
  milestones: [{ id: "M3", name: "Encerramento", eapCodes: [] }],
  dependencies: [],
});

export const goldenHybridScrumWithGaps: ConsolidatedResult = {
  framework: "hibrido-scrum",
  generatedAt: GENERATED_AT,
  data: withGaps,
  notes: [],
};

export const HYBRID_GOLDEN_RESULTS = {
  "hibrido-scrum": goldenHybridScrum,
  "hibrido-kanban": goldenHybridKanban,
  "hibrido-scrum-lacunas": goldenHybridScrumWithGaps,
} as const;
