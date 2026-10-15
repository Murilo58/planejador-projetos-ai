# Planejador de Projetos AI

**v1.0.2** — publicada em produção:
[planejador.orizonprojects.com.br](https://planejador.orizonprojects.com.br).
**v1.1** (Planejamento Híbrido) — em homologação na branch `release/v1.1`,
atrás de feature flag e desligada em produção.

Aplicação web que recebe uma especificação técnica de projeto (PDF ou texto)
e utiliza Inteligência Artificial para gerar os artefatos iniciais de gestão
de projetos correspondentes ao framework escolhido manualmente pelo usuário:
**Scrum**, **Kanban** ou **Cascata** — e, a partir da v1.1, o
**Planejamento Híbrido** (Cascata + Scrum ou Cascata + Kanban), quando
habilitado.

> Documentação de produto completa em [`docs/PRD.md`](docs/PRD.md).
> Documentação técnica da v1.1 em [`docs/v1.1/`](docs/v1.1/README.md).

## Problema e solução

Transformar uma especificação técnica em artefatos de gestão (histórias de
usuário, backlog, quadro Kanban, TAP, EAP, cronograma, material de
Kick-off) é um trabalho manual, repetitivo e sujeito a inconsistência. O
Planejador de Projetos AI reduz esse esforço: o usuário envia a
especificação, escolhe o framework e recebe um pacote inicial estruturado,
que deve ser revisado pelo responsável pelo projeto antes do uso real.

A IA atua apenas como apoio à estruturação. **A escolha do framework é
sempre do usuário** — a IA nunca decide nem sugere automaticamente qual
método utilizar.

## Status do projeto

**Versão 1.0.2 em produção** em
[planejador.orizonprojects.com.br](https://planejador.orizonprojects.com.br),
via Vercel, com banco de produção dedicado no Neon (separado do ambiente de
desenvolvimento, e agora também do ambiente de Preview — ver Etapa 8).
Estado atual:

- [x] **Etapa 1** — estrutura do projeto, configuração inicial e interface
      (landing page, identidade visual, componentes base).
- [x] **Etapa 2** — autenticação (Auth.js + Neon/Prisma) e navegação entre
      área pública e autenticada.
- [x] **Etapa 3** — entrada da especificação (PDF ou texto) e seleção do
      framework, em `/app/new`.
- [x] **Etapa 4** — integração com IA (Gemini) e os três agentes
      (Extração, Estruturação, Consolidação), com apresentação básica do
      resultado em `/app/result`.
- [x] **Etapa 5** — apresentação visual especializada dos artefatos: quadro
      Kanban horizontal/tabs, hierarquia visual da EAP, timeline de
      cronograma, cards de Sprint e slides de Kick-off (PRD §48-51).
- [x] **Etapa 6** — exportação (texto, PDF e Excel), tratamento de erros
      (sessão expirada, erro de rede, error boundaries), headers de
      segurança e suite de testes unitários.
- [x] **Etapa 7** — auditoria de segurança e produção: rate limiting de
      gerações por usuário e de tentativas de autenticação (ambos
      persistidos no Postgres, não em memória — ver
      `src/lib/rate-limit/`), correções de paginação de impressão nos
      três frameworks, publicação na Vercel com domínio próprio e HTTPS,
      e homologação funcional e visual completa dos três frameworks em
      produção. **v1.0.0.**
- [x] **Etapa 8** — manutenção v1.0.1, concluída e publicada: correção da
      vulnerabilidade `exceljs`→`uuid` (override para `uuid@^11.1.1`),
      Content-Security-Policy em `Report-Only`, `engines.node` declarado,
      correção de contraste AA (`--muted-foreground`), validação completa
      em deployment Preview dedicado antes de seguir para produção, tag
      `v1.0.1` e merge em `main`. Na sequência, já em produção: avaliação
      de segurança consolidada (dependências, aplicação e infraestrutura —
      ver "Melhorias futuras" para os itens de risco residual aceito) e
      isolamento Production/Preview — banco de dados dedicado (branch
      `preview` do Neon, schema aplicado via `prisma migrate deploy`, sem
      nenhum dado de produção copiado) e `AUTH_SECRET` exclusivo por
      ambiente, configurados via Vercel CLI (`vercel env add`) com os
      valores de Production nunca expostos ou alterados no processo.
      `GEMINI_API_KEY` permanece deliberadamente compartilhada por ora
      (ver "Melhorias futuras"). Manutenção encerrada — próximo ciclo de
      trabalho é a v1.1.
- [x] **Etapa 9** — manutenção v1.0.2, concluída e publicada: nova
      tentativa com espera de 2–5s com jitter quando a IA falha por
      indisponibilidade transitória (503, 429, 5xx ou rede). Antes, a
      segunda tentativa era imediata e caía no mesmo pico de demanda —
      problema observado na prova de conceito da v1.1
      (`docs/v1.1/poc-fase0.md`, branch `poc/v1.1-hybrid`). Coberta por
      testes automatizados (cliente simulado e SDK real com HTTP 503
      simulado), homologada manualmente no Preview nos 3 frameworks e
      nas 3 exportações, tag `v1.0.2` e merge em `main`. Próximo ciclo:
      v1.1 (Planejamento Híbrido).
- [ ] **Etapa 10** — v1.1, **Planejamento Híbrido**, implementada na branch
      `release/v1.1` e **em homologação no Preview**. Governança
      preditiva (TAP, EAP codificada, fases e marcos) integrada à
      execução ágil (Scrum ou Kanban), com rastreabilidade obrigatória
      entre a EAP e cada item ágil e lacunas exibidas como pontos de
      atenção. Inclui assistente, tela de resultado, exportações
      (Markdown, Excel, PDF) e cards nas telas iniciais, tudo atrás da
      feature flag `HYBRID_PLANNING_ENABLED` (desligada em produção).
      Kick-off fora do escopo. Scrum, Kanban e Cascata preservados,
      com contrato de IA e exportações congelados em snapshots. Detalhes
      e relatório de homologação em [`docs/v1.1/`](docs/v1.1/README.md).

## Arquitetura

Monolito modular em **Next.js (App Router) + TypeScript**, sem
microsserviços, filas ou orquestradores externos. Três agentes de IA
(Extração, Estruturação, Consolidação) são módulos internos da aplicação,
executados em sequência síncrona.

| Camada | Tecnologia |
| --- | --- |
| Framework / UI | Next.js 16 (App Router), React 19, TypeScript |
| Estilo | Tailwind CSS v4 + shadcn/ui |
| Autenticação | Auth.js (next-auth v5) — Credentials (email/senha), sessão em JWT |
| Banco de dados | PostgreSQL no Neon, via Prisma 7 (driver adapter `@prisma/adapter-pg`) |
| IA | Google Gemini (`@google/genai`), server-side, 3 agentes sequenciais |

Apenas uma tabela existe no banco até agora: `User` (email + hash da senha).
Não há tabelas de projetos, documentos, especificações ou artefatos gerados
— a aplicação não persiste permanentemente o que o usuário envia (RN-007,
RN-008, RN-010 do PRD).

Em `/app/new`, o PDF é lido e tem o texto extraído inteiramente no
navegador (`pdfjs-dist`, carregado sob demanda) — o arquivo original nunca
chega ao servidor. Ao confirmar, três Server Actions chamam a IA em
sequência — Extração → Estruturação → Consolidação (`src/lib/ai/`) —, cada
uma revalidando a entrada que recebe de volta do cliente antes de usá-la.
O resultado final vai para `sessionStorage` (nunca para o banco) e a
aplicação navega para `/app/result`.

A apresentação do resultado em `/app/result` tem tratamento visual
especializado por framework (PRD §48-51): Scrum com backlog em cards,
badges de prioridade coloridos e critérios de aceite expansíveis; Kanban
como quadro horizontal no desktop e seletor de coluna por tabs no mobile
(nunca scroll horizontal do board inteiro); Cascata com TAP em formato de
documento, EAP como hierarquia de caixas, cronograma em timeline e
Kick-off como um filminho de slides. Nunca JSON bruto (RF-048); campos
ausentes seguem marcados como "Não identificado na especificação."
(RF-052).

O **Planejamento Híbrido** (v1.1) usa o mesmo pipeline de 3 etapas, em
Server Actions próprias que verificam a feature flag no servidor. A
estruturação gera governança e execução numa **única chamada**; a
integridade dos vínculos com a EAP é validada em código, e a matriz de
rastreabilidade é sempre recalculada a partir do pacote
(`src/lib/hybrid/`). A tela de resultado reaproveita as seções da Cascata
e de Scrum/Kanban. Decisões e arquitetura em
[`docs/v1.1/README.md`](docs/v1.1/README.md).

### Decisões técnicas registradas

- **Cache Components / Partial Prefetching desligados** em
  `next.config.ts` — evita o paradigma de cache (`"use cache"`) do Next.js
  16, incompatível com a simplicidade pretendida para rotas autenticadas
  dinâmicas.
- **`proxy.ts` em vez de `middleware.ts`** — convenção renomeada no
  Next.js 16 (mesma função, nome do arquivo e da exportação mudaram; roda
  em runtime Node.js por padrão nessa versão).
- **Auth.js v5 (beta)**, não v4 — é a versão desenhada para o App Router
  (Server Actions, `auth()` em Server Components), com menos código do que
  a v4 exigiria. Config dividida em `src/auth.config.ts` (sem Prisma —
  usada só para verificar sessão no `proxy.ts`) e `src/auth.ts` (completa,
  com o Credentials provider que consulta o banco).
- **Sessão em JWT, sem Adapter** — não há tabelas `Account`/`Session`/
  `VerificationToken`; a sessão vive inteiramente no cookie assinado por
  `AUTH_SECRET`. Mais simples por não exigir tabelas adicionais nem leitura
  de banco a cada requisição autenticada.
- **Prisma 7 + `@prisma/adapter-pg`** — o novo gerador `prisma-client` do
  Prisma 7 não lê mais a connection string automaticamente em runtime; o
  Client exige um driver adapter explícito. Usamos o adapter padrão
  (`node-postgres`), não o adapter específico da Neon, porque toda leitura
  ao banco acontece em Server Actions/Route Handlers Node.js — nunca em
  Edge — tornando o adapter mais simples também o mais adequado aqui.
- **Duas connection strings do Neon**: `DATABASE_URL` (pooled, usada pela
  aplicação) e `DIRECT_URL` (direta, usada só pelo Prisma CLI em
  migrations) — a recomendação oficial do Neon para evitar falhas de lock
  do Prisma Migrate através do pooler.
- **Sem senha própria**: hashing via `bcryptjs` (12 rounds); validação de
  entrada via `zod`. Nenhuma criptografia "artesanal".
- **`pdfjs-dist` para extração de texto no navegador** — importado
  dinamicamente (só entra no bundle quando o usuário escolhe enviar PDF).
  O worker é referenciado com `new URL(..., import.meta.url)`, o padrão que
  o Turbopack reconhece para emitir o arquivo como asset estático (sem
  plugin ou cópia manual).
- **Limites de tamanho da entrada são uma premissa, não uma decisão de
  produto fechada** (`src/lib/specification/limits.ts`): a especificação
  original não define números (ver PRD, OQ-003). Valores atuais — 10 MB
  por PDF, 200 a 100.000 caracteres de texto.
- **`@google/genai`** (SDK unificado atual da Google), não o pacote legado
  `@google/generative-ai`. Modelo padrão: `gemini-flash-latest` (alias
  estável mantido pela própria Google, em vez de fixar uma versão datada
  que pode ser descontinuada); configurável via `GEMINI_MODEL`.
- **Saída estruturada via JSON Schema nativo do Gemini**
  (`responseMimeType: "application/json"` + `responseJsonSchema`), gerado
  a partir dos schemas Zod com `z.toJSONSchema()` (nativo do Zod 4) — uma
  única fonte de verdade por artefato, sem duplicar a definição em dois
  formatos.
- **Dois schemas foram ajustados por incompatibilidade real, não
  teórica, com o Gemini** — confirmada inspecionando o JSON Schema gerado
  antes de usá-lo (não apenas supondo):
  - A EAP deixou de ser uma árvore recursiva (`z.lazy`) e passou a ter
    dois níveis fixos (entregável → subentregáveis). `z.lazy` gera
    `"$ref": "#"` no JSON Schema, e o `responseJsonSchema` do Gemini
    rejeita ou trata de forma inconsistente schemas autorreferentes.
  - `wipLimit` do Kanban deixou de ser `number | null` e passou a ser
    texto livre (ex.: `"3"` ou `"Sem limite — coluna de entrada"`).
    `nullable()` gera `"type": ["number", "null"]`, um type-array que o
    Gemini também não suporta de forma confiável.
- **Três Server Actions, não uma só** (`runExtractionStep`,
  `runStructuringStep`, `runConsolidationStep` em `src/lib/ai/actions.ts`)
  — permite que a UI mostre o progresso real de cada etapa (RF-032), em
  vez de progresso simulado por tempo, e cada fronteira revalida a entrada
  recebida de volta do cliente (RNF-001) antes de consumir a IA de novo.
- **Retry limitado e sanitizado** (`generate-structured.ts`): no máximo 2
  tentativas por etapa (RNF-029), erros classificados em
  indisponibilidade/timeout/resposta inválida. Indisponibilidade
  transitória (503, 429, 5xx, rede) espera 2–5s com jitter antes da nova
  tentativa (v1.0.2); timeout e resposta inválida repetem na hora. Pior
  caso por etapa: 125s, dentro do `maxDuration` de 150s. Nenhum log grava
  prompt, resposta do modelo ou a especificação do usuário — só a
  classificação do erro (RF-066).
- **EAP em dois níveis fixos, não uma árvore arbitrária** — decisão já
  tomada na Etapa 4 por incompatibilidade real com o schema JSON do
  Gemini (`$ref` recursivo), mas que também simplificou a Etapa 5: a
  "hierarquia visual" (RF-051) é uma grade de caixas (entregável →
  subentregáveis como chips dentro da caixa), sem precisar de uma
  biblioteca de diagramação para suportar profundidade arbitrária.
- **Quadro Kanban com dois layouts, não um só com CSS responsivo** — o
  componente (`kanban-result.tsx`) decide entre tabs (mobile, uma coluna
  por vez) e board horizontal (desktop) via lógica de componente, não só
  classes `sm:`/`hidden`/`flex`, porque a interação de navegação entre
  colunas no mobile (clique na tab) precisa de estado — não é só uma
  questão de qual elemento fica visível.
- **`Timeline` e `PriorityBadge` compartilhados** entre Scrum e
  Cascata/Kanban (`src/components/results/`) — cronograma de Sprints e
  cronograma de fases são estruturalmente a mesma coisa (sequência
  nomeada com dependências); prioridade de história e de item Kanban usam
  a mesma escala alta/média/baixa.
- **Kick-off como filminho de slides com scroll-snap nativo** — sem
  biblioteca de carrossel: `overflow-x-auto` + `scroll-snap-type` resolve
  a "estrutura de slides/cards" pedida (RF-051) com CSS puro.
- **Exportação em texto como Markdown, não `.txt`** — resolve a questão
  aberta do PRD (OQ-002) a favor de `.md`: o resultado tem hierarquia
  (seções, listas aninhadas) que Markdown representa de forma legível em
  qualquer editor de texto simples, sem exigir ferramenta adicional.
- **Exportação em PDF via impressão nativa do navegador** (`window.print()`
  + CSS de impressão), não uma biblioteca de geração de PDF — reaproveita
  o mesmo layout já validado na tela (inclusive o quadro Kanban e os
  slides do Kick-off, com `print:flex-wrap` para nunca cortar conteúdo no
  papel), sem reimplementar posicionamento de texto numa API de desenho.
- **Exportação em Excel (`.xlsx`) com `exceljs`**, não SheetJS/`xlsx` — a
  versão gratuita do SheetJS não suporta estilo de célula (cores, bordas),
  exigido pela identidade visual das planilhas; `exceljs` é MIT e cobre
  isso nativamente. Usa exclusivamente o resultado já em memória (mesma
  regra do `.md`); uma aba por artefato do framework, mais uma aba
  "Resumo" comum (RF-054), com cabeçalho estilizado, linhas zebradas,
  destaque de prioridade (alta/média/baixa, mesma paleta do
  `PriorityBadge`), filtro e painel congelado na primeira linha.
  `exceljs` é importado dinamicamente (só entra no bundle do cliente ao
  clicar em "Exportar Excel", mesmo padrão do `pdfjs-dist`), e pelo
  subcaminho explícito `exceljs/dist/exceljs.min.js` — o próprio build de
  navegador do pacote — para não depender implicitamente de qual build
  (Node ou navegador) cada bundler resolve por padrão.
- **Cada Server Action da geração revalida a sessão** (`requireUserId()`
  em `src/lib/ai/actions.ts`) — o `proxy.ts` só protege o carregamento de
  páginas; se a sessão expirar no meio do fluxo de geração, a próxima
  etapa não pode simplesmente continuar consumindo a IA (FE-10). O
  cliente trata esse caso redirecionando para `/login`, não como um erro
  inline qualquer.
- **`maxDuration = 150` em `src/app/app/new/page.tsx`** — Server Actions
  rodam como requisições independentes (confirmado na documentação do
  Next.js: cada ação é seu próprio POST), então o limite de duração da
  Vercel se aplica a cada uma das 3 etapas individualmente, nunca à soma
  — o pior caso real de uma etapa (60s × 2 tentativas + até 5s de espera, `AI_CONFIG`) é
  ~125s; 150s dá folga sem depender do padrão implícito da plataforma.
- **Cota de gerações por usuário, no Postgres (`src/lib/rate-limit/`)**,
  não em memória — a aplicação roda em múltiplas instâncias serverless
  na Vercel, que não compartilham memória entre si; a atomicidade do
  incremento vem de um único `UPDATE` condicional no Postgres (`ON
  CONFLICT ... WHERE count < limite`), não de um "ler e depois escrever"
  da aplicação. As 3 etapas (Extração/Estruturação/Consolidação) contam
  como **uma única geração**: um `generationId` gerado no navegador é
  cobrado da cota só na Etapa 1; as Etapas 2 e 3 apenas confirmam que o
  id pertence ao usuário e ainda está dentro da janela de validade —
  por isso a cota nunca bloqueia a continuação de uma geração já
  iniciada, mesmo esgotada por outras gerações nesse meio-tempo.
- **Rate limiting de login/cadastro por IP (e, no login, também por
  conta)**, com janela deslizante de tempo — nunca bloqueio permanente.
  Login conta só tentativas falhas (sucesso nunca penaliza); cadastro
  conta toda tentativa, já que o próprio ato de criar conta é o recurso a
  proteger. O e-mail nunca é gravado em texto puro nesses controles —
  vira hash SHA-256 antes de servir como chave.
- **Mensagem neutra no cadastro quando o e-mail já existe**, em vez de
  confirmar a existência da conta — e a verificação de existência roda em
  paralelo com o hashing da senha (que é descartado se o e-mail já
  existir), para que o tempo de resposta não vire, por si só, um oráculo
  de quais e-mails já têm conta.
- **IP do cliente lido de `x-forwarded-for`** (`src/lib/rate-limit/client-ip.ts`)
  — confiável mesmo contra um cliente malicioso: a Vercel documenta que
  sobrescreve esse cabeçalho na borda e não repassa IPs externos,
  justamente para impedir que o próprio cliente o falsifique.
- **`error.tsx` por segmento + `global-error.tsx`** — a área pública e a
  área autenticada têm boundaries de erro próprios (destino de "voltar"
  diferente); `global-error.tsx` é o único fallback que não pode depender
  do CSS global carregado pelo layout raiz (exigência do próprio Next.js),
  por isso usa estilo inline em vez de classes Tailwind.
- **Vitest, não Jest** — mais simples de configurar com Next.js/Turbopack
  (sem Babel, sem transformações manuais de TypeScript); os testes cobrem
  apenas funções puras e schemas (validação de entrada, hashing de senha,
  os 4 schemas de IA incluindo a garantia de que frameworks nunca se
  misturam — RN-006 —, e a geração de Markdown), sem jsdom nem testes de
  componentes React.

## Testes

```bash
npm run test          # roda a suíte uma vez
npm run test:watch    # modo watch
```

183 testes em 17 arquivos. Além do que já existia na v1.0 — descrito a
seguir —, a v1.1 adicionou: snapshots do contrato de IA (schemas,
instruções e configuração) dos 3 frameworks e do Híbrido, snapshots
"golden" das exportações (Markdown byte a byte e Excel com abas, valores e
estilos), testes de domínio do Híbrido (integridade e rastreabilidade),
das Server Actions com a IA simulada (feature flag, cota e revalidação)
e dos textos de apresentação com a flag ligada e desligada.
Atualizar um snapshot é uma decisão consciente, nunca rotina.

Da v1.0, cobrindo (spec §94): validação da entrada
(`specificationInputSchema`), hashing de senha, os 4 schemas da IA
(extração + os 3 frameworks + o envelope consolidado, incluindo a rejeição
de frameworks cruzados), a geração dos arquivos de exportação em
Markdown e Excel (estrutura das abas e dados reais, por framework) e os
controles de rate limiting (`src/lib/rate-limit/`) — cota de gerações,
concorrência e tentativas de autenticação.

Os testes de rate limiting são de integração, contra o Postgres real do
Neon (não um substituto em memória) — a própria garantia de atomicidade
sob concorrência só é comprovável contra o banco real. Exigem
`DATABASE_URL` configurada (lida de `.env` via `dotenv/config` em
`vitest.setup.ts`) e se auto-ignoram quando ausente; cada teste cria e
limpa só seus próprios dados, sem afetar usuários reais.

## Executando localmente

```bash
npm install          # também gera o Prisma Client (postinstall)
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

Scripts disponíveis:

```bash
npm run dev            # ambiente de desenvolvimento
npm run build           # build de produção
npm run start             # serve o build de produção
npm run lint               # ESLint
npm run typecheck          # verificação de tipos (tsc --noEmit)
npm run format              # formata com Prettier
npm run format:check        # verifica formatação sem alterar arquivos
npm run db:generate          # regenera o Prisma Client
npm run db:migrate             # aplica migrations em desenvolvimento
npm run db:deploy                # aplica migrations em produção
npm run db:studio                  # abre o Prisma Studio
npm run test                         # roda a suíte de testes uma vez
npm run test:watch                     # suíte de testes em modo watch
```

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e preencha:

| Variável | Para quê | Onde obter |
| --- | --- | --- |
| `DATABASE_URL` | Conexão poolada — usada pela aplicação em runtime | Painel do Neon → *Connect* → *Pooled connection* |
| `DIRECT_URL` | Conexão direta — usada só pelo Prisma CLI (migrations) | Painel do Neon → *Connect* → *Direct connection* |
| `AUTH_SECRET` | Assina/criptografa o cookie de sessão | `npx auth secret`, ou gere 32+ bytes aleatórios |
| `GEMINI_API_KEY` | Autentica as chamadas à IA (server-side apenas) | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |
| `GEMINI_MODEL` | Opcional — fixa um modelo específico | Padrão: `gemini-flash-latest` |
| `HYBRID_PLANNING_ENABLED` | Opcional — habilita o Planejamento Híbrido (v1.1) | Só `"true"` habilita; ausente = desligado |

Depois de configurar, crie a tabela `User` no Neon:

```bash
npm run db:migrate
```

## Deploy na Vercel

Esta seção documenta o procedimento de publicação — nenhum passo aqui foi
executado ainda; é um guia para quando o deploy for de fato realizado.

### Requisitos de ambiente

- **Node.js 22.x** (versão usada no desenvolvimento deste projeto —
  `node -v` → `v22.17.0`). A Vercel detecta a versão automaticamente a
  partir do projeto, mas pode ser fixada explicitamente em *Project
  Settings → General → Node.js Version* caso o padrão da conta seja
  outro.
- **Build Output:** Next.js 16 (App Router) com Turbopack — a Vercel
  reconhece o framework automaticamente a partir de `next.config.ts` e
  `package.json`; o comando de build já é `next build` (script `build`
  em `package.json`), sem necessidade de `vercel.json`.
- **Fluid Compute:** habilitado por padrão em projetos novos da Vercel —
  é o que garante que o limite de duração de 150s configurado em
  `src/app/app/new/page.tsx` (`maxDuration`) opere com folga tanto no
  plano Hobby quanto no Pro (ambos com 300s de padrão/máximo nesse
  cenário). Se o projeto tiver sido criado antes dessa mudança de
  plataforma, confirme em *Project Settings → Functions* que o Fluid
  Compute está ativo.

### Variáveis de ambiente necessárias

As mesmas variáveis da seção anterior, cadastradas em *Project
Settings → Environment Variables* no painel da Vercel — nenhuma delas
vem de um arquivo versionado (`.env*` está no `.gitignore`, exceto o
modelo `.env.example`, sem valores reais):

| Variável | Ambiente(s) | Observação |
| --- | --- | --- |
| `DATABASE_URL` | Production, Preview, Development | Connection string **poolada** do Neon (host termina em `-pooler`) |
| `DIRECT_URL` | Production, Preview, Development | Connection string **direta** do Neon — só para rodar migrations |
| `AUTH_SECRET` | Production, Preview, Development | Gere um valor **próprio para produção**, diferente do usado em desenvolvimento local (`npx auth secret`) |
| `GEMINI_API_KEY` | Production, Preview, Development | Chave de produção da API Gemini — considere uma chave dedicada, separada da usada em desenvolvimento, para poder revogar/monitorar uso isoladamente |
| `GEMINI_MODEL` | Opcional | Só se quiser fixar um modelo específico em vez do padrão (`gemini-flash-latest`) |
| `HYBRID_PLANNING_ENABLED` | Preview (homologação) | `true` habilita o Híbrido. **Não cadastrar em Production** até decisão de liberar; vale a partir do próximo deploy (a landing page lê no build) |

Nenhum valor real é citado aqui de propósito — preencha diretamente no
painel da Vercel, nunca em um arquivo do repositório.

### Neon PostgreSQL — banco de produção e migrations

1. Decida se o deploy de produção vai usar o **mesmo** projeto Neon já
   configurado em desenvolvimento ou um **banco de produção dedicado**
   (recomendado para isolar dados reais de testes) — no painel do Neon,
   um banco dedicado pode ser um novo *branch* do mesmo projeto ou um
   projeto Neon separado.
2. Copie as duas connection strings desse banco (*Connect* → *Pooled
   connection* para `DATABASE_URL`, *Direct connection* para
   `DIRECT_URL`) para as variáveis de ambiente da Vercel.
3. Aplique as migrations **nesse banco**, a partir da sua máquina (a
   Vercel não roda migrations automaticamente no build):
   ```bash
   DIRECT_URL="<connection string direta de produção>" npm run db:deploy
   ```
   `prisma migrate deploy` (script `db:deploy`) só aplica as migrations
   já existentes em `prisma/migrations/` — nunca gera uma nova a partir
   do schema, e é seguro rodar mais de uma vez (migrations já aplicadas
   são ignoradas).
4. Confirme com `npx prisma migrate status` (apontando para o mesmo
   `DIRECT_URL`) que o banco está em dia antes do primeiro acesso à
   aplicação em produção — login/cadastro falham se a tabela `users`
   ainda não existir.

### Autenticação em produção

- `AUTH_SECRET` **deve ser um valor novo**, gerado especificamente para
  produção — nunca reaproveite o valor de desenvolvimento.
- O `trustHost` do Auth.js (necessário para validar a origem das
  requisições) é detectado **automaticamente** nesse ambiente, sem
  configuração adicional — a Vercel define a variável `VERCEL=1` em
  todo deploy, e o Auth.js já verifica essa variável internamente.
- Nenhuma outra configuração de autenticação muda entre desenvolvimento
  e produção: a sessão continua em JWT (sem Adapter/tabelas extras), e
  `proxy.ts` continua protegendo `/app/*` da mesma forma.

### API Gemini em produção

- `GEMINI_API_KEY` é lida apenas no servidor (`src/lib/ai/client.ts`) —
  confirmado por inspeção do bundle de produção que ela nunca chega ao
  código enviado ao navegador.
- Sem alterações de código necessárias; apenas garanta que a chave
  cadastrada tenha cota/billing configurados no Google AI Studio para o
  volume esperado de uso — a cota diária de gerações por usuário
  (`src/lib/rate-limit/`) limita o consumo, mas não o elimina.

### Procedimento de build e publicação

1. Com o primeiro commit feito (próxima seção) e um repositório remoto
   no GitHub, importe o projeto no painel da Vercel (*Add New* →
   *Project* → selecione o repositório).
2. A Vercel detecta Next.js automaticamente; confirme o *Root Directory*
   (raiz do repositório) e cadastre as variáveis de ambiente da seção
   acima **antes** do primeiro deploy.
3. Dispare o deploy (automático ao importar, ou *Deploy* manual). O
   pipeline de build da Vercel roda `npm install` (que já executa
   `prisma generate` via `postinstall`) e depois `npm run build`.
4. Após o deploy ficar com status *Ready*, confirme manualmente que as
   migrations já foram aplicadas no banco de produção (seção Neon acima)
   antes de testar login/cadastro.
5. Valide o fluxo completo em produção: cadastro/login, uma geração em
   cada um dos 3 frameworks, e as 3 exportações (texto, PDF, Excel).

### Domínio `planejador.orizonprojects.com.br` (configuração posterior)

Não execute esta etapa agora — é referência para quando o deploy já
estiver estável:

1. No painel da Vercel, dentro do projeto: *Settings → Domains → Add* e
   digite `planejador.orizonprojects.com.br`.
2. A Vercel indica o registro DNS exato a criar no provedor onde o
   domínio `orizonprojects.com.br` está hospedado — normalmente um
   registro `CNAME` (para um subdomínio como este) apontando para
   `cname.vercel-dns.com`, mas siga o valor exibido na tela da Vercel no
   momento, pois pode variar.
3. Após criar o registro no provedor de DNS, aguarde a propagação (de
   minutos a algumas horas) — a própria tela de *Domains* da Vercel
   mostra o status da verificação e emite automaticamente o certificado
   HTTPS quando o DNS resolver corretamente.
4. Nenhuma variável de ambiente ou configuração de autenticação precisa
   mudar por causa do domínio — o `trustHost` automático (seção acima)
   já cobre qualquer domínio que a Vercel sirva para o projeto.

## Estrutura do projeto

```text
src/
  app/
    api/auth/[...nextauth]/route.ts   # endpoint do Auth.js
    app/                              # área autenticada
      page.tsx                        # dashboard
      new/                             # wizard de novo planejamento
      result/                          # apresentação + exportação do resultado
      error.tsx                        # error boundary da área autenticada
    login/ register/                 # páginas públicas de autenticação
    privacy/                          # página pública de privacidade
    error.tsx                         # error boundary da área pública
  global-error.tsx                    # fallback de último recurso (layout raiz)
  auth.config.ts                      # config "leve" (sem Prisma) — usada por proxy.ts
  auth.ts                             # config completa (Credentials + Prisma)
  proxy.ts                            # guard de rotas de /app/* (substitui middleware.ts no Next 16)
  components/
    ui/                 # componentes base (shadcn/ui)
    layout/             # cabeçalho/rodapé público e autenticado, auth-shell
    marketing/          # seções da landing page
    results/            # Timeline e PriorityBadge, compartilhados entre frameworks
  lib/
    ai/                 # os 3 agentes, prompts, schemas Zod, cliente Gemini (inclui o Híbrido)
    auth/               # hashing de senha, schemas Zod, server actions
    db/                 # cliente Prisma (singleton + driver adapter)
    export/             # geração dos arquivos de exportação (Markdown, Excel)
    pdf/                # extração de texto de PDF no navegador
    rate-limit/          # cota de gerações e proteção de login/cadastro
    result/             # persistência do resultado em sessionStorage
    specification/      # limites e schema de validação da entrada
    hybrid/             # Planejamento Híbrido: catálogo, feature flag, rastreabilidade
    frameworks.ts       # catálogo dos 3 frameworks suportados
    planning-frameworks.ts  # frameworks + variantes do Híbrido, para o assistente
  generated/prisma/     # Prisma Client gerado (não versionado)

prisma/
  schema.prisma         # modelo de dados (hoje: só User)

docs/
  PRD.md                # Product Requirements Document
  v1.1/                 # Planejamento Híbrido: arquitetura, PoC, validação e homologação
```

## Privacidade

A especificação enviada é tratada como potencialmente confidencial: o
arquivo original e o texto integral não são armazenados permanentemente, e
nenhuma chamada à IA ocorre fora do backend. O banco de dados armazena
apenas o necessário para autenticação (email + hash da senha). Detalhes em
[`docs/PRD.md`](docs/PRD.md) (§14) e em [`/privacy`](src/app/privacy/page.tsx).

## Melhorias futuras

Itens avaliados e deliberadamente **fora** do escopo da v1.0.0 — não
implementados, apenas registrados para priorização futura:

- **Planejamento Híbrido — evolução pós-v1.1** — implementado na v1.1
  (ver Etapa 10). Candidatos: otimizar ou dispensar a consolidação no
  Híbrido (sem efeito estrutural observado, 21–41 s por geração), Kick-off
  do Híbrido e revisão da relação item ↔ EAP com especificações maiores
  (ver [`docs/v1.1/README.md`](docs/v1.1/README.md)).
- **Recuperação de senha por e-mail** — depende de integrar um serviço
  transacional de e-mail (PRD, OQ-001), ainda não avaliado.
- **Região das Vercel Functions em São Paulo** — hoje em `iad1`
  (Virgínia, EUA); o banco de produção já está em São Paulo. Mudar a
  região da function para `gru1` reduziria a latência de banco, mas a
  tentativa de configurar isso pelo painel não persistiu em testes
  anteriores — requer nova tentativa ou configuração manual.
- **Ativar a Content-Security-Policy em modo bloqueante** — desde a
  v1.0.1, uma CSP sem nonce roda em `Content-Security-Policy-Report-Only`
  (validada contra os 3 frameworks, exportações e autenticação, sem
  violações). Falta um ciclo de validação em ambiente de preview antes de
  trocar para o header bloqueante (`Content-Security-Policy`).
- **Navegação por setas nos widgets `role="radio"`/`role="tab"`
  customizados** (seleção de framework em `/app/new` e o seletor
  "Colar texto/Enviar PDF") — hoje operáveis via Tab individual por item
  + Enter/Space, mas sem o roving tabindex + setas do padrão WAI-ARIA
  APG. Não é uma falha de WCAG 2.1 AA, mas diverge do padrão esperado;
  implementar é mudança de comportamento funcional, fora do escopo de
  correção "simples e segura" da v1.0.1.
- **Testes de carga** — não realizados em nenhuma fase do projeto, e
  deliberadamente não executados contra produção.
- **Vulnerabilidades `high` pré-existentes em dependências de
  desenvolvimento do Prisma** (`deepmerge-ts`, `mysql2`, via
  devDependency `prisma`) — presentes desde a v1.0.0, não afetam o
  runtime de produção (não são carregadas no bundle), e a correção
  automática exigiria downgrade do Prisma. Fora do escopo desta
  manutenção; decisão de correção fica para avaliação futura separada.
- **`GEMINI_API_KEY` dedicada para Preview** — desde o isolamento de
  Production/Preview (v1.0.1), `DATABASE_URL`/`DIRECT_URL`/`AUTH_SECRET`
  já têm valores exclusivos por ambiente, mas `GEMINI_API_KEY` continua
  compartilhada entre os dois. Risco residual aceito deliberadamente por
  ora: a chave só é lida no servidor (`src/lib/ai/client.ts`, nunca
  importada por código client-side, sem prefixo `NEXT_PUBLIC_`) e todo
  consumo — em Production ou Preview — já passa pela cota diária por
  usuário (`GENERATION_QUOTA.dailyLimit`, hoje 10 gerações/dia) e pelos
  limites de cadastro/login (`AUTH_RATE_LIMIT`), além de Preview exigir
  login na Vercel (Deployment Protection) para ser sequer acessado — não
  há caminho para consumo descontrolado mesmo com a chave compartilhada.
  Decisão reafirmada considerando também o volume atual de uso, ainda
  baixo — **gatilho para revisitar**: se o volume de gerações crescer o
  suficiente para dificultar distinguir consumo de teste do de produção
  no painel do Google AI Studio, separar a chave. Quando priorizado, o
  ideal é usar **projetos distintos no Google AI Studio/Cloud** (não só
  chaves diferentes no mesmo projeto), para que a cota de cada ambiente
  seja monitorada e limitada de forma realmente independente.

## Limitações conhecidas

Atualizado na homologação da v1.0.0 e na manutenção v1.0.1 (publicada em
produção, tag `v1.0.1`) — reflete o que foi de fato validado, não apenas
revisado por código:

- **Testado de ponta a ponta em produção real**: cadastro, login,
  logout, proteção de rotas, geração nos 3 frameworks com chamadas reais
  à API Gemini, e exportação — tudo contra o banco Neon de produção e no
  domínio oficial, não apenas em ambiente local ou simulado.
- **Rate limiting ativo e verificado em produção** — cota diária de
  gerações por usuário e proteção contra tentativas excessivas de
  login/cadastro, ambos persistidos no Postgres (não em memória, correto
  para múltiplas instâncias serverless da Vercel). Verificado
  diretamente no banco de produção após uma geração real: exatamente 1
  unidade de cota debitada por geração completa.
- **Responsividade**: validada nas larguras de desktop e tablet comuns
  usadas ao longo dos testes funcionais; **não houve uma passagem
  dedicada pelos breakpoints específicos do PRD §95** (~375 px, ~430 px)
  em dispositivo ou emulação de tela realmente pequena — o CSS
  responsivo existe e foi usado nos testes, mas essa cobertura específica
  continua pendente.
- **Recuperação de senha por e-mail não foi implementada** — ver
  "Melhorias futuras".
- **v1.1 (Planejamento Híbrido)**: validado com a IA real em especificações
  pequena e média (4 gerações); a especificação grande e a homologação
  manual no Preview estão pendentes — ver
  [`docs/v1.1/homologacao.md`](docs/v1.1/homologacao.md).
- **Nenhum teste de carga foi executado** — ver "Melhorias futuras".
  Auditoria de acessibilidade automatizada (Lighthouse, 4 páginas
  públicas, 100/100) e navegação por teclado nos fluxos principais
  (login, cadastro, assistente de criação, resultado) **foram**
  validadas na branch `maint/v1.0.1`; auditoria com leitor de tela real
  segue pendente. Uma auditoria de segurança **foi** realizada
  (autenticação, variáveis de ambiente, rate limiting, exposição de
  credenciais) — não é mais uma lacuna.
- **A vulnerabilidade moderada transitiva `exceljs` → `uuid`** foi
  corrigida na branch `maint/v1.0.1` via `overrides`
  (`uuid@^11.1.1`), validada com exportação Excel de ponta a ponta.
  Permanecem 13 vulnerabilidades `high` pré-existentes em dependências
  de desenvolvimento do Prisma (`deepmerge-ts`, `mysql2`) — ver
  "Melhorias futuras".
