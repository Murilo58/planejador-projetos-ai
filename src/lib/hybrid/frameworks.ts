import { z } from "zod";

import type { HybridVariant } from "@/lib/ai/schemas/hybrid";
import { specificationInputSchema } from "@/lib/specification/schema";

/**
 * Catálogo do Planejamento Híbrido (v1.1): Cascata + Scrum e Cascata +
 * Kanban. Mantido separado de `src/lib/frameworks.ts` enquanto a
 * interface não é integrada (Fase 5) — assim o catálogo, a seleção e a
 * validação dos três frameworks atuais permanecem exatamente como estão.
 *
 * A escolha continua manual e obrigatória (RN-001/RN-002): a IA nunca
 * decide entre Híbrido e os demais, nem entre as duas combinações.
 */

export const HYBRID_FRAMEWORK_IDS = [
  "hibrido-scrum",
  "hibrido-kanban",
] as const;

export type HybridFrameworkId = (typeof HYBRID_FRAMEWORK_IDS)[number];

export const hybridFrameworkIdSchema = z.enum(HYBRID_FRAMEWORK_IDS);

export const HYBRID_VARIANT: Record<HybridFrameworkId, HybridVariant> = {
  "hibrido-scrum": "scrum",
  "hibrido-kanban": "kanban",
};

export const HYBRID_LABEL: Record<HybridFrameworkId, string> = {
  "hibrido-scrum": "Híbrido — Cascata + Scrum",
  "hibrido-kanban": "Híbrido — Cascata + Kanban",
};

/** Mesma entrada validada dos demais frameworks, com o id do Híbrido. */
export const hybridSpecificationInputSchema = specificationInputSchema.extend({
  framework: hybridFrameworkIdSchema,
});

/**
 * Feature flag (kill-switch) do Planejamento Híbrido, avaliada sempre no
 * servidor. Desligada por padrão: só vale `HYBRID_PLANNING_ENABLED=true`.
 * Desligar a flag em produção desativa o Híbrido sem rollback de deploy.
 */
export function isHybridPlanningEnabled(): boolean {
  return process.env.HYBRID_PLANNING_ENABLED?.trim() === "true";
}
