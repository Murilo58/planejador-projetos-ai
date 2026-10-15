import { isHybridPlanningEnabled } from "@/lib/hybrid/frameworks";

/**
 * Textos de apresentação que listam as opções de planejamento (landing
 * page, telas de login/cadastro e descrição do site). Com a feature flag
 * do Planejamento Híbrido desligada, são exatamente os textos da v1.0;
 * ligada, incluem o Híbrido — que corresponde às duas modalidades,
 * Cascata + Scrum e Cascata + Kanban.
 *
 * As páginas estáticas (landing page) leem a flag no build; as dinâmicas,
 * a cada acesso — em ambos os casos, valor do ambiente do deploy.
 */
export interface PlanningCopy {
  /** `<meta name="description">` do site. */
  siteDescription: string;
  /** Parágrafo de apresentação do hero da landing page. */
  heroDescription: string;
  /** Passo "Escolha" de "Como funciona". */
  chooseStepDescription: string;
  /** Rodapé do painel de marca em /login e /register. */
  authTagline: string;
}

const CLASSIC_COPY: PlanningCopy = {
  siteDescription:
    "Transforme especificações técnicas em artefatos estruturados de gestão de projetos (Scrum, Kanban ou Cascata) com apoio de Inteligência Artificial.",
  heroDescription:
    "Envie uma especificação em PDF ou texto, escolha o framework — Scrum, Kanban ou Cascata — e receba o pacote inicial de planejamento, pronto para revisar e evoluir com sua equipe.",
  chooseStepDescription:
    "Selecione manualmente o framework de trabalho: Scrum, Kanban ou Cascata. A IA não decide por você.",
  authTagline:
    "Scrum, Kanban ou Cascata — a escolha do framework é sempre sua.",
};

const WITH_HYBRID_COPY: PlanningCopy = {
  siteDescription:
    "Transforme especificações técnicas em artefatos estruturados de gestão de projetos (Scrum, Kanban, Cascata ou Híbrido) com apoio de Inteligência Artificial.",
  heroDescription:
    "Envie uma especificação em PDF ou texto, escolha a abordagem de planejamento — Scrum, Kanban, Cascata ou Híbrido — e receba um conjunto inicial de artefatos estruturados, pronto para revisar e evoluir com sua equipe.",
  chooseStepDescription:
    "Selecione manualmente a abordagem de planejamento: Scrum, Kanban, Cascata ou Híbrido (Cascata + Scrum ou Cascata + Kanban). A IA não decide por você.",
  authTagline:
    "Scrum, Kanban, Cascata ou Híbrido — a escolha da abordagem é sempre sua.",
};

export function getPlanningCopy(
  hybridEnabled: boolean = isHybridPlanningEnabled(),
): PlanningCopy {
  return hybridEnabled ? WITH_HYBRID_COPY : CLASSIC_COPY;
}
