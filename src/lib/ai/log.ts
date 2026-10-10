/**
 * Log sanitizado da camada de IA (RF-066 / RNF-038): timestamp, evento e
 * metadados técnicos não sensíveis apenas. Nunca registrar a especificação,
 * o prompt completo ou a resposta integral do modelo.
 */
export function logAiEvent(
  event: string,
  meta: Record<string, string | number | boolean> = {},
): void {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      scope: "ai",
      event,
      ...meta,
    }),
  );
}
