import { FRAMEWORKS, type FrameworkId } from "@/lib/frameworks";
import {
  HYBRID_FRAMEWORKS,
  type HybridFrameworkId,
} from "@/lib/hybrid/frameworks";

/**
 * Tudo o que o usuário pode escolher no fluxo de criação: os três
 * frameworks da v1.0 e, com a feature flag ligada, as duas variantes do
 * Planejamento Híbrido (v1.1). Os catálogos continuam separados
 * (`src/lib/frameworks.ts` e `src/lib/hybrid/frameworks.ts`) — a landing
 * page e as exportações atuais seguem lendo apenas os três originais.
 */
export type PlanningFrameworkId = FrameworkId | HybridFrameworkId;

export function getPlanningFrameworkInfo(id: PlanningFrameworkId) {
  return [...FRAMEWORKS, ...HYBRID_FRAMEWORKS].find((item) => item.id === id);
}
