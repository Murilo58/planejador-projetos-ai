# v1.1 — Relatório consolidado de homologação

- **Data:** 15/10/2026
- **Branch / commit avaliado:** `release/v1.1` @ `c246822`, mais os commits
  de documentação.
- **Base de comparação:** `main` @ `607e1f1` (v1.0.2, em produção).
- **Situação:** verificações automatizadas e locais **concluídas**;
  homologação manual no Preview **pendente de confirmação**. A seção
  "Checklist da homologação manual" registra o que ainda precisa ser
  confirmado antes do merge.

## 1. Testes automatizados

**174 testes em 16 arquivos, todos aprovados**, além de `tsc --noEmit`,
ESLint e `next build` sem erros, executados localmente a cada fase.

| Área | Arquivo(s) | O que garante |
| --- | --- | --- |
| Contrato de IA dos 3 frameworks | `ai-contract.baseline.test.ts` | JSON Schemas, instruções, prompts e `AI_CONFIG` congelados. Scrum e Kanban idênticos à v1.0.2; Extração e Cascata alterados só pela correção da seção 6 |
| Contrato de IA do Híbrido | `hybrid-contract.test.ts` | Schemas e instruções do Híbrido congelados, compatíveis com o Gemini (sem `$ref`/`oneOf`); instruções exigem rastreabilidade e proíbem Kick-off e invenção; regras de critérios de sucesso; contrato unificado aceita as 5 variantes e rejeita mistura de artefatos |
| Domínio do Híbrido | `schemas/hybrid.test.ts`, `traceability.test.ts` | Integridade referencial (ids, códigos EAP, duplicidades) e os 6 tipos de ponto de atenção |
| Pipeline (actions) | `pipeline.actions.test.ts` | Flag desligada bloqueia IA, cota e sessão; cota cobrada uma vez; revalidação a cada etapa; Scrum e Kanban recebem os mesmos dados da v1.0.2; extrações anteriores à correção continuam aceitas |
| Retentativas | `generate-structured*.test.ts` | Espera com jitter em indisponibilidade transitória (v1.0.2) |
| Exportações golden | `exports.golden.test.ts` | Markdown byte a byte e Excel (abas, valores, estilos) dos 3 frameworks e de 3 pacotes do Híbrido |
| Demais | `to-excel`, `to-markdown`, `output-schemas`, `password`, `limits`, `schema`, `rate-limit/*` | Suíte da v1.0 (rate limiting contra o Postgres real) e o campo `successCriteria` da extração |

## 2. Validação real com a IA

**Prompts finais do Híbrido** — registrada em
[`validacao-fase3.md`](validacao-fase3.md): 2 especificações (pequena e
média) × 2 variantes, chamando os agentes de produção.

- 10/10 chamadas válidas na primeira tentativa;
- rastreabilidade de 100% antes e depois da consolidação;
- nenhuma data inventada e nenhum Kick-off;
- maior chamada com ~7.400 tokens, o que justifica o teto de 16.384.

**Correção dos critérios de sucesso** — 24 chamadas, todas válidas na
primeira tentativa (detalhes na seção 6). Incluiu a especificação
completa do próprio produto (~36 mil caracteres) nas duas variantes do
Híbrido, com rastreabilidade de 10/10 itens e 5/5 marcos e os primeiros
pontos de atenção gerados com dados reais.

**Não coberto:** uma especificação perto do limite de 100 mil caracteres
e uma amostra estatisticamente relevante (uma execução por cenário).

## 3. Regressão dos frameworks existentes

| Verificação | Resultado |
| --- | --- |
| Prompts, schemas e agentes de Scrum e Kanban | **Inalterados** desde a v1.0.2 (verificado por `git diff` e pelos snapshots de contrato). Os dados extraídos que eles recebem são os mesmos da v1.0.2 (seção 6) |
| Extração e Cascata | Alterados **somente** pela correção autorizada dos critérios de sucesso (seção 6); snapshots atualizados conscientemente |
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

**Pendência registrada na homologação:** o card não apareceu na página
pública do Preview. O código está no deploy, e builds locais confirmaram
o mecanismo: sem a variável, o card fica ausente; com `true`, aparece;
com `"true"` (aspas no valor), fica ausente. A causa provável é
configuração: `HYBRID_PLANNING_ENABLED` não valia para o ambiente Preview
no momento do build. A página pública é estática e lê a variável no
build; o painel a lê a cada acesso, mas também só depois de um novo
deploy. **Ação:** cadastrar a variável com o valor exato `true`, só para
Preview, e fazer redeploy sem cache de build.

## 6. Correção durante a homologação: critérios de sucesso do TAP

**Achado.** Com a especificação completa do próprio produto, o TAP
mostrou "Critérios de sucesso: Não identificado na especificação.",
embora o documento tenha a seção "106. Definição de Pronto do Produto",
com 25 condições objetivas para considerar o MVP concluído.

**Causa (confirmada com uma extração real).** O schema de Extração não
tinha categoria para critérios de sucesso ou de conclusão do projeto.

- Os itens da seção 106 se espalharam por requisitos, entregas e
  restrições, sem o vínculo com a conclusão do projeto.
- Quatro deles se perderam por completo: lint, typecheck, build e
  credenciais não versionadas.
- A Estruturação recebe só a extração e não deve inventar, então
  devolveu lista vazia (comportamento correto).
- A Consolidação não lê o texto original.
- Quando a especificação tem uma seção chamada literalmente "Critérios de
  sucesso" (especificação média), o TAP já saía preenchido.

**Correção** (commit `c246822`):

- **Extração:** novo campo `successCriteria` com condições de conclusão,
  critérios de aceitação do projeto e DoD do produto/MVP.
  - Preserva as expressões de verificação e a seção de origem.
  - Exclui critérios de aceite e DoD de histórias ou tarefas.
  - A mesma informação continua nas demais categorias.
- **TAP da Cascata, Cascata + Scrum e Cascata + Kanban:** os critérios
  vêm somente desse campo. É permitido agrupar, mas não acrescentar; sem
  itens, a lista fica vazia.
- **Scrum e Kanban:** estruturação e consolidação recebem a extração
  **sem** o campo, então seus dados de entrada permanecem os da v1.0.2.
- **Compatibilidade:** a revalidação entre etapas aceita extrações
  anteriores à correção, tratando a ausência do campo como lista vazia.
- **Sem alteração:** arquitetura dos 3 agentes, consolidação, schema do
  TAP, matriz de rastreabilidade, telas e exportações.

**Testes.**

- 10 testes novos e 6 snapshots de contrato atualizados conscientemente:
  - schema e instrução da Extração;
  - instrução da Cascata;
  - as duas instruções do Híbrido;
  - os prompts de usuário da Cascata e da Consolidação.
- Snapshots de Scrum, Kanban, consolidação, adendo do Híbrido e
  exportações golden ficaram inalterados.
- Teste de mutação: com a remoção do campo desligada para Scrum e Kanban,
  4 testes falham.

**Validação real** (uma execução por cenário):

| Cenário | Resultado |
| --- | --- |
| Especificação completa — Cascata | 25/25 itens da seção 106 na extração e no TAP, com "(seção 106)"; nenhuma meta ou número acrescentado |
| Especificação completa — Cascata + Scrum | TAP com 25 critérios; rastreabilidade de 10/10 itens e 5/5 marcos; 4 pontos de atenção reais (entregáveis sem item) |
| Especificação completa — Cascata + Kanban | TAP com 25 critérios; rastreabilidade de 10/10 itens e 5/5 marcos; 1 ponto de atenção |
| Especificação média — Cascata | Os 3 critérios explícitos mantidos, agora com "(seção 10)" |
| Especificação média — Scrum e Kanban | 10 histórias e 13 itens; nenhuma referência ao campo |
| Negativo: especificação pequena (sem critérios) | Lista vazia; o TAP mostra "Não identificado na especificação." |
| Negativo: DoD somente de histórias | Lista vazia; a DoD de histórias **não** foi tratada como critério do projeto |

**Riscos residuais.**

- **Redação:** os critérios saem como trechos literais ("lint passar
  (seção 106)"), sem agrupamento. São fiéis ao texto, mas formam uma
  lista longa e pouco natural para um TAP. Um ajuste de redação e
  agrupamento é opcional e depende de decisão.
- **Influência na execução do Híbrido:** os critérios também chegam à
  estruturação do Híbrido e influenciam alguns critérios de aceite das
  histórias. O conteúdo é da própria especificação.
- **Pertinência:** a classificação depende do modelo; um documento
  ambíguo pode gerar falso positivo ou falso negativo.

## 7. Preview

| Deploy | Commit | Status |
| --- | --- | --- |
| Vercel (Preview) | `587ae8f` | Concluído com sucesso |
| Vercel (Preview) | `23927e9` | Concluído com sucesso |
| Vercel (Preview) | `ed6d89e` | Concluído com sucesso |
| Vercel (Preview) | `c246822` | Pendente (aguarda push autorizado) |

A configuração de `HYBRID_PLANNING_ENABLED=true` no ambiente Preview é
feita no painel da Vercel. Ela **ainda não foi confirmada neste
relatório** (ver seção 5).

## 8. Checklist da homologação manual (Preview, flag ligada)

Preencher antes do merge:

- [ ] Card na landing page e no painel, em desktop e mobile.
- [ ] Assistente: grupo "Planejamento Híbrido" visível e as duas
      combinações selecionáveis.
- [ ] Geração real com **Cascata + Scrum**.
- [ ] Geração real com **Cascata + Kanban**.
- [ ] Geração real com uma especificação **perto do limite** (~100 mil
      caracteres).
- [ ] TAP com critérios de sucesso: especificação completa do produto em
      Cascata e no Híbrido mostra os critérios da seção 106; uma
      especificação sem critérios mantém "Não identificado na
      especificação.".
- [ ] Resultado: matriz de rastreabilidade e pontos de atenção legíveis;
      layout em desktop e mobile.
- [ ] Exportações do Híbrido: PDF (impressão), Excel e Markdown abertos e
      conferidos.
- [ ] Regressão: uma geração e as exportações de Scrum, Kanban e Cascata;
      cores de prioridade no Excel do Scrum.
- [ ] Cota: cada geração do Híbrido debita exatamente 1.

## 9. Riscos e limitações conhecidas

- **Especificação perto do limite não validada**: a especificação completa
  do produto (~36 mil caracteres) passou nas duas variantes, mas nenhuma
  perto de 100 mil. Há risco de latência e de tokens acima do previsto.
  Mitigações: o teto de 16.384 tokens, o `maxDuration` de 150 s por
  etapa e a nova tentativa controlada.
- **Amostra pequena** de gerações reais (uma execução por cenário, fora a
  PoC).
- **Pontos de atenção**: agora observados com dados reais (4 e 1 na
  especificação completa), mas ainda em amostra pequena.
- **Consolidação sem efeito estrutural** observado nas primeiras
  validações, a um custo de 21–41 s por geração. É a primeira candidata a
  otimização.
- **Critérios de sucesso**: ver os riscos residuais da seção 6.
- **Produção**: o Híbrido permanece desligado (variável ausente) até
  decisão explícita.

## 10. Recomendação

Liberar o merge em `main` **somente após** o preenchimento do checklist da
seção 8. O deploy de produção deve ocorrer com a flag desligada; ligá-la
fica para uma decisão separada.
