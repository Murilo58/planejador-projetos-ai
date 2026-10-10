/**
 * Limites de entrada da especificação (RF-021, RF-022, RN-012).
 *
 * A especificação original não define valores numéricos — o PRD registra
 * isso como questão aberta (docs/PRD.md, OQ-003). Os valores abaixo são uma
 * premissa de engenharia deliberada para o MVP, não uma decisão de produto
 * fechada: dão margem para uma especificação técnica real (dezenas de
 * páginas) sem permitir envios claramente incompatíveis com custo/limite de
 * contexto da IA. Devem ser revisados na Etapa 4, quando o modelo de IA e
 * seus limites reais de contexto forem definidos.
 */

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
export const ACCEPTED_FILE_TYPE = "application/pdf";
export const ACCEPTED_FILE_EXTENSION = ".pdf";

export const MIN_TEXT_LENGTH = 200; // evita entradas trivialmente vazias
export const MAX_TEXT_LENGTH = 100_000; // ~ documento técnico extenso

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
