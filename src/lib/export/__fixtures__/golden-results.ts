import type { ClassicResult } from "@/lib/ai/schemas/result";

/**
 * Resultados de referência para os testes "golden" das exportações
 * (v1.1, Fase 1 — rede de proteção antes da refatoração para o
 * Planejamento Híbrido). Cobrem deliberadamente os casos de borda que a
 * exportação trata de forma especial: listas vazias ("Não identificado
 * na especificação."), campos opcionais presentes e ausentes, coluna
 * Kanban sem itens, entregável da EAP com e sem subentregáveis,
 * observações da validação vazias e preenchidas.
 *
 * Não alterar estes dados sem atualizar conscientemente os snapshots —
 * eles são a referência do comportamento atual das exportações.
 */

const GENERATED_AT = "2026-10-09T12:00:00.000Z";

export const goldenScrum: ClassicResult = {
  framework: "scrum",
  generatedAt: GENERATED_AT,
  data: {
    backlog: [
      {
        title: "Login",
        statement: "Como usuário, quero entrar, para acessar o sistema.",
        acceptanceCriteria: [
          "Credenciais inválidas mostram erro",
          "Login válido redireciona ao painel",
        ],
        businessValue: "alta",
        complexity: "baixa",
        priorityJustification: "Pré-requisito para o restante do fluxo.",
      },
      {
        title: "Relatório mensal",
        statement:
          "Como gestor, quero um relatório mensal, para acompanhar o uso.",
        acceptanceCriteria: ["Relatório lista os acessos do mês"],
        businessValue: "media",
        complexity: "alta",
        priorityJustification: "Depende dos dados de acesso já registrados.",
      },
    ],
    firstSprint: {
      selectedStoryTitles: ["Login"],
      rationale: "Base do fluxo, sem assumir velocidade do time.",
    },
    macroSchedule: {
      sprints: [
        { name: "Sprint 1", focus: "Autenticação", dependencies: [] },
        {
          name: "Sprint 2",
          focus: "Relatórios",
          dependencies: ["Login concluído", "Registro de acessos"],
        },
      ],
    },
  },
  notes: ["Nenhum ajuste necessário.", "Backlog confirmado."],
};

export const goldenKanban: ClassicResult = {
  framework: "kanban",
  generatedAt: GENERATED_AT,
  data: {
    columns: [
      {
        name: "Backlog",
        wipLimit: "Sem limite — coluna de entrada",
        wipJustification: "Coluna de entrada do fluxo.",
      },
      {
        name: "Em Andamento",
        wipLimit: "2",
        wipJustification: "Evita multitarefa, sem assumir tamanho de equipe.",
      },
      {
        name: "Concluído",
        wipLimit: "Sem limite — coluna de saída",
        wipJustification: "Coluna de saída do fluxo.",
      },
    ],
    items: [
      {
        title: "Cadastro",
        description: "Formulário de cadastro de usuário.",
        type: "funcionalidade",
        priority: "alta",
        column: "Backlog",
        dependency: "Banco de dados configurado",
      },
      {
        title: "Ajuste de layout",
        description: "Pequeno ajuste visual.",
        type: "tarefa técnica",
        priority: "baixa",
        column: "Em Andamento",
        note: "Depende do design final.",
      },
      {
        title: "Exportação CSV",
        description: "Exportar a lista de usuários.",
        type: "melhoria",
        priority: "media",
        column: "Backlog",
      },
    ],
  },
  notes: [],
};

export const goldenCascata: ClassicResult = {
  framework: "cascata",
  generatedAt: GENERATED_AT,
  data: {
    tap: {
      objective: "Lançar o novo portal.",
      scopeSummary: "Portal público com autenticação.",
      stakeholders: ["Patrocinador", "Equipe de atendimento"],
      successCriteria: ["Disponibilidade de 99%"],
      assumptions: [],
      constraints: ["Orçamento aprovado para o exercício"],
    },
    eap: {
      deliverables: [
        {
          name: "Infraestrutura",
          subDeliverables: [{ name: "Banco de dados" }, { name: "Servidor" }],
        },
        { name: "Portal" },
      ],
    },
    schedule: {
      phases: [
        { name: "Fase 1", milestones: ["Kick-off"], dependencies: [] },
        {
          name: "Fase 2",
          milestones: [],
          dependencies: ["Infraestrutura entregue"],
        },
      ],
    },
    kickoff: {
      title: "Kick-off do Portal",
      objective: "Alinhar o time.",
      scope: "Visão geral do projeto.",
      keyMilestones: ["Início em Fase 1"],
      rolesAndResponsibilities: [
        { role: "Gerente de Projeto", responsibility: "Coordenação geral." },
      ],
    },
  },
  notes: ["TAP ajustado: premissa sem fonte removida."],
};

/** Cascata com o Kick-off sem papéis — ramo "Não identificado" do Kick-off. */
export const goldenCascataWithoutRoles: ClassicResult = {
  ...goldenCascata,
  data: {
    ...(goldenCascata.data as Extract<
      ClassicResult,
      { framework: "cascata" }
    >["data"]),
    kickoff: {
      title: "Kick-off do Portal",
      objective: "Alinhar o time.",
      scope: "Visão geral do projeto.",
      keyMilestones: [],
      rolesAndResponsibilities: [],
    },
  },
} as ClassicResult;

export const GOLDEN_RESULTS = {
  scrum: goldenScrum,
  kanban: goldenKanban,
  cascata: goldenCascata,
  "cascata-sem-papeis": goldenCascataWithoutRoles,
} as const;
