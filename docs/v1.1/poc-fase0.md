# v1.1 — Planejamento Híbrido · Fase 0: prova de conceito

> Relatório trazido para `release/v1.1` por ser referenciado no código.
> Os scripts (`scripts/poc-hybrid/`) e os resultados brutos citados abaixo
> permanecem apenas na branch `poc/v1.1-hybrid`.

- **Data:** 14/10/2026
- **Branch:** `poc/v1.1-hybrid` (a partir de `release/v1.1`, criada de `main`)
- **Escopo autorizado:** somente Fase 0 — PoC e documentação técnica.
  Nenhum código da aplicação alterado, nenhuma migration, nenhum deploy.
- **Status:** **concluída** — lote 1 interrompido por decisão do produto
  após cobertura mínima (spec pequena) e complementado por uma rodada
  mínima na spec média comparando chamada única e multichamadas (ver
  "Rodada complementar"). Arquitetura de estruturação revisada: **chamada
  única** (decisão 3).

## Contexto e decisões aprovadas

Arquitetura aprovada para a v1.1 (ver plano técnico da conversa de
planejamento):

1. Kick-off fora do escopo inicial da v1.1.
2. Discriminadores `"hibrido-scrum"` e `"hibrido-kanban"` no resultado
   consolidado (sem união aninhada, sem `oneOf` para o Gemini).
3. ~~Estruturação em duas chamadas — governança → execução, cada uma em
   uma Server Action própria.~~ **Revisada após a rodada complementar
   (14/10/2026):** estruturação em **chamada única** (governança e
   execução na mesma resposta), mantendo o pipeline de 3 etapas dos
   frameworks atuais (extração → estruturação → consolidação). A
   rastreabilidade é garantida pela validação determinística em código
   (`superRefine`) e pela matriz calculada em código, não pela divisão da
   chamada. Multichamadas fica documentada como plano B.
4. Uma geração híbrida conta como 1 na cota diária.
5. Feature flag como kill-switch em produção.

Diretrizes adicionais: rastreabilidade EAP ↔ itens ágeis obrigatória;
entregáveis sem vínculo são **pontos de atenção**, não erros; nada de
datas, capacidade ou compromissos sem sustentação na especificação;
Scrum, Kanban e Cascata preservados integralmente.

## O que foi construído (`scripts/poc-hybrid/`)

| Arquivo | Conteúdo |
|---|---|
| `schemas.ts` | Rascunho dos schemas híbridos, compostos via `.shape`/`.element` dos schemas existentes (que **não** foram alterados). EAP com códigos (`1`, `1.1`), fases com `id` e `eapCodes`, marcos com `eapCodes`, itens com `id` + `eapCode`. Integridade referencial via `superRefine`; na etapa de execução, `eapCode` é um `enum` com os códigos da EAP já gerada |
| `traceability.ts` | `buildTraceabilityMatrix()` — matriz EAP → fases → marcos → itens calculada em código (nunca pela IA), com pontos de atenção: entregável sem item, entregável sem fase, item em nó agregador, fase sem entregável, marco sem entregável |
| `prompts.ts` | Prompts novos de governança, execução Scrum, execução Kanban e um adendo à consolidação existente (anexado, nunca substituindo) |
| `measure.ts` | Réplica instrumentada de `generateStructured` (mesmo modelo, temperatura, timeout e tentativas) que registra latência, tokens, `finishReason` e motivo de falha por tentativa |
| `run.ts` | Executor dos pipelines (`split` = multichamadas; `mono` = chamada única), ambos com a mesma consolidação na versão atual do script |
| `analyze.ts` | Agregação dos resultados por pipeline, etapa, rastreabilidade, custo e indicadores de qualidade |
| `offline-checks.ts` | Verificações sem IA: JSON Schema sem `$ref`/`oneOf`, regras de integridade, pontos de atenção e hash de linha de base dos schemas atuais |
| `specs/` | Especificações sintéticas usadas como entrada (pequena e média); a grande seria o próprio `docs/PRD.md` |
| `results/2026-10-14/` | Resultados brutos preservados (JSON por pipeline + log) |

### Reprodução

```bash
# verificações offline (sem chamar a IA)
npx --yes tsx@4.20.3 scripts/poc-hybrid/offline-checks.ts

# pipelines reais (consome a GEMINI_API_KEY do .env)
npx --yes tsx@4.20.3 --env-file=.env scripts/poc-hybrid/run.ts \
  --out <dir> --reps 1 --specs media --variants scrum,kanban --modes split,mono

# agregação
npx --yes tsx@4.20.3 scripts/poc-hybrid/analyze.ts <dir>
```

> O lote registrado aqui rodou com uma versão anterior de `run.ts`, em
> que o modo `mono` **não** passava pela consolidação e rodava apenas na
> repetição 1. A versão commitada já aplica a mesma consolidação aos dois
> modos.

## Verificações offline

- Todos os schemas híbridos convertem para JSON Schema sem `$ref` e sem
  `oneOf`; o `superRefine` é omitido do JSON Schema e vale no `safeParse`
  (portanto dispara a nova tentativa de `generateStructured`).
- `eapCode` vira `enum` no JSON Schema da execução (o Zod reordena chaves
  "inteiras" — irrelevante).
- Rejeitados corretamente: código EAP inexistente, id duplicado, Sprint
  citando história inexistente, código EAP duplicado, subentregável sem
  prefixo do pai, marco com código inexistente, item Kanban em coluna
  inexistente, `eapCode` fora do enum.
- Lacunas geram pontos de atenção, não erro.

Tamanho do JSON Schema (bytes) e hash de linha de base:

| Schema | Bytes | sha256 (16) |
|---|---|---|
| scrum (atual) | 2258 | `0487214337a63398` |
| kanban (atual) | 1691 | `d755e04e9e0ddcc9` |
| cascata (atual) | 3008 | `e70ef7dc8ac9011e` |
| governança | 3303 | — |
| execução scrum (enum EAP) | 2647 | — |
| execução kanban (enum EAP) | 1959 | — |
| consolidação híbrido scrum | 6075 | — |
| consolidação híbrido kanban | 5387 | — |

Os três hashes "atual" são a linha de base para a Fase 1: devem
permanecer idênticos durante toda a v1.1.

## Execução contra o Gemini

Modelo: `gemini-flash-latest` → **`gemini-3.8-flash`**. Temperatura 0,3,
timeout 60 s, 2 tentativas por etapa (configuração de produção);
`maxOutputTokens` 16.384 nas etapas híbridas (produção usa 8.192).

### Pipelines

| Pipeline | Concluídos | Falhas | Observação |
|---|---|---|---|
| Pequena · Híbrido Scrum (split) | 3 | 0 | |
| Pequena · Híbrido Kanban (split) | 3 | 0 | |
| Pequena · chamada única (sem consolidação) | 2 | 0 | indicativo, não comparável |
| Média · Híbrido Scrum (split) | 0 | 1 | governança e execução OK; consolidação falhou por **503** |
| Média · chamada única Scrum | 0 | 1 | **503** |
| Média · Híbrido Kanban (split) | — | — | interrompido na execução (governança OK após 1 retry por 503) |
| Grande (PRD) | — | — | não executado |

32 de 32 chamadas que obtiveram resposta foram válidas na 1ª tentativa
(nenhum JSON inválido, schema incorreto ou falha de integridade). As 5
tentativas com falha foram todas **503 "high demand"** do Gemini.

### Tempo

| Etapa (spec pequena) | Média | Máx. |
|---|---|---|
| Extração | 8,3 s | 9,1 s |
| Governança | 27,6 s | **53,4 s** |
| Execução Scrum / Kanban | 25,5 s / 16,9 s | 29,8 s / 18,7 s |
| Consolidação Scrum / Kanban | 25,6 s / 19,4 s | 31,5 s / 21,7 s |
| **Pipeline completo Scrum** | **77,3 s** | 80,4 s |
| **Pipeline completo Kanban** | **81,9 s** | 101,1 s |

Spec média (parcial): extração 7,4 s; governança 19,5 s (33,7 s com
retry); execução Scrum 38,1 s.

### Tokens e custo

Preços do Gemini 3.8 Flash (tier pago Standard, por 1M tokens; raciocínio
cobrado como saída): **US$ 0,75 entrada / US$ 3,75 saída até
31/12/2026** e **US$ 1,50 / US$ 7,50 a partir de 01/01/2027**.

| Spec pequena, split | Entrada | Saída + raciocínio | US$ 2026 | US$ 2027 |
|---|---|---|---|---|
| Scrum (média de 3) | ~7,2k | ~12,3k | **0,052** | 0,103 |
| Kanban (média de 3) | ~6,0k | ~12,7k | **0,052** | 0,105 |
| Faixa observada | 5,8–7,4k | 8,0–15,3k | 0,035–0,062 | 0,069–0,124 |

- ~**US$ 52 / 1.000 gerações** híbridas (2026) → ~**US$ 104** (2027),
  spec pequena — **se a chave estiver no tier pago** (não verificado).
- Spec média: estimativa por extrapolação de US$ 0,07–0,09 por geração
  em 2026 — **não medida**.
- ~70% do custo vem dos tokens de raciocínio, não da saída visível.

### Rastreabilidade e qualidade (spec pequena, 6 pipelines split)

- Itens com vínculo EAP válido: **43/43 (100%)**, todos em folhas.
- Folhas da EAP com ao menos um item: **100%**. Marcos vinculados à EAP:
  **100%**.
- Consolidação preservou 100% dos códigos e ids (0 removidos,
  adicionados ou revinculados).
- 0 nós da EAP iniciados por verbo de ação; 100% das histórias no formato
  "Como…, quero…, para…"; 2,4–3,1 critérios de aceite por história.
- Heurística de invenção: 1 ocorrência ("velocidade"), revisada
  manualmente — falso positivo ("*sem assumir* estimativas arbitrárias de
  velocidade").

## Riscos técnicos

1. **Limite de 8.192 tokens já foi ultrapassado (alto).** Uma chamada de
   governança da spec **pequena** usou 8.209 tokens de saída + raciocínio
   (761 visíveis + 7.448 de raciocínio). Só não falhou porque a PoC usava
   16.384; com a configuração de produção seria truncada e retentada. O
   raciocínio é volátil: 2,7k a 7,4k para a mesma entrada. O mesmo risco
   **pode** existir hoje na Cascata — não verificado.
2. **503 do Gemini derruba a tentativa extra (alto, afeta produção
   atual).** `generateStructured` repete imediatamente, sem espera; as
   duas tentativas falham em ~1 s. Ocorreu 3 vezes em ~10 minutos. Vale
   para Scrum, Kanban e Cascata hoje.
3. **Latência perto do timeout (médio).** Pior chamada: 53,4 s contra o
   timeout de 60 s, na menor spec. Em specs médias/grandes, timeouts são
   prováveis. O `maxDuration = 150` por action comporta 2 × 60 s desde
   que cada chamada seja uma Server Action própria.
4. **Espera total do usuário (médio).** 80–100 s na spec pequena;
   provavelmente 2–3 min nas médias (estimativa).
5. **Consolidação sem efeito observado (baixo).** Em 6/6 execuções não
   corrigiu nada, mas custa ~25 s e ~35% dos tokens; a integridade já é
   garantida pela validação determinística.

## Rodada complementar — spec média, chamada única × multichamadas

Autorizada após a liberação da v1.0.2. Spec média (portal de compras),
1 repetição por modo e variante, **os dois modos com a mesma
consolidação** (comparação justa). `measure.ts` alinhado à política de
nova tentativa da v1.0.2 (espera de 2–5 s com jitter em 503/429/5xx/rede).
Resultados em `scripts/poc-hybrid/results/2026-10-14/rodada-media/`.

**4/4 pipelines OK, 11/11 chamadas na 1ª tentativa**, sem 503 e sem
nova tentativa.

| Critério | Multichamadas | Chamada única |
|---|---|---|
| Tempo — Scrum / Kanban | 110,7 s / 95,0 s | **73,7 s / 75,6 s** |
| Tempo médio | 102,9 s | **74,7 s (−27%)** |
| Custo por geração 2026 — Scrum / Kanban | US$ 0,081 / 0,068 | **US$ 0,057 / 0,057** |
| Custo por 1.000 gerações (2026 / 2027) | ~US$ 75 / ~149 | **~US$ 57 / ~114** |
| Maior resposta (saída + raciocínio) | 6.685 (consolidação, 82% de 8.192) | 6.472 (estruturação, 79%) |
| Maior chamada | 35,4 s | 37,2 s |
| Itens com vínculo EAP válido | 28/28 | 24/24 |
| Itens em folha / folhas cobertas | 100% / 24/24 | 100% / 23/23 |
| Marcos vinculados à EAP | 9/9 | 8/8 |
| Integridade antes da consolidação | 100% | **100% (1ª tentativa)** |
| Alterações feitas pela consolidação | 0 | 0 |

Qualidade (revisão do autor da PoC, não cega, + indicadores):

- Mesma estrutura de EAP (5 entregáveis, 16–17 nós, todos substantivos),
  cobertura completa do escopo, 100% das histórias no formato
  "Como/quero/para", 2,8 critérios de aceite por história nos dois modos.
- Datas: somente as duas da especificação (03/11/2026 e 31/03/2027),
  nenhuma inventada, nos dois modos.
- Multichamadas foi ligeiramente mais granular (14 × 12 itens) e mais
  fiel em dois pontos: marco explícito "fluxo rastreável em produção até
  31/03/2027" (a chamada única pôs o prazo no nome da fase piloto) e item
  de importação da base de ~800 fornecedores (ausente na chamada única do
  Kanban). Nenhum dos dois modos apresentou defeito de correção.
- Heurística de invenção: 1 ocorrência ("capacidade do time") — falso
  positivo ("*sem suposições* sobre a capacidade do time").

Conclusão: a vantagem teórica das multichamadas (códigos EAP garantidos
por `enum`) não produziu diferença observável — a chamada única acertou
100% dos vínculos sem ela, e a validação em código rejeitaria e
retentaria um vínculo inválido. A chamada única é mais rápida, mais
barata e mantém o pipeline com o mesmo formato dos frameworks atuais.

Limitações: n=1 por célula na spec média; spec grande (~93 mil
caracteres) não testada; revisão de qualidade por um único avaliador; a
spec média passou de 3.730 para 3.834 caracteres por conversão de quebra
de linha para CRLF no checkout (conteúdo idêntico). Risco próprio da
chamada única: se a validação de integridade falhar, a nova tentativa
repete a maior chamada (~30–37 s) — não ocorreu.

## Critérios da Fase 0

**Comprovados**

- Schemas das duas variantes aceitos pelo Gemini (sem `$ref`/`oneOf`;
  `enum` de códigos EAP funcionando).
- Integridade referencial e pontos de atenção (verificações offline).
- Rastreabilidade 100% ponta a ponta nas specs pequena e média, nas duas
  variantes e nos dois modos.
- Pipeline completo em spec de maior complexidade (média), nas duas
  variantes.
- Datas: nenhuma inventada em spec que contém datas explícitas.
- Consolidação preserva códigos e ids (10/10 pipelines).
- Latência por chamada dentro do timeout de 60 s nas specs pequena e
  média (máx. 53,4 s na pequena; 37,2 s na média).
- Comparação chamada única × multichamadas, com consolidação nos dois
  modos — decisão: **chamada única**.
- Custo e tokens reais medidos (specs pequena e média).
- 0 falhas de conteúdo em 43 respostas; as únicas falhas foram 503 do
  Gemini (tratadas desde a v1.0.2).
- Scrum, Kanban e Cascata intocados; hashes de linha de base registrados.

**Pendentes (levar para as fases seguintes)**

1. Limite de 8.192 tokens: já excedido uma vez (8.209, pico de
   raciocínio) — exige `maxOutputTokens` maior nas etapas híbridas ou
   limite de raciocínio (não testado).
2. Spec grande (~93 mil caracteres): latência e tokens não medidos.
3. Pontos de atenção com dados reais — nenhuma spec testada gerou
   lacunas; caminho exercitado apenas nas verificações offline.
4. Taxa de confiabilidade com amostra significativa (n atual pequeno).

## Decisões e recomendações para a v1.1

1. ✅ **v1.0.2 publicada:** espera de 2–5 s com jitter antes da nova
   tentativa em 503/429/5xx/rede (tag `v1.0.2`).
2. ✅ **Estruturação em chamada única** (decisão 3 revisada), pipeline de
   3 etapas igual ao dos frameworks atuais; multichamadas como plano B
   caso specs grandes excedam limites de tempo ou tokens.
3. **Rastreabilidade garantida em código:** `superRefine` de
   integridade + `buildTraceabilityMatrix()` + pontos de atenção.
4. **`maxOutputTokens` = 16.384 somente nas etapas do Híbrido**;
   configuração dos frameworks atuais inalterada.
5. **Consolidação mantida na v1.1** (consistência com os demais
   frameworks e papel anti-invenção do RF-031), registrada como primeira
   candidata a otimização: não corrigiu nada em 10/10 pipelines e custa
   ~33 s e ~47% do custo do pipeline de chamada única.

A Fase 1 não deve começar sem aprovação explícita.
