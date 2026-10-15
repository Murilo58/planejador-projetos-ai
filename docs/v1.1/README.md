# v1.1 — Planejamento Híbrido

Quarto modo de planejamento do Planejador de Projetos AI: **governança
preditiva com execução ágil**, em duas combinações escolhidas manualmente
pelo usuário:

- **Cascata + Scrum** (`hibrido-scrum`)
- **Cascata + Kanban** (`hibrido-kanban`)

Cada geração produz um pacote integrado: TAP, EAP com códigos, cronograma
macro com fases e marcos, execução ágil (backlog e Sprints, ou quadro
Kanban) e a **matriz de rastreabilidade** entre a EAP e os itens ágeis.

Disponível somente com a feature flag `HYBRID_PLANNING_ENABLED=true`.
Desligada por padrão — e em produção até decisão explícita.

## Documentos

| Documento | Conteúdo |
| --- | --- |
| [`poc-fase0.md`](poc-fase0.md) | Prova de conceito: chamada única × multichamadas, tokens, custo, riscos |
| [`validacao-fase3.md`](validacao-fase3.md) | Validação real (Gemini) dos prompts finais |
| [`homologacao.md`](homologacao.md) | Relatório consolidado de homologação |

## Diretrizes de produto

- A escolha entre os frameworks — e entre as duas combinações — é sempre
  do usuário (RN-001/RN-002); a IA nunca decide.
- **Rastreabilidade obrigatória**: todo item ágil referencia um código
  existente da EAP (`eapCode`).
- **Lacunas são pontos de atenção, não erros**: um entregável sem item
  ágil (ex.: documental) aparece para revisão, sem invalidar a geração.
- Nada de datas, capacidade do time ou compromissos sem sustentação na
  especificação.
- **Kick-off fora do escopo** da v1.1.
- Scrum, Kanban e Cascata preservados integralmente.

## Arquitetura

O Híbrido segue o mesmo pipeline de 3 etapas dos demais frameworks, em
Server Actions próprias (`runHybridExtractionStep`,
`runHybridStructuringStep`, `runHybridConsolidationStep`, em
`src/lib/ai/actions.ts`). As actions de Scrum, Kanban e Cascata não mudam
de assinatura nem de comportamento.

| Etapa | Híbrido |
| --- | --- |
| Extração | Mesmo agente e prompt dos demais frameworks; cobra a cota (1 geração = 1 na cota) |
| Estruturação | **Uma única chamada** gera governança e execução juntas (`prompts/hybrid.ts`, `agents/hybrid-structuring-agent.ts`) |
| Consolidação | Mesmo agente, com um adendo **anexado** à instrução (nunca a substitui) |

Decisões registradas:

- **Chamada única, não multichamadas** (decisão revisada na Fase 0): 27%
  mais rápida e ~23% mais barata na PoC, com a mesma rastreabilidade.
  Multichamadas (governança → execução com `eapCode` como `enum`) fica
  documentada como plano B.
- **Integridade em código, não na IA**: `findHybridIntegrityIssues`
  (`schemas/hybrid.ts`) valida ids, duplicidades e referências à EAP via
  `superRefine` — uma violação dispara a nova tentativa controlada de
  `generateStructured`. Não aparece no JSON Schema enviado ao Gemini.
- **Matriz de rastreabilidade sempre recalculada** do pacote
  (`src/lib/hybrid/traceability.ts`), nunca armazenada — não pode
  divergir dele. Seis tipos de ponto de atenção: entregável sem item,
  entregável sem fase, item em entregável agregador, fase sem entregável,
  marco sem entregável, história fora das Sprints.
- **`maxOutputTokens` de 16.384 só no Híbrido** (`hybridMaxOutputTokens`);
  os demais frameworks seguem com 8.192. Motivo: o raciocínio do modelo
  chegou a ~7.400 tokens numa única estruturação (PoC e validação).
- **Contrato do resultado**: `consolidatedResultSchema` inclui as duas
  variantes; o contrato da v1.0 permanece intacto como
  `classicResultSchema`, usado pela consolidação dos três frameworks.
- **Feature flag como kill-switch** (`isHybridPlanningEnabled()`,
  `src/lib/hybrid/frameworks.ts`), avaliada sempre no servidor: cada
  action do Híbrido a verifica antes de tocar na IA, na cota ou na sessão.
  A interface (cards nas telas iniciais, opções no assistente) também só
  exibe o Híbrido com a flag ligada.

## Interface

- **Telas iniciais**: card "Planejamento Híbrido" na seção "Frameworks
  suportados" da landing page e no painel, abaixo dos três frameworks.
- **Assistente** (`/app/new`): grupo "Planejamento Híbrido" com as duas
  combinações, abaixo dos três frameworks.
- **Resultado** (`/app/result`): TAP, EAP com códigos, cronograma de fases
  e marcos, backlog (com primeira Sprint e Sprints) ou quadro Kanban — cada
  item com seu vínculo ("US-02 · EAP 1.2 Agendamento online") —, matriz de
  rastreabilidade e pontos de atenção.

## Exportações

| Formato | Conteúdo do Híbrido |
| --- | --- |
| Markdown | Mesma ordem da tela, com tabela de rastreabilidade e pontos de atenção |
| Excel | Resumo, TAP, EAP, Cronograma Macro, abas da execução (com colunas ID e EAP), Rastreabilidade e Pontos de Atenção |
| PDF | Impressão nativa da tela de resultado |

## Operação da feature flag

| Ambiente | Valor | Observação |
| --- | --- | --- |
| Production | ausente (desligada) | Até decisão explícita de liberar |
| Preview | `true` | Somente para homologação |
| Local | opcional | `HYBRID_PLANNING_ENABLED="true"` no `.env.local` |

Variáveis de ambiente na Vercel só valem após um novo deploy. A landing
page é estática: a flag ali é lida no build. Para desligar o Híbrido em
produção depois de ligado, basta remover a variável (ou usar outro valor)
e fazer redeploy — sem rollback de código.

## Fases de implementação

| Fase | Commit | Conteúdo |
| --- | --- | --- |
| 0 | `poc/v1.1-hybrid` | Prova de conceito (não incorporada ao código) |
| 1 | `0b55611` | Snapshots de proteção: contrato de IA e exportações dos 3 frameworks |
| 2 | `94a6c03` | Domínio: schemas, integridade e rastreabilidade |
| 3 | `39e858c` | Pipeline de geração com chamada única, atrás da flag |
| — | `09fd483` | Validação real dos prompts finais |
| 4 | `384a391` | Refatoração da tela de resultado e das exportações em seções reutilizáveis |
| 5 | `3061db8` | Assistente e tela de resultado do Híbrido |
| 6 | `bac6cab` | Exportações do Híbrido |
| — | `587ae8f` | Correção: cores de prioridade cobertas pela zebra no Excel (pré-existente) |
| — | `23927e9` | Cards nas telas iniciais |
| — | `c246822` | Correção: critérios de sucesso do projeto reconhecidos na Extração e usados no TAP |
| — | `45c4c0d` | Correção: escopo resumido do TAP com fonte explícita |
| — | `a7a99c5` | Textos da landing page e das telas de login/cadastro citam o Híbrido (só com a flag ligada) |

## Melhorias candidatas (pós-v1.1)

- **Otimizar ou dispensar a consolidação no Híbrido**: na validação real
  ela não alterou a estrutura e custou 21–41 s por geração.
- **Kick-off do Híbrido**, se priorizado.
- **Relação item ↔ EAP**: o modelo tendeu a criar exatamente um item por
  folha da EAP; avaliar com especificações maiores se isso empobrece o
  backlog.
- **Limites de WIP numéricos** no Kanban sugeridos sem base na
  especificação (mesmo comportamento do Kanban atual).
