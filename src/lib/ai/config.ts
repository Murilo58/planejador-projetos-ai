import { ThinkingLevel } from "@google/genai";

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
  /**
   * Teto de saída das etapas do Planejamento Híbrido (estruturação e
   * consolidação), que produzem governança + execução numa só resposta.
   * Na PoC da v1.1 a maior resposta chegou a 6.685 tokens e um pico de
   * raciocínio levou uma chamada a 8.209 — acima dos 8.192 dos demais
   * frameworks (docs/v1.1/poc-fase0.md). Scrum, Kanban e Cascata
   * continuam com `maxOutputTokens`.
   */
  hybridMaxOutputTokens: 16_384,
  /**
   * Nível de raciocínio da Extração, comum a todos os frameworks. A etapa
   * transcreve e classifica o que está no texto — pouco ganha com
   * raciocínio longo, que conta dentro de `maxOutputTokens`. Com uma
   * especificação perto do limite de entrada (~100 mil caracteres), o
   * raciocínio padrão consumiu 3.740 dos 8.192 tokens e a resposta saiu
   * cortada, em 57 s (teste de robustez da v1.1). As demais etapas seguem
   * com o raciocínio padrão do modelo.
   */
  extractionThinkingLevel: ThinkingLevel.LOW,
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
