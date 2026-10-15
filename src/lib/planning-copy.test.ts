import { afterEach, describe, expect, it, vi } from "vitest";

import { getPlanningCopy } from "@/lib/planning-copy";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("textos de apresentação das opções de planejamento", () => {
  it("com o Híbrido desligado, são exatamente os textos da v1.0", () => {
    expect(getPlanningCopy(false)).toEqual({
      siteDescription:
        "Transforme especificações técnicas em artefatos estruturados de gestão de projetos (Scrum, Kanban ou Cascata) com apoio de Inteligência Artificial.",
      heroDescription:
        "Envie uma especificação em PDF ou texto, escolha o framework — Scrum, Kanban ou Cascata — e receba o pacote inicial de planejamento, pronto para revisar e evoluir com sua equipe.",
      chooseStepDescription:
        "Selecione manualmente o framework de trabalho: Scrum, Kanban ou Cascata. A IA não decide por você.",
      authTagline:
        "Scrum, Kanban ou Cascata — a escolha do framework é sempre sua.",
    });
    for (const text of Object.values(getPlanningCopy(false))) {
      expect(text).not.toContain("Híbrido");
    }
  });

  it("com o Híbrido ligado, todos os textos incluem o Híbrido ao lado dos três frameworks", () => {
    const copy = getPlanningCopy(true);
    expect(copy.heroDescription).toBe(
      "Envie uma especificação em PDF ou texto, escolha a abordagem de planejamento — Scrum, Kanban, Cascata ou Híbrido — e receba um conjunto inicial de artefatos estruturados, pronto para revisar e evoluir com sua equipe.",
    );
    for (const text of Object.values(copy)) {
      expect(text).toContain("Scrum, Kanban, Cascata ou Híbrido");
    }
  });

  it("o Híbrido corresponde às duas modalidades disponíveis", () => {
    expect(getPlanningCopy(true).chooseStepDescription).toContain(
      "Híbrido (Cascata + Scrum ou Cascata + Kanban)",
    );
  });

  it("sem argumento, segue a feature flag HYBRID_PLANNING_ENABLED", () => {
    vi.stubEnv("HYBRID_PLANNING_ENABLED", undefined);
    expect(getPlanningCopy()).toEqual(getPlanningCopy(false));
    vi.stubEnv("HYBRID_PLANNING_ENABLED", "false");
    expect(getPlanningCopy()).toEqual(getPlanningCopy(false));
    vi.stubEnv("HYBRID_PLANNING_ENABLED", "true");
    expect(getPlanningCopy()).toEqual(getPlanningCopy(true));
  });
});
