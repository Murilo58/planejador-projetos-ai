import { describe, expect, it } from "vitest";

import {
  extractionRoundTripSchema,
  extractionSchema,
  omitSuccessCriteria,
} from "@/lib/ai/schemas/extraction";
import { scrumOutputSchema } from "@/lib/ai/schemas/scrum";
import { kanbanOutputSchema } from "@/lib/ai/schemas/kanban";
import { waterfallOutputSchema } from "@/lib/ai/schemas/waterfall";
import { consolidatedResultSchema } from "@/lib/ai/schemas/result";

describe("extractionSchema", () => {
  it("aceita uma extração completa, com listas vazias para o que não foi encontrado", () => {
    const result = extractionSchema.safeParse({
      requirements: ["Login com email e senha"],
      deliverables: [],
      stakeholders: [],
      assumptions: [],
      constraints: [],
      dependencies: [],
      deadlines: [],
      milestones: [],
      successCriteria: [],
      additionalRelevantInformation: [],
    });
    expect(result.success).toBe(true);
  });

  it("rejeita quando falta um campo de lista obrigatório", () => {
    const result = extractionSchema.safeParse({
      requirements: [],
    });
    expect(result.success).toBe(false);
  });
});

describe("successCriteria na extração (v1.1)", () => {
  const legacy = {
    requirements: ["Login com email e senha"],
    deliverables: [],
    stakeholders: [],
    assumptions: [],
    constraints: [],
    dependencies: [],
    deadlines: [],
    milestones: [],
    additionalRelevantInformation: [],
  };

  it("a IA continua obrigada a devolver o campo (lista vazia quando não houver)", () => {
    expect(extractionSchema.safeParse(legacy).success).toBe(false);
    expect(extractionSchema.shape.successCriteria.safeParse([]).success).toBe(
      true,
    );
  });

  it("a revalidação entre etapas aceita extrações anteriores, com lista vazia", () => {
    const parsed = extractionRoundTripSchema.parse(legacy);
    expect(parsed.successCriteria).toEqual([]);
    expect(
      extractionRoundTripSchema.parse({
        ...legacy,
        successCriteria: ["Build de produção aprovado (seção 106)"],
      }).successCriteria,
    ).toEqual(["Build de produção aprovado (seção 106)"]);
  });

  it("Scrum e Kanban recebem a extração sem o campo, na ordem original", () => {
    const withCriteria = extractionRoundTripSchema.parse({
      ...legacy,
      successCriteria: ["Aplicação publicada (seção 106)"],
    });
    const stripped = omitSuccessCriteria(withCriteria);
    expect(stripped).not.toHaveProperty("successCriteria");
    expect(JSON.stringify(stripped)).toBe(JSON.stringify(legacy));
  });
});

describe("scrumOutputSchema", () => {
  const validScrum = {
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
  };

  it("aceita um backlog válido", () => {
    expect(scrumOutputSchema.safeParse(validScrum).success).toBe(true);
  });

  it("rejeita backlog vazio (RF-035 exige pelo menos uma história)", () => {
    const result = scrumOutputSchema.safeParse({ ...validScrum, backlog: [] });
    expect(result.success).toBe(false);
  });

  it("rejeita um nível de prioridade fora de alta/media/baixa", () => {
    const invalid = {
      ...validScrum,
      backlog: [{ ...validScrum.backlog[0], businessValue: "urgente" }],
    };
    expect(scrumOutputSchema.safeParse(invalid).success).toBe(false);
  });
});

describe("kanbanOutputSchema", () => {
  const validKanban = {
    columns: [
      {
        name: "Backlog",
        wipLimit: "Sem limite",
        wipJustification: "Coluna de entrada.",
      },
    ],
    items: [
      {
        title: "Login",
        description: "Tela de login",
        type: "funcionalidade",
        priority: "alta",
        column: "Backlog",
      },
    ],
  };

  it("aceita um quadro válido", () => {
    expect(kanbanOutputSchema.safeParse(validKanban).success).toBe(true);
  });

  it("rejeita wipLimit como número (deve ser texto — ver README, incompatibilidade com o Gemini)", () => {
    const invalid = {
      ...validKanban,
      columns: [{ ...validKanban.columns[0], wipLimit: 3 }],
    };
    expect(kanbanOutputSchema.safeParse(invalid).success).toBe(false);
  });
});

describe("waterfallOutputSchema", () => {
  const validWaterfall = {
    tap: {
      objective: "Entregar o MVP.",
      scopeSummary: "Autenticação, entrada, geração e exportação.",
      stakeholders: [],
      successCriteria: [],
      assumptions: [],
      constraints: [],
    },
    eap: { deliverables: [{ name: "Plataforma" }] },
    schedule: {
      phases: [{ name: "Fundação", milestones: [], dependencies: [] }],
    },
    kickoff: {
      title: "Kick-off",
      objective: "Alinhar o time.",
      scope: "MVP completo.",
      keyMilestones: [],
      rolesAndResponsibilities: [],
    },
  };

  it("aceita uma EAP de dois níveis (entregável + subentregáveis)", () => {
    const withSub = {
      ...validWaterfall,
      eap: {
        deliverables: [
          { name: "Plataforma", subDeliverables: [{ name: "Autenticação" }] },
        ],
      },
    };
    expect(waterfallOutputSchema.safeParse(withSub).success).toBe(true);
  });

  it("aceita um entregável sem subentregáveis", () => {
    expect(waterfallOutputSchema.safeParse(validWaterfall).success).toBe(true);
  });

  it("rejeita EAP vazia (RF-045 exige pelo menos um entregável)", () => {
    const invalid = { ...validWaterfall, eap: { deliverables: [] } };
    expect(waterfallOutputSchema.safeParse(invalid).success).toBe(false);
  });
});

describe("consolidatedResultSchema (RN-006 — nunca misturar frameworks)", () => {
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

  it("aceita um resultado scrum com dados de scrum", () => {
    const result = consolidatedResultSchema.safeParse({
      framework: "scrum",
      generatedAt: new Date().toISOString(),
      data: scrumData,
      notes: [],
    });
    expect(result.success).toBe(true);
  });

  it("rejeita framework 'kanban' com dados no formato de scrum (artefato do outro framework)", () => {
    const result = consolidatedResultSchema.safeParse({
      framework: "kanban",
      generatedAt: new Date().toISOString(),
      data: scrumData,
      notes: [],
    });
    expect(result.success).toBe(false);
  });

  it("rejeita um framework desconhecido", () => {
    const result = consolidatedResultSchema.safeParse({
      framework: "scrumban",
      generatedAt: new Date().toISOString(),
      data: scrumData,
      notes: [],
    });
    expect(result.success).toBe(false);
  });
});
