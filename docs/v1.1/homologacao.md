# v1.1 — Relatório consolidado de homologação

- **Data:** 15/10/2026
- **Branch / commit avaliado:** `release/v1.1` @ `a7a99c5`, mais os commits
  de documentação.
- **Base de comparação:** `main` @ `607e1f1` (v1.0.2, em produção).
- **Situação:** **homologação aprovada** pelo responsável pelo produto em
  15/10/2026 (seção 12). Merge em `main`, tag e publicação em produção
  **aguardam autorização explícita**.

## 1. Testes automatizados

**179 testes em 17 arquivos, todos aprovados**, além de `tsc --noEmit` e
ESLint sem erros (última execução em 15/10/2026, sobre `a7a99c5`).
`next build` aprovado localmente a cada fase e no deploy de Preview de
`a7a99c5`.

| Área | Arquivo(s) | O que garante |
| --- | --- | --- |
| Contrato de IA dos 3 frameworks | `ai-contract.baseline.test.ts` | JSON Schemas, instruções, prompts e `AI_CONFIG` congelados. Scrum e Kanban idênticos à v1.0.2; Extração e Cascata alterados só pelas correções das seções 6 e 7 |
| Contrato de IA do Híbrido | `hybrid-contract.test.ts` | Schemas e instruções do Híbrido congelados, compatíveis com o Gemini (sem `$ref`/`oneOf`); instruções exigem rastreabilidade e proíbem Kick-off e invenção; regras de critérios de sucesso; contrato unificado aceita as 5 variantes e rejeita mistura de artefatos |
| Domínio do Híbrido | `schemas/hybrid.test.ts`, `traceability.test.ts` | Integridade referencial (ids, códigos EAP, duplicidades) e os 6 tipos de ponto de atenção |
| Pipeline (actions) | `pipeline.actions.test.ts` | Flag desligada bloqueia IA, cota e sessão; cota cobrada uma vez; revalidação a cada etapa; Scrum e Kanban recebem os mesmos dados da v1.0.2; extrações anteriores à correção continuam aceitas |
| Retentativas | `generate-structured*.test.ts` | Espera com jitter em indisponibilidade transitória (v1.0.2) |
| Exportações golden | `exports.golden.test.ts` | Markdown byte a byte e Excel (abas, valores, estilos) dos 3 frameworks e de 3 pacotes do Híbrido |
| Textos de apresentação | `planning-copy.test.ts` | Flag desligada: textos exatamente iguais aos da v1.0; ligada: Híbrido mencionado com as duas modalidades |
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
| Extração e Cascata | Alterados **somente** pelas correções autorizadas dos critérios de sucesso e do escopo do TAP (seções 6 e 7); snapshots atualizados conscientemente |
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
Preview, e fazer redeploy sem cache de build. **Situação:** os cards e os textos
com o Híbrido foram validados no Preview pelo responsável (seção 12), o
que indica que a flag passou a valer nesse ambiente.

**Textos de apresentação** (commit `a7a99c5`). O parágrafo do hero, o
passo "Escolha" de "Como funciona", o rodapé das telas de login e
cadastro e a descrição do site (`<meta name="description">`) passam a
citar "Scrum, Kanban, Cascata ou Híbrido" **somente com a flag ligada**
(`src/lib/planning-copy.ts`). Com a flag desligada, os textos são
exatamente os da v1.0 (HTML idêntico e testes da seção 1). Validados no
Preview pelo responsável.

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

## 7. Correção durante a homologação: escopo resumido do TAP

**Achado.** Com a especificação completa do produto em Cascata + Scrum, o
TAP passou a exibir "Escopo resumido: Não identificado na
especificação.", enquanto os critérios de sucesso vinham preenchidos. Na
versão anterior, era o contrário. A mesma falha já estava numa execução
da validação da seção 6 e não havia sido notada.

**Investigação.**

- **Extração:** não é a causa. A comparação antes e depois da seção 6
  mostra objetivo, requisitos, entregas e restrições preservados (só
  variação normal). A mesma extração gerou escopo em Cascata e em
  Cascata + Kanban.
- **Experimento** (mesma extração, 5 execuções por grupo):

  | Grupo | Escopo "Não identificado" |
  | --- | --- |
  | Prompt da seção 6 (Estruturação + Consolidação) | 2 de 5, sempre já na Estruturação |
  | Controle: mesmo prompt **sem** a regra de critérios de sucesso | 1 de 5 |

- **Etapa:** Estruturação. A Consolidação devolveu o escopo inalterado em
  todas as execuções.
- **Causa:** o escopo não tinha fonte explícita. A extração não tem campo
  "escopo", e a instrução dizia apenas para escrever "Não identificado"
  quando a informação não existisse. O modelo às vezes concluía que não
  havia escopo, mesmo com objetivo, requisitos e entregas disponíveis.
  O problema é anterior à regra de critérios de sucesso, como mostra o
  controle; a contribuição da regra não foi descartada.

**Correção** (commit `45c4c0d`), nas instruções da Cascata, de
Cascata + Scrum e de Cascata + Kanban:

- O escopo resumido é sintetizado a partir do objetivo, dos requisitos,
  das entregas e das restrições de escopo.
- "Não identificado na especificação." só quando esses dados não
  permitirem descrever o escopo.
- Os critérios de sucesso nunca são usados para compor o escopo.
- A restrição da regra de critérios vale só para os critérios: requisitos
  e entregas continuam sendo a base do escopo e da EAP.
- **Sem alteração:** Extração, `successCriteria`, Consolidação, Scrum,
  Kanban, schemas, matriz de rastreabilidade, telas e exportações.

**Testes.**

- 1 teste novo de contrato (fonte do escopo, "Não identificado"
  condicional, proibição de usar critérios, restrição limitada e ordem
  das regras nas três instruções).
- 3 snapshots de instrução atualizados conscientemente: Cascata e as duas
  do Híbrido. Os demais snapshots e as exportações golden ficaram
  inalterados.
- Suíte com 175 testes, typecheck, lint e build aprovados.

**Validação real** (26 chamadas, todas válidas na primeira tentativa;
mesma extração do experimento):

| Cenário | Escopo preenchido | Critérios de sucesso | Escopo cita a seção 106 ou termos dos critérios? |
| --- | --- | --- | --- |
| Cascata + Scrum, 5× | **5/5** (antes: 3/5) | sempre preenchidos (25 ou agrupados em 10) | não |
| Cascata, 3× | **3/3** | sempre preenchidos (25, 10 ou 11) | não |
| Cascata + Kanban, 3× | **3/3** | sempre preenchidos (25 ou 9) | não |
| Controle negativo: Cascata, 2×, sem objetivo, requisitos, entregas nem restrições, mas com 2 critérios | **"Não identificado" 2/2** | 2/2 preservados | não usou os critérios como escopo |

Em todas as execuções, os critérios mantiveram a referência à seção de
origem, sem números ou metas acrescentados.

**Riscos residuais.**

- A falha era intermitente: 0 em 11 execuções após a correção reduz
  muito a probabilidade, mas não a elimina. O checklist da seção 9 inclui
  a conferência do escopo no Preview.
- Os critérios alternam entre a lista completa e itens agrupados. As duas
  formas são permitidas, mas a apresentação fica menos uniforme.

## 8. Preview

| Deploy | Commit | Status |
| --- | --- | --- |
| Vercel (Preview) | `587ae8f` | Concluído com sucesso |
| Vercel (Preview) | `23927e9` | Concluído com sucesso |
| Vercel (Preview) | `ed6d89e` | Concluído com sucesso |
| Vercel (Preview) | `522941b` (inclui `c246822`) | Concluído com sucesso |
| Vercel (Preview) | `45c4c0d` / `e79930f` | Concluído com sucesso |
| Vercel (Preview) | `a7a99c5` | Concluído com sucesso (ambiente da homologação final) |

A flag `HYBRID_PLANNING_ENABLED=true` foi configurada no ambiente Preview
pelo painel da Vercel; o Híbrido ficou visível na homologação final.

## 9. Checklist da homologação manual (Preview, flag ligada)

Resultado conforme a aprovação do responsável (seção 12). Itens marcados
foram citados na aprovação; os demais não foram detalhados
individualmente no retorno e ficam registrados como **não confirmados
item a item**.

- [x] Card na landing page e textos de apresentação com o Híbrido.
- [x] Geração real com **Cascata + Scrum** e **Cascata + Kanban**
      ("geração dos artefatos").
- [x] TAP: **escopo resumido preenchido** e **critérios de sucesso**
      presentes.
- [ ] Card no painel e assistente com as duas combinações (implícitos na
      geração, não citados).
- [ ] Layout em mobile.
- [x] Geração real com uma especificação **perto do limite** (~100 mil
      caracteres): validada localmente após a correção da seção 13, não no
      Preview.
- [ ] TAP com uma especificação sem critérios: critérios "Não
      identificado na especificação." e escopo preenchido.
- [ ] Matriz de rastreabilidade e pontos de atenção conferidos na tela.
- [ ] Exportações do Híbrido: PDF (impressão), Excel e Markdown abertos e
      conferidos.
- [ ] Regressão manual: uma geração e as exportações de Scrum, Kanban e
      Cascata; cores de prioridade no Excel do Scrum.
- [ ] Cota: cada geração do Híbrido debita exatamente 1 (coberto por
      teste automatizado; não conferido no Preview).

## 10. Riscos e limitações conhecidas

- **Especificação perto do limite**: validada após a correção da seção
  13, mas a estruturação do Híbrido fica perto do tempo máximo de 60 s
  por chamada. Se as duas tentativas estourarem, a etapa falha em ~120 s e
  a geração consome 1 da cota. Mitigação possível: tempo maior só nessa
  etapa, com `maxDuration` de 300 s.
- **Amostra pequena** de gerações reais (uma a cinco execuções por
  cenário, fora a PoC).
- **Pontos de atenção**: agora observados com dados reais (4 e 1 na
  especificação completa), mas ainda em amostra pequena.
- **Consolidação sem efeito estrutural** observado nas validações, a um
  custo de 21–41 s por geração. É a primeira candidata a otimização.
- **Critérios de sucesso e escopo**: ver os riscos residuais das seções 6
  e 7.
- **Produção**: o Híbrido permanece desligado (variável ausente) até
  decisão explícita.
- **Itens do checklist não confirmados individualmente** (seção 9): a
  regressão manual dos 3 frameworks é mitigada pelos snapshots e pelo
  HTML idêntico com a flag desligada; exportações e especificação perto do
  limite não têm essa cobertura no navegador.

## 11. Recomendação

Homologação aprovada. Publicar com a flag **desligada** em produção, o que
mantém o comportamento da v1.0.2 para os usuários (textos, cards e
actions do Híbrido inativos). Ligar o Híbrido em produção é uma decisão
separada, de preferência após conferir os itens não confirmados da
seção 9.

## 12. Aprovação

- **Data:** 15/10/2026.
- **Aprovado por:** responsável pelo produto (Murilo58).
- **Escopo declarado:** ajustes do TAP (escopo resumido e critérios de
  sucesso), geração dos artefatos e textos da landing page, no Preview de
  `a7a99c5` com a flag ligada.
- **Evidências automatizadas:** 179 testes em 17 arquivos, typecheck,
  lint e build aprovados (seção 1); 60 chamadas reais à IA válidas na
  primeira tentativa (seções 2, 6 e 7).
- **Ressalvas:** riscos da seção 10 e itens não confirmados da seção 9.
- **Pendente de autorização:** merge em `main`, tag `v1.1.0` e deploy de
  produção.

## 13. Pós-homologação: especificação perto do limite (v1.1.1)

**Achado.** Com uma especificação de 99.775 caracteres (o PRD do produto
mais as seções 79 a 107 da especificação completa), a geração falhou na
**Extração**, etapa comum a todos os frameworks:

- 1ª tentativa (57 s): resposta cortada pelo teto de 8.192 tokens, dos
  quais 3.740 foram de raciocínio do modelo; JSON incompleto.
- 2ª tentativa: cancelada pelo tempo máximo de 60 s e exibida como "Não
  foi possível se comunicar com o serviço de IA".

**Correção** (branch `fix/v1.1.1-extraction-limits`):

- A Extração pede raciocínio baixo (`thinkingLevel: LOW`). As demais
  etapas enviam a mesma requisição de antes.
- Resposta cortada pelo teto de tokens falha na hora, sem repetir a mesma
  chamada.
- Cancelamento pelo tempo máximo é classificado como "timeout".
- 4 testes novos (183 no total); com o código anterior, 3 deles falham.
  Prompts, schemas e snapshots de contrato inalterados.

**Validação real** (12 chamadas, ambiente local):

| Cenário | Resultado |
| --- | --- |
| ~100 mil caracteres — Extração | OK em 38 s, sem tokens de raciocínio (antes: falha em 117 s) |
| ~100 mil — Cascata + Scrum | OK; estruturação em 107 s (1ª tentativa esgotou os 60 s, 2ª concluiu em 47 s); consolidação em 48 s |
| ~100 mil — Cascata + Kanban | OK; estruturação em 45 s, consolidação em 40 s |
| ~100 mil — artefatos | Contrato final válido, sem problemas de integridade; escopo resumido preenchido, sem usar os critérios; critérios agrupados (18 e 10) com a seção de origem; rastreabilidade 12/12 e 15/15 itens; exportações Markdown e Excel geradas |
| Especificação média — Extração | 10 s (antes: 17 s); os 3 critérios de sucesso idênticos |
| Especificação média — Cascata, Scrum, Kanban | Concluídos; TAP com os mesmos critérios e escopo; Scrum com 10 histórias; Kanban com 7 itens (antes: 13), em execução única |

**Riscos residuais.**

- A estruturação do Híbrido com especificações muito grandes fica perto
  do tempo máximo por chamada (seção 10).
- A redução de itens no Kanban da especificação média pode ser variação
  do modelo, mas não foi descartada com uma única execução.
