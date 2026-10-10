/**
 * Configuração centralizada dos controles de uso e abuso (A1/A2 da
 * auditoria de produção) — mesmo padrão de `AI_CONFIG`
 * (`src/lib/ai/config.ts`): valores num único lugar, ajustáveis sem
 * caçar números espalhados pelo projeto.
 */

export const GENERATION_QUOTA = {
  /** Gerações completas (Extração + Estruturação + Consolidação) por usuário por dia (UTC). */
  dailyLimit: 10,
  /**
   * Janela de validade de um `generationId` para as Etapas 2 e 3
   * continuarem uma geração já iniciada na Etapa 1. Generoso em relação
   * ao tempo real de uma geração (segundos a poucos minutos) para
   * tolerar lentidão de rede, sem permitir reaproveitamento indefinido
   * do mesmo id para contornar a cota.
   */
  generationTtlMs: 30 * 60 * 1000,
} as const;

export const AUTH_RATE_LIMIT = {
  login: {
    byIp: { windowMs: 15 * 60 * 1000, max: 10 },
    byEmail: { windowMs: 15 * 60 * 1000, max: 5 },
  },
  register: {
    byIp: { windowMs: 60 * 60 * 1000, max: 5 },
  },
} as const;
