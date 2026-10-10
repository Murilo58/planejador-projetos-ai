/**
 * Catálogo dos três frameworks suportados pelo MVP.
 *
 * Fonte única de verdade para nome e texto de ajuda de cada framework —
 * os textos de `description` são os textos oficiais definidos no PRD §11.4.
 * Reutilizado pela landing page e, nas próximas etapas, pela etapa de
 * seleção de framework em /app/new (RF-024 a RF-026).
 *
 * Não adicionar frameworks além dos três definidos no MVP (RN-002).
 */

export type FrameworkId = "scrum" | "kanban" | "cascata";

export interface FrameworkInfo {
  id: FrameworkId;
  name: string;
  tagline: string;
  /** Texto de ajuda oficial (PRD §11.4). Não reescrever livremente. */
  description: string;
}

export const FRAMEWORKS: FrameworkInfo[] = [
  {
    id: "scrum",
    name: "Scrum",
    tagline: "Ciclos iterativos com entregas em Sprints",
    description:
      "Gera histórias de usuário, critérios de aceite, backlog priorizado, sugestão da primeira Sprint e cronograma macro.",
  },
  {
    id: "kanban",
    name: "Kanban",
    tagline: "Fluxo contínuo de trabalho",
    description:
      "Estrutura o quadro inicial, classifica itens e sugere limites de trabalho em andamento.",
  },
  {
    id: "cascata",
    name: "Cascata",
    tagline: "Fases e marcos bem definidos",
    description:
      "Gera TAP, EAP, cronograma macro e material de apoio para o Kick-off.",
  },
];
