# v1.1 — Relatório consolidado de homologação

- **Data:** 15/10/2026
- **Branch / commit avaliado:** `release/v1.1` @ `23927e9`, mais os commits
  de documentação.
- **Base de comparação:** `main` @ `607e1f1` (v1.0.2, em produção).
- **Situação:** verificações automatizadas e locais **concluídas**;
  homologação manual no Preview **pendente de confirmação**. A seção
  "Checklist da homologação manual" registra o que ainda precisa ser
  confirmado antes do merge.

## 1. Testes automatizados

**164 testes em 16 arquivos, todos aprovados**, além de `tsc --noEmit`,
ESLint e `next build` sem erros, executados localmente a cada fase.

| Área | Arquivo(s) | O que garante |
| --- | --- | --- |
| Contrato de IA dos 3 frameworks | `ai-contract.baseline.test.ts` | JSON Schemas, instruções, prompts e `AI_CONFIG` de Scrum, Kanban e Cascata idênticos à v1.0.2 |
| Contrato de IA do Híbrido | `hybrid-contract.test.ts` | Schemas e instruções do Híbrido congelados, compatíveis com o Gemini (sem `$ref`/`oneOf`); instruções exigem rastreabilidade e proíbem Kick-off e invenção; contrato unificado aceita as 5 variantes e rejeita mistura de artefatos |
| Domínio do Híbrido | `schemas/hybrid.test.ts`, `traceability.test.ts` | Integridade referencial (ids, códigos EAP, duplicidades) e os 6 tipos de ponto de atenção |
| Pipeline (actions) | `pipeline.actions.test.ts` | Flag desligada bloqueia IA, cota e sessão; cota cobrada uma vez; revalidação a cada etapa; actions atuais intocadas |
| Retentativas | `generate-structured*.test.ts` | Espera com jitter em indisponibilidade transitória (v1.0.2) |
| Exportações golden | `exports.golden.test.ts` | Markdown byte a byte e Excel (abas, valores, estilos) dos 3 frameworks e de 3 pacotes do Híbrido |
| Demais | `to-excel`, `to-markdown`, `output-schemas`, `password`, `limits`, `schema`, `rate-limit/*` | Suíte da v1.0 (rate limiting contra o Postgres real) |

## 2. Validação real com a IA

Registrada em [`validacao-fase3.md`](validacao-fase3.md): 2 especificações
(pequena e média) × 2 variantes, chamando os agentes de produção.

- 10/10 chamadas válidas na primeira tentativa;
- rastreabilidade de 100% antes e depois da consolidação;
- nenhuma data inventada e nenhum Kick-off;
- maior chamada com ~7.400 tokens, o que justifica o teto de 16.384.

**Não coberto:** a especificação grande e uma amostra estatisticamente
relevante (foram só 4 gerações).

## 3. Regressão dos frameworks existentes

| Verificação | Resultado |
| --- | --- |
| Prompts, schemas e agentes de Scrum, Kanban e Cascata | **Inalterados** desde a v1.0.2 (verificado por `git diff` e pelos snapshots de contrato) |
| Actions `runExtractionStep` / `runStructuringStep` / `runConsolidationStep` | Mesma assinatura e comportamento; a consolidação valida com `classicResultSchema`, idêntico ao contrato da v1.0 |
| Telas de resultado dos 3 frameworks | HTML renderizado **idêntico byte a byte** antes e depois das fases 4, 5 e 6 (4 fixtures golden) |
| Assistente com a flag desligada | Seleção de framework e confirmação com HTML idêntico ao da v1.0.2 |
| Landing page com a flag desligada | Seção "Frameworks suportados" com HTML idêntico ao da v1.0.2 |
| Exportações Markdown dos 3 frameworks | Snapshots inalterados |
| Exportações Excel dos 3 frameworks | Snapshots inalterados, **exceto a correção autorizada** em `scrum.xlsx.json`: duas células voltaram a exibir a cor de prioridade (antes coberta pela zebra) |

## 4. Exportações do Híbrido

| Formato | Verificado | Pendente |
| --- | --- | --- |
| Markdown | Snapshots das duas variantes e de um pacote com todos os pontos de atenção; conteúdo revisado; escape de `\|` na tabela; ausência de Kick-off testada | Abrir em um visualizador real |
| Excel | Snapshots de abas, valores e estilos; destaques visíveis sobre a zebra | Abrir o `.xlsx` no Excel |
| PDF | — (é a impressão da tela) | Imprimir a tela do Híbrido no navegador |

## 5. Cards "Planejamento Híbrido" nas telas iniciais

| Tela | Verificado | Pendente |
| --- | --- | --- |
| Landing page | Flag desligada: sem alteração; flag ligada: só o card adicionado, ocupando a linha inteira abaixo dos 3 frameworks | Confirmação visual no Preview (desktop e mobile) |
| Painel autenticado | Revisão do diff (mesmo bloco condicional); build sem erros | Confirmação visual no Preview (não renderizável localmente sem login) |

## 6. Preview

| Deploy | Commit | Status |
| --- | --- | --- |
| Vercel (Preview) | `587ae8f` | Concluído com sucesso |
| Vercel (Preview) | `23927e9` | Concluído com sucesso |

A configuração de `HYBRID_PLANNING_ENABLED=true` no ambiente Preview é
feita no painel da Vercel. Ela **ainda não foi confirmada neste
relatório**.

## 7. Checklist da homologação manual (Preview, flag ligada)

Preencher antes do merge:

- [ ] Card na landing page e no painel, em desktop e mobile.
- [ ] Assistente: grupo "Planejamento Híbrido" visível e as duas
      combinações selecionáveis.
- [ ] Geração real com **Cascata + Scrum**.
- [ ] Geração real com **Cascata + Kanban**.
- [ ] Geração real com a **especificação grande** (perto de 100 mil
      caracteres).
- [ ] Resultado: matriz de rastreabilidade e pontos de atenção legíveis;
      layout em desktop e mobile.
- [ ] Exportações do Híbrido: PDF (impressão), Excel e Markdown abertos e
      conferidos.
- [ ] Regressão: uma geração e as exportações de Scrum, Kanban e Cascata;
      cores de prioridade no Excel do Scrum.
- [ ] Cota: cada geração do Híbrido debita exatamente 1.

## 8. Riscos e limitações conhecidas

- **Especificação grande não validada**: há risco de latência e de tokens
  acima do previsto. Mitigações: o teto de 16.384 tokens, o
  `maxDuration` de 150 s por etapa e a nova tentativa controlada.
- **Amostra pequena** de gerações reais (4 completas, fora a PoC).
- **Pontos de atenção sem prova com dados reais**: o modelo gerou
  cobertura completa nas 4 gerações. A detecção está coberta por testes
  com fixtures.
- **Consolidação sem efeito estrutural** observado, a um custo de 21–41 s
  por geração. É a primeira candidata a otimização.
- **Produção**: o Híbrido permanece desligado (variável ausente) até
  decisão explícita.

## 9. Recomendação

Liberar o merge em `main` **somente após** o preenchimento do checklist da
seção 7. O deploy de produção deve ocorrer com a flag desligada; ligá-la
fica para uma decisão separada.
