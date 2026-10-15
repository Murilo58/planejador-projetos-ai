# v1.1 — Validação real dos prompts finais do Híbrido (Fase 3)

**Data:** 15/10/2026 · **Commit validado:** `39e858c` (`release/v1.1`) ·
**Modelo:** `gemini-flash-latest` (alias padrão de `AI_CONFIG.model`)

## Objetivo

Os prompts de produção do Planejamento Híbrido (`src/lib/ai/prompts/hybrid.ts`)
diferem levemente dos usados na PoC da Fase 0 (branch `poc/v1.1-hybrid`,
relatório `docs/v1.1/poc-fase0.md` naquela branch): ids de marco (`M1`),
redação integrada e proibição explícita de Kick-off. Esta rodada verifica,
contra o Gemini real, que os prompts finais produzem pacotes válidos e
rastreáveis antes do início do trabalho de interface.

## Método

- Agentes de produção chamados diretamente, na ordem do pipeline:
  `runExtractionAgent` → `runHybridStructuringAgent` (chamada única,
  `hybridMaxOutputTokens` = 16.384) → `runConsolidationAgent` com
  `HYBRID_CONSOLIDATION_ADDENDUM` e o mesmo teto.
- **Fora do escopo:** Server Actions (sessão, banco, cota e feature flag) — já
  cobertas pelos testes mockados de `pipeline.actions.test.ts`.
- Especificações pequena (agendamento de clínica, ~1,3 KB) e média (portal de
  compras, ~3,9 KB) da PoC × variantes `hibrido-scrum` e `hibrido-kanban`.
  A extração foi compartilhada por especificação: **10 chamadas** no total.
- Métricas de tokens lidas de `usageMetadata` envolvendo o cliente da IA;
  rastreabilidade medida com `buildTraceabilityMatrix` antes e depois da
  consolidação. Script descartável, fora do repositório.

## Resultados

| Pipeline                    | Total | Maior chamada (saída + raciocínio) | Folhas c/ item | Itens na folha | Marcos c/ EAP | Pontos de atenção |
| --------------------------- | ----- | ---------------------------------- | -------------- | -------------- | ------------- | ----------------- |
| pequena · Cascata + Scrum   | 61 s  | 4.650 (estruturação)               | 7/7            | 7/7            | 2/2           | 0                 |
| pequena · Cascata + Kanban  | 78 s  | **7.386** (estruturação)           | 7/7            | 7/7            | 2/2           | 0                 |
| média · Cascata + Scrum     | 92 s  | 7.261 (consolidação)               | 14/14          | 14/14          | 4/4           | 0                 |
| média · Cascata + Kanban    | 64 s  | 5.279 (estruturação)               | 9/9            | 9/9            | 4/4           | 0                 |

Latência por etapa: extração 10–13 s · estruturação 29–45 s · consolidação
21–41 s. Total aproximado da rodada: ~27 mil tokens de entrada e ~45 mil de
saída + raciocínio. Todas as respostas com `finishReason: STOP`.

### Comprovado (nesta amostra)

- **Contrato:** 10/10 chamadas válidas na 1ª tentativa (schema + integridade
  referencial via `superRefine`), sem nenhuma nova tentativa.
- **Rastreabilidade:** 100% dos itens vinculados a folhas válidas da EAP e
  100% dos marcos vinculados, antes e depois da consolidação.
- **Preservação na consolidação:** nenhum código EAP ou item removido ou
  acrescentado e nenhum vínculo trocado.
- **Sem invenção de datas:** as únicas datas/prazos nas saídas (03/11/2026,
  31/03/2027, "24 horas") constam da especificação.
- **Kick-off:** nenhuma menção nas saídas.
- **Teto de 16.384 tokens justificado:** a estruturação Kanban pequena usou
  7.386 tokens (5.293 de raciocínio), ~90% do teto global de 8.192 — o mesmo
  risco observado na Fase 0.

### Pontos de atenção

1. **Pontos de atenção da matriz sem prova com dados reais.** Nas quatro
   gerações o modelo criou exatamente um item por folha da EAP: cobertura
   total, nenhum ponto de atenção gerado. A detecção de lacunas segue provada
   apenas pelos testes com fixtures. A relação 1:1 pode se tornar mecânica em
   projetos maiores — avaliar na homologação.
2. **Limites de WIP numéricos (2–3) no Kanban** sem base na especificação,
   rotulados pelo modelo como "sugeridos, a calibrar com o time". Mesmo
   comportamento do Kanban atual em produção; não tratado como regressão.
   Opcional: restringir no prompt do Híbrido.
3. **Consolidação sem efeito estrutural** nesta amostra, custando 21–41 s por
   geração. Reforça a consolidação como primeira candidata a otimização.

### Não comprovado

- Confiabilidade estatística (amostra de 4 pipelines).
- Especificação grande (perto do limite de 100 mil caracteres).
- Fluxo completo via Server Actions com o Gemini real — previsto para a
  homologação em Preview (Fase 5).
