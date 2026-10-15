import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  findHybridIntegrityIssues,
  hybridKanbanOutputSchema,
  hybridScrumOutputSchema,
  type HybridKanbanOutput,
  type HybridScrumOutput,
} from "@/lib/ai/schemas/hybrid";
import { scrumOutputSchema } from "@/lib/ai/schemas/scrum";
import { waterfallOutputSchema } from "@/lib/ai/schemas/waterfall";
import {
  hybridKanban,
  hybridScrum,
} from "@/lib/hybrid/__fixtures__/hybrid-packages";

const scrum = () => structuredClone(hybridScrum) as HybridScrumOutput;
const kanban = () => structuredClone(hybridKanban) as HybridKanbanOutput;

function scrumIssues(data: HybridScrumOutput) {
  return findHybridIntegrityIssues({ variant: "scrum", data });
}
function kanbanIssues(data: HybridKanbanOutput) {
  return findHybridIntegrityIssues({ variant: "kanban", data });
}

describe("schemas do Híbrido — pacotes válidos", () => {
  it("aceita o pacote Cascata + Scrum íntegro", () => {
    expect(hybridScrumOutputSchema.safeParse(hybridScrum).success).toBe(true);
    expect(scrumIssues(scrum())).toEqual([]);
  });

  it("aceita o pacote Cascata + Kanban íntegro", () => {
    expect(hybridKanbanOutputSchema.safeParse(hybridKanban).success).toBe(true);
    expect(kanbanIssues(kanban())).toEqual([]);
  });

  it("não aceita o pacote de uma variante no schema da outra", () => {
    expect(hybridScrumOutputSchema.safeParse(hybridKanban).success).toBe(false);
    expect(hybridKanbanOutputSchema.safeParse(hybridScrum).success).toBe(false);
  });
});

describe("schemas do Híbrido — compatibilidade com o Gemini", () => {
  it.each([
    ["Cascata + Scrum", hybridScrumOutputSchema],
    ["Cascata + Kanban", hybridKanbanOutputSchema],
  ] as const)(
    "%s: gera JSON Schema sem $ref/oneOf/anyOf/allOf (o superRefine fica fora)",
    (_, schema) => {
      const json = JSON.stringify(z.toJSONSchema(schema));
      for (const keyword of ['"$ref"', '"oneOf"', '"anyOf"', '"allOf"']) {
        expect(json).not.toContain(keyword);
      }
    },
  );

  it("reaproveita o TAP da Cascata e a história do Scrum sem alterá-los", () => {
    const json = (schema: z.ZodType): unknown => z.toJSONSchema(schema);
    const hybrid = json(hybridScrumOutputSchema) as {
      properties: {
        tap: unknown;
        backlog: { items: { properties: Record<string, unknown> } };
      };
    };
    const waterfall = json(waterfallOutputSchema) as {
      properties: { tap: unknown };
    };
    const scrumJson = json(scrumOutputSchema) as {
      properties: {
        backlog: { items: { properties: Record<string, unknown> } };
      };
    };

    expect(hybrid.properties.tap).toEqual(waterfall.properties.tap);
    expect(hybrid.properties.backlog.items.properties).toMatchObject(
      scrumJson.properties.backlog.items.properties,
    );
  });

  it("exige os identificadores de rastreabilidade como campos obrigatórios", () => {
    const withoutEapCode = scrum() as unknown as {
      backlog: Array<Record<string, unknown>>;
    };
    delete withoutEapCode.backlog[0].eapCode;
    expect(hybridScrumOutputSchema.safeParse(withoutEapCode).success).toBe(
      false,
    );

    const withoutMilestoneId = kanban() as unknown as {
      schedule: {
        phases: Array<{ milestones: Array<Record<string, unknown>> }>;
      };
    };
    delete withoutMilestoneId.schedule.phases[0].milestones[0].id;
    expect(hybridKanbanOutputSchema.safeParse(withoutMilestoneId).success).toBe(
      false,
    );
  });
});

describe("integridade — referências inválidas", () => {
  it("rejeita item vinculado a código EAP inexistente", () => {
    const data = scrum();
    data.backlog[1].eapCode = "9.9";
    expect(scrumIssues(data)).toEqual([
      'Item "US-02" vinculado a código EAP inexistente "9.9".',
    ]);
  });

  it("rejeita fase e marco que referenciam código EAP inexistente", () => {
    const data = kanban();
    data.schedule.phases[0].eapCodes.push("7");
    data.schedule.phases[1].milestones[0].eapCodes = ["3.1"];
    expect(kanbanIssues(data)).toEqual([
      'Fase "F1" referencia código EAP inexistente "7".',
      'Marco "M2" referencia código EAP inexistente "3.1".',
    ]);
  });

  it("rejeita primeira Sprint e Sprint macro citando história inexistente", () => {
    const data = scrum();
    data.firstSprint.selectedStoryIds = ["US-09"];
    data.macroSchedule.sprints[1].storyIds.push("US-10");
    expect(scrumIssues(data)).toEqual([
      'Primeira Sprint cita história inexistente "US-09".',
      '"Sprint 2" cita história inexistente "US-10".',
    ]);
  });

  it("rejeita item Kanban em coluna inexistente", () => {
    const data = kanban();
    data.items[0].column = "Fazendo";
    expect(kanbanIssues(data)).toEqual([
      'Item "KB-01" está na coluna inexistente "Fazendo".',
    ]);
  });

  it("propaga as violações pelo safeParse como issues custom (dispara a nova tentativa)", () => {
    const data = scrum();
    data.backlog[0].eapCode = "5";
    const result = hybridScrumOutputSchema.safeParse(data);
    expect(result.success).toBe(false);
    expect(result.error?.issues).toEqual([
      expect.objectContaining({
        code: "custom",
        message: 'Item "US-01" vinculado a código EAP inexistente "5".',
      }),
    ]);
  });
});

describe("integridade — duplicidades", () => {
  it("rejeita código EAP duplicado (entre entregáveis e entre subentregáveis)", () => {
    const data = scrum();
    data.eap.deliverables[1].code = "1";
    expect(scrumIssues(data)).toContain('Código EAP duplicado: "1".');
  });

  it("rejeita ids duplicados de fase, marco, item e nome de coluna", () => {
    const data = kanban();
    data.schedule.phases[1].id = "F1";
    data.schedule.phases[1].milestones[0].id = "M1";
    data.items[2].id = "KB-01";
    data.columns[1].name = "Backlog";
    data.items.forEach((item) => (item.column = "Backlog"));
    expect(kanbanIssues(data)).toEqual([
      'Id de fase duplicado: "F1".',
      'Id de marco duplicado: "M1".',
      'Id de item duplicado: "KB-01".',
      'Nome de coluna duplicado: "Backlog".',
    ]);
  });

  it("reporta cada duplicidade uma única vez", () => {
    const data = scrum();
    data.backlog.forEach((item) => (item.id = "US-01"));
    data.firstSprint.selectedStoryIds = ["US-01"];
    data.macroSchedule.sprints.forEach(
      (sprint) => (sprint.storyIds = ["US-01"]),
    );
    expect(scrumIssues(data)).toEqual(['Id de item duplicado: "US-01".']);
  });
});

describe("integridade — formato e hierarquia dos códigos EAP", () => {
  it.each([
    ["A", 'Entregável "Módulo de agendamento" tem código inválido "A"'],
    ["0", 'Entregável "Módulo de agendamento" tem código inválido "0"'],
    ["1.1", 'Entregável "Módulo de agendamento" tem código inválido "1.1"'],
  ])("rejeita código de entregável %s", (code, expected) => {
    const data = scrum();
    data.eap.deliverables[0].code = code;
    expect(scrumIssues(data).join("\n")).toContain(expected);
  });

  it.each([
    ["1.2.3", 'tem código inválido "1.2.3"'],
    ["3", 'tem código inválido "3"'],
    ["2.1", 'Subentregável "2.1" não pertence ao entregável pai "1".'],
  ])("rejeita código de subentregável %s", (code, expected) => {
    const data = scrum();
    data.eap.deliverables[0].subDeliverables![1].code = code;
    expect(scrumIssues(data).join("\n")).toContain(expected);
  });
});

describe("integridade — lacunas de cobertura NÃO são erro", () => {
  it("aceita entregável sem item, fase sem entregável, marco sem entregável e história fora das Sprints", () => {
    const data = scrum();
    data.backlog = data.backlog.filter((item) => item.eapCode !== "2");
    data.macroSchedule.sprints[1].storyIds = [];
    data.schedule.phases[1].eapCodes = [];
    data.schedule.phases[1].milestones[0].eapCodes = [];

    expect(scrumIssues(data)).toEqual([]);
    expect(hybridScrumOutputSchema.safeParse(data).success).toBe(true);
  });

  it("aceita item vinculado ao entregável agregador (vínculo menos preciso, mas válido)", () => {
    const data = kanban();
    data.items[0].eapCode = "1";
    expect(kanbanIssues(data)).toEqual([]);
  });
});
