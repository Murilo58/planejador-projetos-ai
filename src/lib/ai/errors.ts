/**
 * Erros classificados da camada de IA, usados para mapear para as
 * mensagens amigáveis dos estados de erro do PRD (FE-06 a FE-09).
 */
export type AiErrorCode = "unavailable" | "timeout" | "invalid_response";

export class AiGenerationError extends Error {
  readonly code: AiErrorCode;

  constructor(
    code: AiErrorCode,
    message: string,
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.code = code;
    this.name = "AiGenerationError";
  }
}
