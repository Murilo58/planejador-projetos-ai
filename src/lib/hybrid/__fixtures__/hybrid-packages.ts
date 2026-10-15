import type {
  HybridGovernance,
  HybridKanbanOutput,
  HybridScrumOutput,
} from "@/lib/ai/schemas/hybrid";

/**
 * Pacotes híbridos de referência, íntegros e com cobertura completa (toda
 * folha da EAP com item, toda fase e marco vinculados). Reutilizados
 * pelos testes de domínio e, nas próximas fases, pelos de pipeline,
 * interface e exportações. Cada teste deriva variações com `structuredClone`.
 */

export const hybridGovernance: HybridGovernance = {
  tap: {
    objective: "Permitir o agendamento online de consultas.",
    scopeSummary: "Agendamento online, agendas por unidade e relatórios.",
    stakeholders: ["Diretoria da clínica", "Recepcionistas"],
    successCriteria: [],
    assumptions: ["Serviço de e-mail já contratado"],
    constraints: ["Atender à LGPD"],
  },
  eap: {
    deliverables: [
      {
        code: "1",
        name: "Módulo de agendamento",
        subDeliverables: [
          { code: "1.1", name: "Agenda por profissional" },
          { code: "1.2", name: "Agendamento online" },
        ],
      },
      { code: "2", name: "Relatório de faltas" },
    ],
  },
  schedule: {
    phases: [
      {
        id: "F1",
        name: "Construção",
        eapCodes: ["1"],
        milestones: [
          {
            id: "M1",
            name: "Homologação na unidade Centro",
            eapCodes: ["1.2"],
          },
        ],
        dependencies: [],
      },
      {
        id: "F2",
        name: "Implantação",
        eapCodes: ["2"],
        milestones: [
          {
            id: "M2",
            name: "Produção nas três unidades",
            eapCodes: ["1", "2"],
          },
        ],
        dependencies: ["Construção concluída"],
      },
    ],
  },
};

const story = (
  id: string,
  eapCode: string,
  title: string,
): HybridScrumOutput["backlog"][number] => ({
  id,
  eapCode,
  title,
  statement: `Como recepcionista, quero ${title.toLowerCase()}, para atender melhor.`,
  acceptanceCriteria: ["Critério verificável derivado da especificação"],
  businessValue: "alta",
  complexity: "media",
  priorityJustification: "Base para as demais funcionalidades.",
});

export const hybridScrum: HybridScrumOutput = {
  ...hybridGovernance,
  backlog: [
    story("US-01", "1.1", "Configurar agenda"),
    story("US-02", "1.2", "Agendar consulta online"),
    story("US-03", "2", "Gerar relatório de faltas"),
  ],
  firstSprint: {
    selectedStoryIds: ["US-01"],
    rationale: "A agenda é pré-requisito do agendamento.",
  },
  macroSchedule: {
    sprints: [
      {
        name: "Sprint 1",
        focus: "Agenda",
        storyIds: ["US-01"],
        dependencies: [],
      },
      {
        name: "Sprint 2",
        focus: "Agendamento e relatório",
        storyIds: ["US-02", "US-03"],
        dependencies: ["US-01"],
      },
    ],
  },
};

const kanbanItem = (
  id: string,
  eapCode: string,
  title: string,
  column: string,
): HybridKanbanOutput["items"][number] => ({
  id,
  eapCode,
  title,
  description: `${title}, conforme a especificação.`,
  type: "funcionalidade",
  priority: "alta",
  column,
});

export const hybridKanban: HybridKanbanOutput = {
  ...hybridGovernance,
  columns: [
    {
      name: "Backlog",
      wipLimit: "Sem limite — coluna de entrada",
      wipJustification: "Coluna de entrada.",
    },
    {
      name: "Em Andamento",
      wipLimit: "2",
      wipJustification: "Evita multitarefa, sem assumir tamanho de equipe.",
    },
  ],
  items: [
    kanbanItem("KB-01", "1.1", "Configurar agenda", "Em Andamento"),
    kanbanItem("KB-02", "1.2", "Agendamento online", "Backlog"),
    kanbanItem("KB-03", "2", "Relatório de faltas", "Backlog"),
  ],
};
