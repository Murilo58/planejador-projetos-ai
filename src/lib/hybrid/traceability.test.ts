import { describe, expect, it } from "vitest";

import type {
  HybridKanbanOutput,
  HybridScrumOutput,
} from "@/lib/ai/schemas/hybrid";
import {
  hybridKanban,
  hybridScrum,
} from "@/lib/hybrid/__fixtures__/hybrid-packages";
import { buildTraceabilityMatrix } from "@/lib/hybrid/traceability";

const scrum = () => structuredClone(hybridScrum) as HybridScrumOutput;
const kanban = () => structuredClone(hybridKanban) as HybridKanbanOutput;

describe("buildTraceabilityMatrix — vínculos válidos", () => {
  it("gera uma linha por folha da EAP, na ordem da EAP, com fases, marcos e itens", () => {
    const matrix = buildTraceabilityMatrix({ variant: "scrum", data: scrum() });

    expect(matrix.rows).toEqual([
      {
        code: "1.1",
        deliverable: { code: "1", name: "Módulo de agendamento" },
        subDeliverable: { code: "1.1", name: "Agenda por profissional" },
        phases: [{ id: "F1", name: "Construção" }],
        milestones: [{ id: "M2", name: "Produção nas três unidades" }],
        items: [{ id: "US-01", title: "Configurar agenda" }],
      },
      {
        code: "1.2",
        deliverable: { code: "1", name: "Módulo de agendamento" },
        subDeliverable: { code: "1.2", name: "Agendamento online" },
        phases: [{ id: "F1", name: "Construção" }],
        milestones: [
          { id: "M1", name: "Homologação na unidade Centro" },
          { id: "M2", name: "Produção nas três unidades" },
        ],
        items: [{ id: "US-02", title: "Agendar consulta online" }],
      },
      {
        code: "2",
        deliverable: { code: "2", name: "Relatório de faltas" },
        phases: [{ id: "F2", name: "Implantação" }],
        milestones: [{ id: "M2", name: "Produção nas três unidades" }],
        items: [{ id: "US-03", title: "Gerar relatório de faltas" }],
      },
    ]);
  });

  it("não gera pontos de atenção quando a cobertura é completa", () => {
    expect(
      buildTraceabilityMatrix({ variant: "scrum", data: scrum() })
        .attentionPoints,
    ).toEqual([]);
    expect(
      buildTraceabilityMatrix({ variant: "kanban", data: kanban() })
        .attentionPoints,
    ).toEqual([]);
  });

  it("resume a cobertura para a interface e as exportações", () => {
    expect(
      buildTraceabilityMatrix({ variant: "kanban", data: kanban() }).summary,
    ).toEqual({
      leaves: 3,
      leavesWithItems: 3,
      items: 3,
      itemsOnLeaves: 3,
      milestones: 2,
      milestonesWithEap: 2,
    });
  });

  it("agrupa vários itens na mesma folha, na ordem de prioridade", () => {
    const data = kanban();
    data.items[2].eapCode = "1.1";
    const row = buildTraceabilityMatrix({ variant: "kanban", data }).rows[0];
    expect(row.items.map((item) => item.id)).toEqual(["KB-01", "KB-03"]);
  });
});

describe("buildTraceabilityMatrix — entregáveis sem vínculo viram pontos de atenção", () => {
  it("entregável sem item de execução", () => {
    const data = scrum();
    data.backlog = data.backlog.filter((item) => item.id !== "US-02");
    data.macroSchedule.sprints[1].storyIds = ["US-03"];

    const matrix = buildTraceabilityMatrix({ variant: "scrum", data });
    expect(matrix.rows[1].items).toEqual([]);
    expect(matrix.attentionPoints).toEqual([
      {
        kind: "entregavel_sem_item",
        ref: "1.2",
        message:
          "1.2 Agendamento online: nenhum item de execução vinculado. Revise se é esperado (ex.: entregável documental) ou se falta trabalho no backlog.",
      },
    ]);
    expect(matrix.summary.leavesWithItems).toBe(2);
  });

  it("não deduz vínculos pelo texto: item que descreve a folha vizinha não a cobre", () => {
    const data = scrum();
    data.backlog = data.backlog.filter((item) => item.id !== "US-02");
    data.macroSchedule.sprints[1].storyIds = ["US-03"];
    // US-01 (vinculada ao 1.1) passa a descrever também o 1.2.
    data.backlog[0].statement +=
      " Inclui o agendamento online de consultas pelo paciente.";
    data.backlog[0].acceptanceCriteria.push(
      "Agendamento online disponível para os pacientes.",
    );

    const matrix = buildTraceabilityMatrix({ variant: "scrum", data });
    expect(matrix.rows[1].items).toEqual([]);
    expect(matrix.attentionPoints.map((point) => point.ref)).toEqual(["1.2"]);

    const board = kanban();
    const linkedTo12 = board.items.find((item) => item.eapCode === "1.2")!;
    board.items = board.items.filter((item) => item !== linkedTo12);
    board.items[0].description += ` ${linkedTo12.title}.`;
    expect(
      buildTraceabilityMatrix({
        variant: "kanban",
        data: board,
      }).attentionPoints.map((point) => point.ref),
    ).toEqual(["1.2"]);
  });

  it("no Kanban, a orientação fala do quadro, não do backlog", () => {
    const data = kanban();
    data.items = data.items.filter((item) => item.eapCode !== "2");
    const [point] = buildTraceabilityMatrix({
      variant: "kanban",
      data,
    }).attentionPoints;
    expect(point.kind).toBe("entregavel_sem_item");
    expect(point.message).toContain("falta trabalho no quadro");
  });

  it("entregável sem fase, fase sem entregável e marco sem entregável", () => {
    const data = kanban();
    data.schedule.phases[1].eapCodes = [];
    data.schedule.phases[1].milestones[0].eapCodes = [];

    const matrix = buildTraceabilityMatrix({ variant: "kanban", data });
    expect(
      matrix.attentionPoints.map(({ kind, ref }) => ({ kind, ref })),
    ).toEqual([
      { kind: "entregavel_sem_fase", ref: "2" },
      { kind: "fase_sem_entregavel", ref: "F2" },
      { kind: "marco_sem_entregavel", ref: "M2" },
    ]);
    expect(matrix.summary.milestonesWithEap).toBe(1);
  });

  it("item vinculado ao entregável agregador em vez de a um subentregável", () => {
    const data = scrum();
    data.backlog[0].eapCode = "1";

    const matrix = buildTraceabilityMatrix({ variant: "scrum", data });
    expect(
      matrix.attentionPoints.map(({ kind, ref }) => ({ kind, ref })),
    ).toEqual([
      { kind: "entregavel_sem_item", ref: "1.1" },
      { kind: "item_em_entregavel_agregador", ref: "US-01" },
    ]);
    expect(matrix.summary.itemsOnLeaves).toBe(2);
  });

  it("história do backlog fora de todas as Sprints do cronograma macro (somente Scrum)", () => {
    const data = scrum();
    data.macroSchedule.sprints[1].storyIds = ["US-02"];

    expect(
      buildTraceabilityMatrix({ variant: "scrum", data }).attentionPoints,
    ).toEqual([
      {
        kind: "historia_fora_das_sprints",
        ref: "US-03",
        message:
          "US-03 Gerar relatório de faltas: não está prevista em nenhuma Sprint do cronograma macro.",
      },
    ]);
  });
});

describe("buildTraceabilityMatrix — função pura", () => {
  it("não altera o pacote recebido e é determinística", () => {
    const data = scrum();
    const before = structuredClone(data);
    const first = buildTraceabilityMatrix({ variant: "scrum", data });
    const second = buildTraceabilityMatrix({ variant: "scrum", data });
    expect(data).toEqual(before);
    expect(second).toEqual(first);
  });
});
