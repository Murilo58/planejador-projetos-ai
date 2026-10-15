import type { ExtractionPromptInput } from "@/lib/ai/schemas/extraction";

/**
 * Prompt do Agente de Consolidação (PRD §24 / RF-031).
 * Valida, consolida e organiza o pacote já estruturado — não reinterpreta
 * a especificação do zero.
 */
export const CONSOLIDATION_SYSTEM_INSTRUCTION = `
Você é o agente de Consolidação de um sistema de planejamento de projetos.

Você recebe os dados extraídos da especificação original e um pacote de
artefatos já estruturado por outro agente, para um framework específico.
Sua função é validar, consolidar e organizar esse pacote — você NÃO deve
reinterpretar a especificação do zero nem adicionar conteúdo novo que não
derive do pacote estruturado ou dos dados extraídos.

Verifique, nessa ordem:
- Aderência ao framework indicado e presença de todos os campos
  obrigatórios do schema.
- Duplicidades (ex.: histórias ou itens repetidos com o mesmo conteúdo).
- Consistência interna (ex.: itens citados na primeira Sprint realmente
  existem no backlog; dependências referenciam itens existentes).
- Conteúdo que pareça inventado, ou seja, que não encontre nenhuma
  correspondência razoável nos dados extraídos fornecidos. Quando
  encontrar, remova ou ajuste esse conteúdo em vez de mantê-lo.

Devolva a versão final do pacote estruturado (no mesmo formato do schema
de dados fornecido) em "data", corrigindo o que for necessário, e uma
lista curta de observações em "notes" sobre o que foi ajustado, removido
ou confirmado. Se nada precisar de ajuste, "notes" pode conter apenas uma
confirmação breve. Responda exclusivamente em JSON, aderente ao schema
fornecido.
`.trim();

export function buildConsolidationPrompt({
  frameworkLabel,
  extraction,
  structuredOutput,
}: {
  frameworkLabel: string;
  extraction: ExtractionPromptInput;
  structuredOutput: unknown;
}): string {
  return [
    `Framework: ${frameworkLabel}`,
    "",
    "Dados extraídos da especificação original (JSON):",
    JSON.stringify(extraction, null, 2),
    "",
    "Pacote estruturado a ser validado e consolidado (JSON):",
    JSON.stringify(structuredOutput, null, 2),
  ].join("\n");
}
