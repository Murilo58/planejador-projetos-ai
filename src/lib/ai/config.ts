/**
 * Configuração centralizada da IA (spec §79): modelo, temperatura e
 * limites num módulo único — o nome do modelo não deve se espalhar pelo
 * projeto. Tudo configurável por variável de ambiente, sem valores reais
 * aqui dentro.
 */
export const AI_CONFIG = {
  /**
   * `gemini-flash-latest` é o alias estável mantido pela Google, apontando
   * sempre para o Gemini Flash recomendado atual — evita fixar uma versão
   * datada que pode ser descontinuada. Pode ser sobrescrito via env var
   * para fixar uma versão específica, se necessário.
   */
  model: process.env.GEMINI_MODEL?.trim() || "gemini-flash-latest",
  temperature: 0.3,
  maxOutputTokens: 8192,
  /** Tempo máximo por chamada à IA antes de desistir (RF-081/FE-07). */
  timeoutMs: 60_000,
  /** Tentativas por etapa em caso de resposta fora do contrato (RF-034/RNF-029). */
  maxAttemptsPerStage: 2,
  /**
   * Espera antes da nova tentativa quando a falha é uma indisponibilidade
   * transitória do serviço (503, 429, 5xx, rede) — valor aleatório no
   * intervalo (jitter), para não sincronizar novas tentativas de várias
   * requisições. Pior caso por etapa: 60s + 5s + 60s = 125s, dentro do
   * `maxDuration` de 150s de `src/app/app/new/page.tsx`.
   */
  transientRetryDelay: { minMs: 2_000, maxMs: 5_000 },
} as const;
