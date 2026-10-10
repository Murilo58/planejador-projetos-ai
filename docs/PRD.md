# PRD — Planejador de Projetos AI

| Campo | Valor |
|---|---|
| Documento | Product Requirements Document (PRD) |
| Produto | Planejador de Projetos AI |
| Versão | 1.0 |
| Data | 2026-10-09 |
| Fase | Fase 0 — Documentação e Arquitetura |
| Status | Para revisão e validação do produto |
| Fonte | `Planejador de Projetos AI — Especificação Completa do Produto.md` |
| Escopo deste documento | Definição de produto. Não define arquitetura, bibliotecas ou implementação. |

> Este PRD é derivado integralmente da especificação original e não introduz funcionalidades novas.
> Decisões técnicas detalhadas serão tratadas em `ARCHITECTURE.md`; fluxo detalhado em `USER_FLOW.md`;
> identidade visual em `DESIGN_SYSTEM.md`; agentes em `AI_AGENTS.md`; privacidade operacional em `DATA_PRIVACY.md`.

---

## 1. Visão do Produto

### 1.1 O que é

O **Planejador de Projetos AI** é uma aplicação web que recebe uma **especificação técnica de projeto** (em PDF ou texto) e utiliza Inteligência Artificial para gerar os **artefatos iniciais de gestão de projetos** correspondentes ao **framework escolhido manualmente pelo usuário**.

Frameworks suportados no MVP:

- **Scrum**
- **Kanban**
- **Cascata**

O produto deve ter aparência e experiência de **produto SaaS comercial premium** — não de protótipo, demonstração técnica ou painel administrativo genérico — e deve funcionar adequadamente em desktop, notebook, tablet e smartphone.

### 1.2 Qual problema resolve

Profissionais de projetos recebem documentação técnica (especificações, escopos, levantamentos) e precisam convertê-la manualmente em artefatos de gestão: histórias de usuário, backlog, quadro Kanban, TAP, EAP, cronograma macro, material de Kick-off. Esse trabalho de leitura, interpretação e estruturação é repetitivo, demorado e produz resultados inconsistentes de pessoa para pessoa e de projeto para projeto.

O Planejador de Projetos AI reduz o esforço necessário para transformar documentação técnica em elementos utilizáveis para **planejamento, organização e Kick-off**, entregando um ponto de partida estruturado em poucos minutos.

### 1.3 Proposta de valor (resumo)

**Transforme especificações técnicas em artefatos estruturados de gestão de projetos com Inteligência Artificial.**

O produto entrega velocidade na partida do projeto, estrutura consistente aderente ao framework escolhido e tratamento responsável da especificação enviada, que não é armazenada permanentemente.

### 1.4 Como a IA participa da solução

A IA atua **exclusivamente como apoio à estruturação**, dentro de um fluxo síncrono e linear orquestrado pela própria aplicação:

```
Entrada → Extração → Estruturação → Consolidação → Resultado
```

Três agentes especializados, implementados como módulos internos da aplicação (não microsserviços, não agentes autônomos em execução contínua):

1. **Extração** — interpreta a especificação e identifica apenas informações presentes ou claramente inferíveis do conteúdo fornecido.
2. **Estruturação** — converte os dados extraídos em artefatos do framework selecionado.
3. **Consolidação** — valida, consolida e organiza o pacote produzido.

A IA **não** decide o framework, **não** inventa informações e **não** adiciona artefatos além dos definidos para cada framework.

### 1.5 Responsabilidade do usuário na escolha do framework

A escolha entre Scrum, Kanban e Cascata é uma **decisão de gestão, não de IA**, e permanece **integralmente com o usuário**:

- A seleção é **obrigatória** e **explícita**.
- Nenhuma opção vem pré-selecionada com base em interpretação da IA.
- A aplicação apenas informa, de forma objetiva, o que cada framework gera, para apoiar a decisão.
- O resultado gerado é um **ponto de partida que deve ser revisado** pelo responsável pelo projeto. O produto não substitui a avaliação de um gerente de projetos.

---

## 2. Problema

Os problemas que o produto se propõe a resolver, conforme a especificação:

### 2.1 Esforço manual para transformar especificação técnica em artefatos de gestão

Converter um documento técnico em histórias de usuário com critérios de aceite, backlog priorizado, quadro Kanban com limites de WIP, ou TAP/EAP/cronograma, é um trabalho manual de leitura, decomposição e redação. Esse esforço se repete integralmente em cada novo projeto.

### 2.2 Dificuldade de estruturar rapidamente o início de projetos

O início do projeto concentra a maior pressão por organização e a menor disponibilidade de material pronto. Montar o primeiro backlog, o primeiro quadro ou o material de Kick-off "do zero" atrasa a partida do projeto.

### 2.3 Inconsistência na criação inicial dos artefatos

Sem um ponto de partida padronizado, o formato e a profundidade dos artefatos variam conforme quem os produz: histórias sem critérios de aceite verificáveis, EAP orientada a tarefas em vez de entregáveis, backlog sem justificativa de priorização, limites de WIP sem racional.

### 2.4 Tempo gasto por profissionais interpretando documentação técnica

Parte relevante do tempo de gerentes de projeto, Product Owners e analistas é consumida apenas lendo e reorganizando documentação técnica, antes de qualquer trabalho de gestão propriamente dito.

### 2.5 Risco de tratamento inadequado de documentos sensíveis

Especificações técnicas frequentemente são confidenciais. Ferramentas que armazenam esses documentos criam resistência legítima ao uso. O produto trata a especificação como **potencialmente confidencial** e a processa sem persistência permanente.

> **Nota:** esta seção não apresenta dados estatísticos, pesquisas ou benchmarks, por não existirem na especificação fornecida. Qualquer quantificação do problema deve ser levantada posteriormente (ver §16 e §20).

---

## 3. Público-Alvo

O público-alvo é composto por **profissionais de projetos, tecnologia e produto** que recebem especificações técnicas e precisam convertê-las em planejamento estruturado. Os perfis abaixo são descritos por **função, problema e necessidade**, sem criação de personas fictícias.

### 3.1 Gerente de Projetos

- **Problema:** precisa abrir projetos rapidamente com TAP, EAP, cronograma macro e Kick-off, muitas vezes a partir de documentação técnica recebida de terceiros.
- **Necessidade:** gerar o pacote inicial de abertura em formato aderente a boas práticas, para revisar e ajustar em vez de escrever do zero.
- **Framework típico:** Cascata (também Scrum em contextos híbridos).

### 3.2 Especialista em Projetos

- **Problema:** atua em múltiplos projetos simultâneos, com pouco tempo para estruturar cada início.
- **Necessidade:** acelerar a estruturação inicial mantendo consistência entre projetos diferentes.

### 3.3 PMO

- **Problema:** convive com artefatos iniciais heterogêneos entre equipes e precisa de padronização.
- **Necessidade:** um ponto de partida consistente e repetível por framework, que reduza retrabalho de normalização.

### 3.4 Product Owner

- **Problema:** recebe especificações técnicas e precisa transformá-las em backlog com histórias e critérios de aceite.
- **Necessidade:** primeira versão do backlog priorizado com justificativa e sugestão de primeira Sprint, para refinar com o time.
- **Framework típico:** Scrum.

### 3.5 Scrum Master

- **Problema:** apoia times na organização do fluxo de trabalho e na preparação das primeiras Sprints.
- **Necessidade:** material inicial de Sprint e de quadro para conduzir refinamento e planejamento com o time.
- **Framework típico:** Scrum e Kanban.

### 3.6 Analista de Negócio

- **Problema:** faz a ponte entre documentação técnica e requisitos de gestão.
- **Necessidade:** extrair de forma estruturada requisitos, entregas, premissas, restrições e dependências já presentes no documento.

### 3.7 Líder de Tecnologia

- **Problema:** precisa organizar o início de um projeto técnico sem dispor de estrutura formal de gestão.
- **Necessidade:** obter rapidamente um planejamento legível e apresentável a partir da especificação técnica que já possui.
- **Framework típico:** Kanban (fluxo contínuo) ou Scrum.

### 3.8 Características comuns ao público

- Trabalha com documentos técnicos, frequentemente confidenciais.
- Conhece ao menos um dos três frameworks e sabe qual deseja utilizar.
- Valoriza velocidade, mas **revisa** o que será usado no projeto real.
- Acessa a ferramenta tanto em desktop (trabalho de estruturação) quanto em dispositivos móveis (consulta e revisão).

---

## 4. Proposta de Valor

### 4.1 Velocidade

Da especificação ao pacote de artefatos em um único fluxo guiado, sem necessidade de configuração prévia de projeto, templates ou cadastros intermediários.

### 4.2 Estruturação

A saída não é texto corrido: é um conjunto de artefatos nomeados e organizados conforme o framework escolhido — histórias com critérios de aceite, backlog priorizado, quadro com colunas e limites de WIP, TAP, EAP, cronograma macro, material de Kick-off.

### 4.3 Consistência

Contratos estruturados por etapa e por framework, somados a uma etapa dedicada de consolidação, garantem que o resultado tenha sempre a mesma anatomia, com os artefatos obrigatórios presentes e nenhum artefato não solicitado.

### 4.4 Apoio por IA, com fronteiras explícitas

A IA interpreta e estrutura; não decide método, não inventa informação e não substitui o julgamento do profissional. Quando falta informação, o produto **declara a ausência** em vez de preenchê-la.

### 4.5 Privacidade

A especificação é tratada como potencialmente confidencial: o PDF original não é armazenado, o texto integral não é persistido, os documentos gerados não são mantidos permanentemente no MVP e os logs não contêm o conteúdo enviado. Isso é comunicado na interface, não apenas na política.

### 4.6 Geração orientada ao framework escolhido

Cada framework produz exclusivamente o seu conjunto de artefatos, com a terminologia e a lógica próprias do método — e não um resultado genérico adaptado superficialmente.

### 4.7 Acabamento de produto real

Interface premium, responsiva e acessível, pensada para que um profissional se sinta confortável enviando uma especificação técnica real por meio dela.

---

## 5. Escopo do MVP

Tudo listado nesta seção faz parte do MVP.

### 5.1 Área pública

| Item | Descrição |
|---|---|
| **Landing page** (`/`) | Hero com nome, proposta de valor e CTA; seção "Como funciona" (**Envie → Escolha → Gere**); seção de frameworks (Scrum / Kanban / Cascata); seção de privacidade; CTA final (criar conta / entrar). Landing simples, não site comercial extenso. |
| **Cadastro** (`/register`) | Criação de conta com email e senha. |
| **Login** (`/login`) | Autenticação com email e senha, em composição visual premium — não apenas "logo + formulário branco centralizado". |
| **Privacidade** (`/privacy`) | Página explicando finalidade do processamento, tratamento temporário da especificação, uso de API de IA, ausência de armazenamento permanente da especificação, armazenamento de dados de autenticação e cuidados recomendados ao usuário. |

### 5.2 Autenticação

- Criar conta.
- Login com email e senha.
- Sessão autenticada.
- Logout.
- Proteção de rotas privadas: usuário não autenticado é enviado para `/login`.
- Estrutura compatível com futura recuperação de senha por email; inclusão no MVP condicionada (ver §6.9 e §20).

### 5.3 Área autenticada

| Item | Descrição |
|---|---|
| **Dashboard** (`/app`) | Ação principal: **Criar novo planejamento**. Comunica o objetivo do produto, apresenta visualmente Scrum / Kanban / Cascata e a seção "Como funciona" (**Envie → Escolha → Gere**). Sem gráficos ou métricas inventadas, já que não há histórico no MVP, e sem dashboard vazio com apenas um botão. |
| **Nova análise / novo planejamento** (`/app/new`) | Fluxo em etapas: Especificação → Framework → Confirmação → Geração. |
| **Resultado** (`/app/result`) | Resultado da sessão atual, com representação visual adequada por artefato. Sem ID persistente. |
| **Ajuda** (`/app/help`) | Guia rápido integrado e FAQ. |

### 5.4 Entrada da especificação

- **Entrada por PDF:** upload de PDF com texto selecionável; extração da camada textual preferencialmente no navegador; apenas o texto é enviado ao backend; o PDF original não é armazenado e preferencialmente não trafega pelo backend.
- **Entrada por texto:** campo amplo para colar conteúdo técnico diretamente.
- **Exclusividade:** o usuário utiliza **PDF OU texto**; as duas formas não são obrigatórias simultaneamente.
- **Validações:** formato, tamanho, quantidade de texto, texto vazio e arquivo inválido; cálculo do tamanho aproximado da entrada antes de chamar a IA, impedindo requisições claramente incompatíveis com os limites definidos pela aplicação.
- **Mensagem amigável** quando não for possível extrair texto do PDF.
- **Aviso de privacidade** exibido próximo à entrada do documento, com link "Saiba mais" para `/privacy`.

### 5.5 Seleção do framework

- Seleção **obrigatória** entre **Scrum**, **Kanban** e **Cascata**.
- Nenhuma opção pré-selecionada por interpretação da IA.
- Texto de ajuda por framework, via descrição breve ou tooltip (conteúdo em §11.4).

### 5.6 Processamento por agentes

- Pipeline interno síncrono e linear: **Extração → Estruturação → Consolidação**.
- Orquestração dentro da própria aplicação, sem orquestradores externos.
- Saídas intermediárias e finais validadas contra contratos estruturados independentes por etapa e por framework.
- Recuperação controlada e limitada quando a resposta não atender ao contrato, sem loops.
- Experiência de progresso visível ao usuário: **Interpretando especificação → Estruturando planejamento → Validando artefatos**.

### 5.7 Resultado estruturado

- Visualização por artefato, com componentes próprios — não JSON bruto, não bloco único de Markdown, não texto gigante, não cards todos iguais.
- **Scrum:** cards de histórias, badges de prioridade, critérios de aceite expansíveis, backlog visual, bloco específico para a Sprint sugerida e visão macro do cronograma.
- **Kanban:** quadro visual; em desktop, colunas horizontais quando houver espaço; em mobile, seções, tabs, accordion ou navegação horizontal controlada, evitando scroll horizontal interminável.
- **Cascata:** TAP como documento estruturado, EAP como hierarquia visual, cronograma como timeline ou estrutura equivalente, Kick-off em formato de cards/slides.
- Indicação explícita de ausência de informação: **"Não identificado na especificação."**
- Permanência temporária do resultado durante a sessão, permitindo navegação entre seções, visualização, exportação e retorno dentro da sessão atual.

### 5.8 Exportação

- **Exportação para PDF:** PDF profissional contendo identificação do framework, título, data de geração, artefatos e hierarquia visual adequada.
- **Exportação para texto:** arquivo legível, em `.txt` ou `.md` (formato final a decidir — ver §20).
- A exportação utiliza o resultado já processado: **sem nova chamada à IA** e **sem persistir conteúdo no banco** apenas para possibilitar download.
- As exportações não contêm prompts, nomes internos de agentes nem informações técnicas da API.

### 5.9 Responsividade

- Experiência completa em smartphone, tablet, notebook e desktop.
- Nenhuma funcionalidade crítica dependente exclusivamente de desktop.
- Validação visual nos tamanhos de referência: aproximadamente 375 px, 430 px, 768 px, 1366 px e 1440 px ou superior.

### 5.10 Ajuda

- Guia rápido em `/app/help` com os cinco passos: Envie a especificação → Escolha o framework → Gere o planejamento → **Revise** → Exporte.
- Ajuda contextual pontual (por exemplo: "O que é TAP?", "O que é EAP?", "O que significa WIP?", "O que será gerado no Scrum?"), sem poluição visual.
- FAQ inicial: armazenamento do PDF, escolha do framework pelo usuário, PDF escaneado, não substituição do gerente de projetos, exportação.
- Não há manual extenso tradicional no MVP.

### 5.11 Privacidade

- Especificação tratada como potencialmente confidencial.
- Não armazenar: PDF original, arquivo enviado, texto integral da especificação, prompts contendo especificações completas, respostas contendo a especificação original em logs, documentos gerados de forma permanente no MVP.
- Banco de dados limitado ao necessário para autenticação e operação básica; o banco não funciona como repositório dos projetos enviados.
- Resultado mantido temporariamente apenas no navegador, com preferência por `sessionStorage` em vez de `localStorage`, descartável ao encerrar a sessão ou a aba.
- Chamadas à API de IA exclusivamente server-side; logs sanitizados.

### 5.12 Segurança e qualidade embutidas no MVP

- Validação de entrada, autenticação, autorização de rotas, sessões seguras, secrets server-side, proteção da API, sanitização de entradas, rate limiting preparado, headers apropriados e tratamento seguro de erros.
- Tratamento explícito dos estados de erro (§7.3 e RF-067 a RF-069).
- Acessibilidade conforme boas práticas (§9 e §12).

---

## 6. Fora do Escopo

Os itens abaixo **não** pertencem ao MVP. Fonte: especificação original (seções 6, 16, 101 e correlatas). Podem compor roadmap futuro (§19).

### 6.1 Integrações e automação externa

- n8n, Make, Zapier ou qualquer orquestrador externo.
- Jira, Trello, Azure DevOps, Monday, ClickUp.
- Google Drive.
- Geração automática de tarefas em ferramentas externas.

### 6.2 Infraestrutura

- VPS: frontend em VPS, PostgreSQL próprio, API própria independente, workers próprios, n8n hospedado.

### 6.3 Processamento de documentos

- OCR.
- PDFs exclusivamente escaneados.
- Reconhecimento de imagens.
- Manuscritos.

### 6.4 Persistência e histórico

- Histórico permanente de planejamentos.
- Tabelas de projetos, documentos, especificações ou artefatos gerados.
- Repositório dos projetos enviados.
- ID persistente de resultado.

### 6.5 Monetização e multiusuário

- Pagamento, assinatura e planos.
- Organizações e workspaces.
- Colaboração e comentários.

### 6.6 Administração e operação

- Painel ou dashboard administrativo.
- Gestão financeira.
- Notificações.

### 6.7 Saídas e plataformas

- Exportação para PPTX.
- Apresentação gráfica pronta de Kick-off; no MVP produz-se conteúdo estruturado para apresentação, não arte de slides.
- Aplicativo mobile nativo.

### 6.8 Artefatos de gestão não listados

- Qualquer artefato além dos definidos por framework em §11 (por exemplo: matriz de riscos do projeto do usuário, matriz de comunicação, plano de qualidade, plano de recursos, orçamento, curva S, análise aprofundada de stakeholders).

### 6.9 Condicional

- **Recuperação de senha por email:** entra no MVP somente se a implementação for simples e não gerar dependência excessiva. Caso exija contratação ou configuração adicional de serviço transacional, deve ser documentada e implementada em fase imediatamente posterior (ver §20).

---

## 7. Fluxo Principal do Usuário

### 7.1 Fluxo principal

```
Landing Page (/)
      |
Cadastro (/register) ou Login (/login)
      |
Dashboard (/app)
      |
Novo Planejamento (/app/new)
      |
Etapa 1 - Especificacao: PDF ou Texto
      |
Etapa 2 - Selecao do Framework: Scrum | Kanban | Cascata
      |
Etapa 3 - Confirmacao da entrada
      |
Etapa 4 - Geracao
          Interpretando especificacao  (Extracao)
          Estruturando planejamento    (Estruturacao)
          Validando artefatos          (Consolidacao)
      |
Resultado (/app/result)
      |
Exportacao (PDF ou Texto)
```

**Descrição das etapas:**

1. **Landing Page** — o visitante entende o que o produto faz, como funciona, quais frameworks são suportados e como a privacidade é tratada; é convidado a criar conta ou entrar.
2. **Cadastro / Login** — cria conta ou autentica com email e senha; passa a ter sessão autenticada.
3. **Dashboard** — encontra como ação principal **Criar novo planejamento**, além da comunicação do objetivo, dos frameworks suportados e do "Envie → Escolha → Gere".
4. **Novo Planejamento — Especificação** — envia PDF, cujo texto é extraído no navegador, **ou** cola o texto; vê o aviso de privacidade; a entrada é validada.
5. **Novo Planejamento — Framework** — escolhe obrigatoriamente Scrum, Kanban ou Cascata, apoiado pelo texto explicativo de cada um. Nada vem pré-selecionado.
6. **Confirmação** — revisa o que será processado (origem da entrada, volume aproximado e framework selecionado) antes de iniciar o processamento.
7. **Geração** — acompanha o progresso em três etapas nomeadas, sem exposição de prompt, raciocínio interno, logs técnicos ou detalhes da API de IA.
8. **Resultado** — navega pelos artefatos do framework escolhido, com visualização adequada a cada artefato e marcação clara de informações ausentes.
9. **Exportação** — exporta para PDF ou texto, a partir do resultado já processado.

### 7.2 Fluxos alternativos

| # | Situação | Comportamento esperado |
|---|---|---|
| FA-01 | Usuário já possui conta e acessa a landing | CTA leva a `/login`; após autenticar, segue para `/app`. |
| FA-02 | Usuário não autenticado acessa rota privada (`/app`, `/app/new`, `/app/result`, `/app/help`) | Redirecionado para `/login`. |
| FA-03 | Usuário opta por texto em vez de PDF | A entrada por texto é suficiente; nenhum upload é exigido. |
| FA-04 | Usuário anexou PDF e decide colar texto, ou o contrário | Pode alternar a forma de entrada; vale a entrada efetivamente selecionada — PDF **ou** texto, nunca ambas. |
| FA-05 | Usuário quer trocar o framework antes de gerar | Pode voltar à etapa de framework e alterar a escolha; a geração usa a última seleção confirmada. |
| FA-06 | Usuário quer corrigir a entrada na etapa de confirmação | Pode retornar à etapa de especificação sem perder a seleção de framework. |
| FA-07 | Usuário navega entre seções do resultado e retorna | O resultado permanece disponível durante a sessão atual, sem reprocessamento e sem nova chamada à IA. |
| FA-08 | Usuário exporta nos dois formatos | Ambas as exportações usam o mesmo resultado já processado. |
| FA-09 | Usuário quer gerar outro planejamento | Inicia novo fluxo em `/app/new`; não há histórico do planejamento anterior no MVP. |
| FA-10 | Usuário quer entender um termo (TAP, EAP, WIP) | Ajuda contextual no ponto de uso e guia completo em `/app/help`. |
| FA-11 | Usuário quer entender o tratamento do documento | Aviso de privacidade junto à entrada, com link "Saiba mais" para `/privacy`. |
| FA-12 | A especificação não contém determinada informação | O artefato indica **"Não identificado na especificação."** em vez de preencher com conteúdo inventado. |
| FA-13 | A especificação não contém datas | Os cronogramas apresentam sequência lógica e dependências relevantes, sem criar datas ou durações fictícias. |
| FA-14 | Usuário faz logout | Sessão encerrada; os dados temporários do resultado deixam de estar disponíveis. |

### 7.3 Fluxos de erro

| # | Erro | Comportamento esperado |
|---|---|---|
| FE-01 | Arquivo inválido: não PDF ou corrompido | Mensagem clara de formato não suportado; o usuário permanece na etapa de entrada, com a opção de texto disponível. |
| FE-02 | PDF sem camada textual (escaneado ou imagem) | Mensagem amigável: *"Não foi possível identificar texto neste PDF. Tente utilizar um PDF com texto selecionável ou cole o conteúdo diretamente no campo de especificação."* |
| FE-03 | Entrada vazia ou texto insuficiente | Impedir o avanço, indicando o que falta. |
| FE-04 | Documento muito grande, acima dos limites da aplicação | Bloquear antes de qualquer chamada à IA, informando o limite e orientando a reduzir ou dividir o conteúdo. |
| FE-05 | Framework não selecionado | Impedir o avanço, sinalizando que a escolha é obrigatória; nunca selecionar automaticamente. |
| FE-06 | Serviço de IA indisponível | Mensagem compreensível de indisponibilidade temporária, com possibilidade de nova tentativa; entrada preservada na sessão quando possível. |
| FE-07 | Timeout durante a geração | Informar que o processamento excedeu o tempo esperado e permitir nova tentativa; não deixar a interface presa em estado de carregamento indefinido. |
| FE-08 | Resposta inválida ou falha de validação de contrato | Tentar recuperação controlada com número limitado de tentativas, sem loops; se não for possível recuperar, mensagem amigável de falha na geração e registro sanitizado do erro. |
| FE-09 | Resultado parcialmente incompleto após consolidação | Apresentar o que foi validado e sinalizar explicitamente o que não pôde ser produzido, sem completar com conteúdo inventado. |
| FE-10 | Sessão expirada durante o fluxo | Redirecionar para `/login` com mensagem explicativa; não exibir conteúdo privado sem sessão válida. |
| FE-11 | Erro de rede | Mensagem de falha de conexão, com possibilidade de nova tentativa. |
| FE-12 | Falha de exportação | Mensagem de falha específica da exportação, mantendo o resultado visível na tela; a nova tentativa não deve reprocessar com IA. |
| FE-13 | Acesso a `/app/result` sem resultado na sessão | Estado vazio orientando o usuário a iniciar um novo planejamento em `/app/new`. |
| FE-14 | Credenciais inválidas no login, ou email já cadastrado no registro | Mensagens de erro claras e acessíveis, sem expor detalhes desnecessários sobre a existência de contas. |
| FE-15 | Qualquer erro técnico | Nunca expor stack trace, API key, string de conexão, secret de autenticação ou conteúdo da especificação. |

---

## 8. Requisitos Funcionais

Formato de cada requisito: **título**, **descrição** e **comportamento esperado**. Organização por domínio.

### 8.1 Domínio: Conteúdo público e landing page

**RF-001 — Landing page de apresentação do produto**
- *Descrição:* a rota `/` apresenta o produto, sua proposta, seu funcionamento e incentiva a criação de conta ou o login.
- *Comportamento esperado:* exibe hero com nome e proposta de valor, seção "Como funciona" (**Envie → Escolha → Gere**), seção dos frameworks suportados, seção de privacidade e CTA para criar conta ou entrar. Acessível sem autenticação.

**RF-002 — Comunicação de privacidade na landing**
- *Descrição:* a landing explica que especificações não são armazenadas permanentemente.
- *Comportamento esperado:* seção dedicada ao tema, com acesso a `/privacy`.

**RF-003 — Página de privacidade**
- *Descrição:* a rota `/privacy` explica de forma clara e simples o tratamento de dados do produto.
- *Comportamento esperado:* descreve finalidade do processamento, tratamento temporário da especificação, utilização da API de IA, ausência de armazenamento permanente da especificação no MVP, armazenamento de dados de autenticação e cuidados recomendados ao usuário. Não contém alegações que não possam ser garantidas tecnicamente. Acessível sem autenticação.

### 8.2 Domínio: Autenticação

**RF-004 — Criação de conta**
- *Descrição:* o visitante cria uma conta em `/register` informando email e senha.
- *Comportamento esperado:* valida os dados informados, impede cadastro duplicado de email, cria a conta e dá acesso à área autenticada. Senhas nunca são armazenadas manualmente; utiliza-se o mecanismo da biblioteca de autenticação.

**RF-005 — Login com email e senha**
- *Descrição:* o usuário autentica em `/login`.
- *Comportamento esperado:* credenciais válidas criam sessão autenticada e direcionam para `/app`; credenciais inválidas produzem mensagem de erro clara e acessível.

**RF-006 — Sessão autenticada**
- *Descrição:* a aplicação mantém a sessão do usuário autenticado enquanto válida.
- *Comportamento esperado:* a sessão identifica o usuário nas rotas privadas; quando expira, o acesso privado é interrompido.

**RF-007 — Logout**
- *Descrição:* o usuário encerra a sessão a partir da área autenticada.
- *Comportamento esperado:* a sessão é encerrada, o usuário é direcionado a uma rota pública e os dados temporários do resultado deixam de estar acessíveis.

**RF-008 — Proteção de rotas privadas**
- *Descrição:* `/app`, `/app/new`, `/app/result` e `/app/help` exigem autenticação.
- *Comportamento esperado:* usuário não autenticado que tente acessar qualquer rota privada é enviado para `/login`.

**RF-009 — Rotas públicas**
- *Descrição:* `/`, `/login`, `/register` e `/privacy` são públicas.
- *Comportamento esperado:* acessíveis sem sessão; `/login` e `/register` não bloqueiam navegação de visitantes.

**RF-010 — Identidade visual na autenticação**
- *Descrição:* as telas de login e cadastro devem transmitir a identidade do produto.
- *Comportamento esperado:* composição premium, com mensagem de posicionamento do produto, sem reduzir-se a logo e formulário branco centralizado e sem imagens genéricas de banco de imagens.

**RF-011 — Compatibilidade com recuperação de senha**
- *Descrição:* a autenticação é estruturada de modo compatível com futura recuperação de senha por email.
- *Comportamento esperado:* a solução escolhida permite habilitar recuperação de senha sem redesenho da autenticação. A inclusão no MVP é condicionada à simplicidade da implementação (ver §20).

### 8.3 Domínio: Dashboard

**RF-012 — Ação principal do dashboard**
- *Descrição:* `/app` tem como ação primária **Criar novo planejamento**.
- *Comportamento esperado:* a ação é visualmente dominante e conduz a `/app/new`.

**RF-013 — Comunicação de valor no dashboard**
- *Descrição:* o dashboard comunica rapidamente o objetivo do produto.
- *Comportamento esperado:* apresenta a headline conceitual de transformação de especificações técnicas em artefatos estruturados com IA, os três frameworks de forma visual e a seção "Como funciona" (**Envie → Escolha → Gere**).

**RF-014 — Ausência de métricas fictícias**
- *Descrição:* como não existe histórico no MVP, o dashboard não apresenta dados simulados.
- *Comportamento esperado:* nenhum gráfico, contador ou métrica inventada; ao mesmo tempo, a tela não é um espaço vazio com apenas um botão.

### 8.4 Domínio: Entrada da especificação

**RF-015 — Início de novo planejamento**
- *Descrição:* `/app/new` conduz o usuário por etapas até a geração.
- *Comportamento esperado:* etapas apresentadas de forma guiada — Especificação, Framework, Confirmação, Geração — com possibilidade de retorno às etapas anteriores antes da geração.

**RF-016 — Entrada por PDF**
- *Descrição:* o usuário pode enviar a especificação como arquivo PDF.
- *Comportamento esperado:* aceita PDF com texto selecionável; o texto é extraído e apenas o texto segue para processamento.

**RF-017 — Entrada por texto**
- *Descrição:* o usuário pode colar o conteúdo técnico em um campo amplo.
- *Comportamento esperado:* o conteúdo colado é aceito como especificação, sem exigência de upload.

**RF-018 — Exclusividade entre PDF e texto**
- *Descrição:* o usuário utiliza PDF **ou** texto.
- *Comportamento esperado:* a interface deixa claro qual entrada está ativa; as duas formas não são exigidas simultaneamente e apenas a entrada selecionada é processada.

**RF-019 — Extração de texto do PDF no navegador**
- *Descrição:* a camada textual do PDF é extraída preferencialmente no próprio navegador.
- *Comportamento esperado:* o arquivo é lido no cliente, o texto é extraído e somente o texto é enviado ao backend. O PDF original não é armazenado e, preferencialmente, não trafega pelo backend.

**RF-020 — PDF sem texto extraível**
- *Descrição:* PDFs escaneados ou sem camada textual não são suportados no MVP.
- *Comportamento esperado:* exibir mensagem amigável orientando o uso de PDF com texto selecionável ou a colagem direta do conteúdo, mantendo o usuário na etapa de entrada.

**RF-021 — Validações de entrada**
- *Descrição:* a aplicação valida a entrada antes de prosseguir.
- *Comportamento esperado:* valida formato do arquivo, tamanho, quantidade de texto, texto vazio e arquivo inválido, bloqueando o avanço com mensagem específica para cada caso.

**RF-022 — Verificação de volume antes da chamada à IA**
- *Descrição:* o tamanho aproximado da entrada é calculado antes de qualquer chamada ao serviço de IA.
- *Comportamento esperado:* entradas claramente incompatíveis com os limites definidos pela aplicação são impedidas antes do envio, evitando custo desnecessário, com mensagem orientando o usuário.

**RF-023 — Aviso de privacidade na entrada**
- *Descrição:* o tratamento da especificação é comunicado no ponto de envio.
- *Comportamento esperado:* aviso exibido próximo à entrada do documento, informando que a especificação é utilizada apenas durante o processamento e não é armazenada permanentemente, com link "Saiba mais" para `/privacy`.

### 8.5 Domínio: Seleção do framework

**RF-024 — Seleção obrigatória de framework**
- *Descrição:* a geração exige a escolha explícita de um framework.
- *Comportamento esperado:* opções Scrum, Kanban e Cascata; sem seleção, a geração é bloqueada com indicação de obrigatoriedade.

**RF-025 — Ausência de pré-seleção**
- *Descrição:* nenhuma opção vem marcada previamente.
- *Comportamento esperado:* ao abrir a etapa, nenhum framework está selecionado; a aplicação não sugere nem marca opção com base em interpretação da IA sobre o documento.

**RF-026 — Explicação do que cada framework gera**
- *Descrição:* a interface informa objetivamente o resultado de cada opção.
- *Comportamento esperado:* descrição breve ou tooltip por framework, com os textos de §11.4, para apoiar a decisão do usuário.

### 8.6 Domínio: Confirmação e geração

**RF-027 — Revisão da entrada antes da geração**
- *Descrição:* o usuário confirma os dados antes do processamento.
- *Comportamento esperado:* exibe origem da entrada (PDF ou texto), indicação de volume do conteúdo e framework selecionado, com possibilidade de retornar e ajustar antes de gerar.

**RF-028 — Pipeline de geração em três etapas**
- *Descrição:* a geração executa Extração, Estruturação e Consolidação, nessa ordem.
- *Comportamento esperado:* fluxo síncrono e linear, orquestrado internamente pela aplicação, sem orquestradores externos; cada etapa recebe a saída validada da anterior.

**RF-029 — Agente de Extração**
- *Descrição:* interpreta a especificação e identifica informações relevantes ao planejamento.
- *Comportamento esperado:* extrai exclusivamente informações presentes ou claramente inferíveis do conteúdo fornecido — requisitos, funcionalidades, entregas, stakeholders mencionados, restrições, premissas, dependências, prazos, datas, marcos, objetivos, critérios relevantes e demais informações necessárias ao planejamento. Não produz artefatos de gestão nesta etapa. A saída é estruturada e validada.

**RF-030 — Agente de Estruturação**
- *Descrição:* converte os dados extraídos em artefatos do framework selecionado.
- *Comportamento esperado:* recebe os dados da extração e o framework escolhido, aplica a instrução específica daquele framework e produz apenas os artefatos definidos para ele. Nunca altera o framework selecionado.

**RF-031 — Agente de Consolidação**
- *Descrição:* valida, consolida e organiza o pacote produzido.
- *Comportamento esperado:* verifica aderência ao framework, presença dos artefatos obrigatórios, ausência de artefatos não solicitados, estrutura, consistência, duplicidades, possíveis informações inventadas e campos obrigatórios. Não reinterpreta a especificação do zero.

**RF-032 — Feedback visual de progresso**
- *Descrição:* a geração apresenta progresso compreensível.
- *Comportamento esperado:* exibe as etapas **Interpretando especificação**, **Estruturando planejamento** e **Validando artefatos**, com experiência visual de progresso em vez de apenas um spinner.

**RF-033 — Não exposição de detalhes internos**
- *Descrição:* o usuário não vê o funcionamento interno da IA.
- *Comportamento esperado:* a interface nunca exibe prompt, raciocínio interno, cadeia de pensamento, logs técnicos ou detalhes da API de IA.

**RF-034 — Recuperação controlada de resposta inválida**
- *Descrição:* respostas que não atendem ao contrato estruturado são tratadas.
- *Comportamento esperado:* valida a resposta; tenta recuperação controlada quando apropriado; limita a quantidade de novas tentativas; evita loops; registra erro sanitizado; apresenta mensagem amigável quando a recuperação não for possível.

### 8.7 Domínio: Artefatos Scrum

**RF-035 — Histórias de usuário**
- *Descrição:* requisitos identificados são transformados em histórias de usuário.
- *Comportamento esperado:* utiliza o formato "Como [perfil], quero [necessidade], para [benefício]" quando aplicável; quando não for possível identificar a persona com segurança, utiliza formulação tecnicamente adequada, sem inventar stakeholder ou perfil inexistente.

**RF-036 — Critérios de aceite**
- *Descrição:* cada história possui critérios de aceite.
- *Comportamento esperado:* critérios objetivos, verificáveis, claros e derivados da especificação; nenhuma regra de negócio inventada.

**RF-037 — Backlog priorizado**
- *Descrição:* produz backlog priorizado com justificativa.
- *Comportamento esperado:* prioriza com critério simples baseado em **valor de negócio × complexidade**, apresenta a justificativa da priorização e evita falsa precisão ou números arbitrários excessivamente detalhados quando não houver dados suficientes.

**RF-038 — Sugestão da primeira Sprint**
- *Descrição:* sugere os itens de uma Sprint inicial.
- *Comportamento esperado:* informa os itens sugeridos e a razão da escolha; não assume velocidade, story points, capacidade ou quantidade de desenvolvedores quando essas informações não estiverem na especificação.

**RF-039 — Cronograma macro Scrum**
- *Descrição:* produz visão macro em Sprints.
- *Comportamento esperado:* apresenta sequência de Sprints e dependências relevantes; sem datas na especificação, não inventa duração fixa nem calendário.

### 8.8 Domínio: Artefatos Kanban

**RF-040 — Quadro inicial**
- *Descrição:* estrutura o quadro inicial de trabalho.
- *Comportamento esperado:* propõe colunas a partir de uma estrutura inicial padrão (Backlog → A Fazer → Em Andamento → Revisão → Concluído), podendo adaptá-las quando a especificação justificar claramente outro fluxo, sem criar processos desnecessariamente complexos.

**RF-041 — Itens do quadro**
- *Descrição:* popula o quadro com itens derivados da especificação.
- *Comportamento esperado:* cada item possui descrição, tipo e prioridade; quando a informação estiver presente na especificação, inclui também dependência e observação relevante.

**RF-042 — Classificação e prioridade**
- *Descrição:* classifica e prioriza os itens do quadro.
- *Comportamento esperado:* a classificação e a prioridade derivam do conteúdo da especificação, sem invenção de critérios externos.

**RF-043 — Limites de WIP com justificativa**
- *Descrição:* sugere limites de trabalho em andamento.
- *Comportamento esperado:* sugere limites nas colunas aplicáveis, sempre com justificativa; não afirma que determinado limite é matematicamente ideal sem dados históricos; não assume tamanho de equipe.

### 8.9 Domínio: Artefatos Cascata

**RF-044 — TAP (Termo de Abertura do Projeto)**
- *Descrição:* gera o termo de abertura a partir da especificação.
- *Comportamento esperado:* contém objetivo, escopo resumido, stakeholders identificados, critérios de sucesso, premissas e restrições; cada informação ausente é marcada como **"Não identificado na especificação."**

**RF-045 — EAP (Estrutura Analítica do Projeto)**
- *Descrição:* decompõe o escopo identificado em entregas.
- *Comportamento esperado:* orientada a entregáveis, seguindo a regra dos 100% e representando o escopo identificado; não utiliza atividades como pacotes principais (por exemplo "realizar reunião", "desenvolver código", "testar", "acompanhar").

**RF-046 — Cronograma macro Cascata**
- *Descrição:* apresenta a visão macro de execução.
- *Comportamento esperado:* apresenta fases, marcos, sequência lógica e dependências relevantes, sem detalhamento operacional de tarefas; utiliza datas apenas quando identificadas na especificação e, na ausência delas, não inventa calendário.

**RF-047 — Material de Kick-off**
- *Descrição:* produz o conteúdo de apoio para a reunião de abertura.
- *Comportamento esperado:* conteúdo estruturado com título, objetivo, escopo, principais marcos e papéis e responsabilidades; não gera apresentação gráfica no MVP.

### 8.10 Domínio: Resultados

**RF-048 — Apresentação estruturada do resultado**
- *Descrição:* `/app/result` apresenta o pacote gerado de forma visual e navegável.
- *Comportamento esperado:* cada artefato possui representação visual adequada; o resultado não é exibido como JSON bruto, bloco único de Markdown, texto gigante ou coleção de cards idênticos.

**RF-049 — Resultado Scrum**
- *Descrição:* visualização específica para artefatos Scrum.
- *Comportamento esperado:* pode utilizar cards de histórias, badges de prioridade, critérios de aceite expansíveis, backlog visual, bloco específico para a Sprint sugerida e visão macro do cronograma.

**RF-050 — Resultado Kanban**
- *Descrição:* visualização específica para o quadro Kanban.
- *Comportamento esperado:* em desktop, colunas horizontais quando houver espaço; em mobile, colunas convertidas em seções, tabs, accordion ou navegação horizontal controlada, evitando scroll horizontal interminável. Limites de WIP e justificativas visíveis.

**RF-051 — Resultado Cascata**
- *Descrição:* visualização específica para artefatos de Cascata.
- *Comportamento esperado:* componentes distintos para TAP (documento estruturado), EAP (hierarquia visual), cronograma (timeline ou estrutura equivalente) e Kick-off (formato de slides/cards).

**RF-052 — Indicação de informação ausente**
- *Descrição:* a ausência de dados é comunicada de forma explícita.
- *Comportamento esperado:* exibe **"Não identificado na especificação."** no campo correspondente, de forma visualmente identificável, sem preenchimento inventado.

**RF-053 — Disponibilidade do resultado durante a sessão**
- *Descrição:* o resultado permanece acessível enquanto a sessão de trabalho estiver ativa.
- *Comportamento esperado:* permite navegação entre seções, visualização, exportação e retorno dentro da sessão atual, sem reprocessamento; a rota de resultado não utiliza identificador persistente, pois não há banco de projetos no MVP; os dados temporários podem ser descartados ao encerrar a sessão ou a aba.

### 8.11 Domínio: Exportação

**RF-054 — Exportação para PDF**
- *Descrição:* o usuário exporta o resultado como PDF.
- *Comportamento esperado:* gera PDF profissional contendo identificação do framework, título, data de geração, os artefatos e hierarquia visual adequada.

**RF-055 — Exportação para texto**
- *Descrição:* o usuário exporta o resultado como arquivo de texto.
- *Comportamento esperado:* gera arquivo legível em formato de texto simples ou Markdown (ver §20), preservando a organização por artefato.

**RF-056 — Exportação sem nova chamada à IA**
- *Descrição:* a exportação reutiliza o resultado já processado.
- *Comportamento esperado:* nenhuma chamada adicional ao serviço de IA é feita para exportar.

**RF-057 — Exportação sem persistência**
- *Descrição:* a exportação não exige armazenamento do conteúdo.
- *Comportamento esperado:* nenhum conteúdo é persistido no banco apenas para possibilitar o download.

**RF-058 — Conteúdo proibido nas exportações**
- *Descrição:* os arquivos exportados não contêm informação interna.
- *Comportamento esperado:* ausência de prompts, nomes internos de agentes e informações técnicas da API de IA nos arquivos gerados.

### 8.12 Domínio: Ajuda

**RF-059 — Central de ajuda**
- *Descrição:* `/app/help` concentra a orientação de uso.
- *Comportamento esperado:* guia rápido integrado ao produto, sem manual extenso tradicional no MVP.

**RF-060 — Guia rápido de uso**
- *Descrição:* o guia explica o uso em cinco passos.
- *Comportamento esperado:* apresenta: 1) envie sua especificação (PDF ou texto); 2) escolha o framework (Scrum, Kanban ou Cascata); 3) gere o planejamento; 4) revise — a IA auxilia, mas o resultado deve ser revisado pelo responsável pelo projeto; 5) exporte em PDF ou texto.

**RF-061 — Ajuda contextual**
- *Descrição:* termos de gestão são explicados no ponto de uso.
- *Comportamento esperado:* tooltips ou ícones de ajuda discretos em pontos relevantes, cobrindo ao menos "O que é TAP?", "O que é EAP?", "O que significa WIP?" e "O que será gerado no Scrum?", sem poluir visualmente a interface.

**RF-062 — FAQ**
- *Descrição:* perguntas frequentes iniciais disponíveis na ajuda.
- *Comportamento esperado:* responde, no mínimo: armazenamento do PDF (não armazenado permanentemente), quem escolhe o framework (o usuário), uso de PDF escaneado (não suportado no MVP), se o resultado substitui a avaliação de um gerente de projetos (não — é ferramenta de apoio) e se o resultado pode ser exportado (sim, PDF ou texto).

### 8.13 Domínio: Privacidade e proteção de dados (requisitos de produto)

**RF-063 — Não armazenamento da especificação**
- *Descrição:* a especificação enviada não é armazenada pela aplicação.
- *Comportamento esperado:* não são armazenados PDF original, arquivo enviado, texto integral da especificação, prompts contendo a especificação completa nem respostas contendo a especificação original em logs.

**RF-064 — Ausência de histórico permanente**
- *Descrição:* o MVP não mantém histórico de planejamentos.
- *Comportamento esperado:* os documentos gerados não são persistidos permanentemente; o banco não funciona como repositório dos projetos enviados e não contém tabelas de projetos, documentos, especificações ou artefatos gerados.

**RF-065 — Chamadas à IA exclusivamente server-side**
- *Descrição:* a integração com o serviço de IA ocorre somente no backend.
- *Comportamento esperado:* nenhuma credencial do serviço de IA é exposta ao cliente; nenhuma chamada ao serviço de IA parte do navegador.

**RF-066 — Logs sanitizados**
- *Descrição:* os logs registram operação, não conteúdo.
- *Comportamento esperado:* podem registrar timestamp, status, duração, framework utilizado, erro técnico sanitizado e identificador técnico não sensível; nunca registram documento, texto integral, prompt completo com o documento ou resposta integral do modelo.

### 8.14 Domínio: Tratamento de erros e estados

**RF-067 — Estados de erro cobertos**
- *Descrição:* a aplicação possui estado tratado para cada falha previsível.
- *Comportamento esperado:* cobre PDF inválido, PDF sem texto, entrada vazia, framework não selecionado, documento muito grande, serviço de IA indisponível, timeout, resposta inválida, falha de validação de contrato, sessão expirada, erro de rede e falha de exportação, conforme §7.3.

**RF-068 — Mensagens compreensíveis**
- *Descrição:* as mensagens de erro são escritas para o usuário final.
- *Comportamento esperado:* linguagem clara, indicação do que aconteceu e do que fazer em seguida; sem jargão técnico, código de erro cru ou conteúdo interno.

**RF-069 — Estados vazios**
- *Descrição:* telas sem conteúdo possuem orientação.
- *Comportamento esperado:* por exemplo, acesso a `/app/result` sem resultado na sessão apresenta estado vazio com direcionamento para iniciar um novo planejamento.

---

## 9. Requisitos Não Funcionais

### 9.1 Segurança

**RNF-001 — Validação de entrada em todas as fronteiras**
Todos os dados recebidos de usuário e todas as respostas do serviço de IA são validados contra contratos definidos antes do uso.

**RNF-002 — Proteção de credenciais e secrets**
API key do serviço de IA, string de conexão do banco e secret de autenticação permanecem exclusivamente server-side, nunca expostos ao cliente nem versionados no repositório.

**RNF-003 — Autorização de rotas**
Toda rota privada verifica a sessão; não há conteúdo privado acessível sem sessão válida.

**RNF-004 — Sessões seguras**
Sessões criadas, mantidas e encerradas pelos mecanismos da biblioteca de autenticação; senhas nunca manipuladas ou armazenadas manualmente.

**RNF-005 — Proteção da camada de API**
Endpoints de geração e exportação protegidos contra uso não autenticado e contra entradas fora dos limites aceitos.

**RNF-006 — Sanitização de entradas**
Conteúdo enviado pelo usuário é sanitizado antes de uso, exibição ou registro.

**RNF-007 — Rate limiting preparado**
A aplicação prevê limitação de requisições para as operações que consomem o serviço de IA, de modo a conter abuso e custo.

**RNF-008 — Headers de segurança**
Headers de segurança apropriados configurados nas respostas da aplicação.

**RNF-009 — Tratamento seguro de erros**
Nenhuma resposta de erro expõe stack trace, API key, string de conexão, secret de autenticação ou conteúdo integral da especificação.

### 9.2 Privacidade e proteção de dados

**RNF-010 — Minimização de dados**
O banco armazena somente o necessário para autenticação e operação básica da aplicação.

**RNF-011 — Processamento temporário**
A especificação é utilizada apenas durante o processamento, sem persistência permanente em banco, arquivo ou log.

**RNF-012 — Persistência temporária restrita ao navegador**
O resultado da sessão fica temporariamente no navegador, com preferência por `sessionStorage` em vez de `localStorage`, e não deve conter conteúdo confidencial persistido permanentemente.

**RNF-013 — Descarte dos dados temporários**
Encerrada a sessão ou a aba, os dados temporários devem poder ser descartados.

**RNF-014 — Transparência**
O tratamento de dados é comunicado na interface, no ponto de envio da especificação, e detalhado em `/privacy`.

### 9.3 Responsividade

**RNF-015 — Responsividade completa**
A aplicação funciona integralmente em smartphone, tablet, notebook e desktop; nenhuma funcionalidade crítica depende exclusivamente de desktop.

**RNF-016 — Breakpoints validados visualmente**
Validação visual em aproximadamente 375 px, 430 px, 768 px, 1366 px e 1440 px ou superior. O uso de um framework CSS com breakpoints não é considerado evidência de responsividade.

**RNF-017 — Adaptação por dispositivo, não redução**
Desktop prioriza densidade, hierarquia, uso horizontal, boards, timelines e EAP ampliada; tablet adapta grids, colunas, menus e espaçamentos; smartphone prioriza coluna única, navegação simples, alvos de toque adequados, campos confortáveis, tipografia legível e modais dentro da viewport.

**RNF-018 — Controle de scroll horizontal**
Scroll horizontal é evitado; onde for inevitável (quadro Kanban), é controlado e acompanhado de alternativa de navegação.

### 9.4 Acessibilidade

**RNF-019 — Contraste adequado**
Combinações de cor e texto atendem a contraste adequado em todas as superfícies.

**RNF-020 — Navegação por teclado e foco visível**
Todos os controles são operáveis por teclado, com indicador de foco visível.

**RNF-021 — Semântica e rótulos**
Campos possuem labels; atributos ARIA são utilizados quando apropriado; áreas clicáveis possuem tamanho adequado.

**RNF-022 — Significado independente de cor**
Nenhuma informação é comunicada exclusivamente por cor — prioridade, status e ausência de dados possuem rótulo textual.

**RNF-023 — Mensagens de erro acessíveis**
Erros são associados aos campos correspondentes e perceptíveis por tecnologias assistivas.

### 9.5 Performance

**RNF-024 — Responsividade da interface durante a geração**
A interface permanece responsiva durante o processamento, com progresso visível e sem bloqueio aparente.

**RNF-025 — Controle de custo e volume de entrada**
O volume da entrada é avaliado antes do envio ao serviço de IA, bloqueando requisições claramente incompatíveis com os limites da aplicação.

**RNF-026 — Processamento de PDF no cliente**
A extração textual do PDF ocorre preferencialmente no navegador, reduzindo tráfego e exposição do arquivo original.

**RNF-027 — Exportação sem reprocessamento**
As exportações são geradas a partir do resultado já em memória da sessão, sem nova chamada ao serviço de IA.

### 9.6 Confiabilidade

**RNF-028 — Resultado conforme contrato**
Nenhum resultado é apresentado ao usuário sem ter sido validado contra o contrato estruturado do framework correspondente.

**RNF-029 — Retries limitados**
Tentativas de recuperação de respostas inválidas são limitadas em quantidade, sem loops e sem espera indefinida.

**RNF-030 — Degradação informada**
Falhas parciais ou totais resultam em estado explicativo, nunca em tela travada, em branco ou em resultado silenciosamente incompleto.

### 9.7 Usabilidade

**RNF-031 — Fluxo guiado e progresso visível**
O usuário sempre sabe em que etapa está, o que falta e qual é a próxima ação.

**RNF-032 — Ação principal evidente**
Em cada tela existe uma ação primária inequívoca; botões não competem pela mesma atenção.

**RNF-033 — Linguagem do domínio de gestão**
A terminologia utilizada é a dos frameworks de gestão (história, backlog, Sprint, WIP, TAP, EAP, marco), com ajuda contextual para termos técnicos de gestão.

### 9.8 Design premium

**RNF-034 — Percepção de produto comercial**
A interface deve parecer um produto SaaS comercial premium e não projeto acadêmico, template gratuito, protótipo, dashboard administrativo genérico ou biblioteca de componentes sem customização.

**RNF-035 — Consistência visual sistematizada**
Cores, tipografia, espaçamento, raio, sombras e larguras máximas seguem um sistema consistente, sem valores arbitrários espalhados pelo produto.

**RNF-036 — Microinterações com propósito**
Microinterações sutis em botões, hover, upload, seleção de framework, progressão, cards interativos, menu e feedback de sucesso; sem animação meramente decorativa.

### 9.9 Tratamento de erros

**RNF-037 — Cobertura e clareza**
Todos os estados de erro previstos em §7.3 possuem tratamento, mensagem compreensível e caminho de recuperação quando aplicável.

**RNF-038 — Observabilidade sanitizada**
Falhas geram registro técnico suficiente para diagnóstico, sem conteúdo do documento, prompt completo ou resposta integral do modelo.

---

## 10. Regras de Negócio

**RN-001 — A IA não escolhe o framework**
Em nenhuma circunstância a aplicação ou a IA decide, sugere como pré-seleção ou altera o framework de trabalho.

**RN-002 — A escolha do framework é do usuário e é obrigatória**
O usuário seleciona explicitamente Scrum, Kanban ou Cascata. Sem essa seleção, a geração não ocorre.

**RN-003 — Não inventar informações**
A IA não inventa requisitos, funcionalidades, stakeholders, datas, restrições, premissas, dependências, prazos, regras de negócio ou entregas.

**RN-004 — Ausência de dados deve ser indicada claramente**
Quando uma informação necessária não estiver disponível na especificação, utiliza-se **"Não identificado na especificação."**

**RN-005 — Sem datas, sem calendário fictício**
Na ausência de datas na especificação, trabalha-se com sequência lógica e dependências, sem criar datas, durações fixas ou calendário.

**RN-006 — Cada framework gera apenas os seus artefatos definidos**
Nenhum artefato além dos definidos em §11 é produzido, e nenhum artefato obrigatório do framework selecionado é omitido sem sinalização explícita.

**RN-007 — A especificação não é armazenada permanentemente**
O texto integral da especificação, os prompts que o contenham e as respostas que o reproduzam não são persistidos.

**RN-008 — O PDF original não é armazenado**
O arquivo enviado não é armazenado e, preferencialmente, não trafega pelo backend: apenas o texto extraído é enviado para processamento.

**RN-009 — Entrada por PDF ou texto, nunca exigência das duas**
O usuário utiliza uma das duas formas de entrada; a aplicação processa apenas a entrada selecionada.

**RN-010 — Não há histórico permanente no MVP**
Resultados não são persistidos entre sessões; a rota de resultado não utiliza identificador persistente.

**RN-011 — Rotas privadas exigem sessão válida**
Acesso sem autenticação a `/app`, `/app/new`, `/app/result` ou `/app/help` redireciona para `/login`.

**RN-012 — Limites de entrada são verificados antes do consumo de IA**
Entradas vazias, inválidas ou acima dos limites definidos pela aplicação são bloqueadas antes de qualquer chamada ao serviço de IA.

**RN-013 — PDFs sem texto extraível não são processados no MVP**
Não há OCR; PDFs escaneados resultam em mensagem orientando o uso de PDF com texto selecionável ou a colagem do texto.

**RN-014 — A priorização do backlog Scrum é justificada e sem falsa precisão**
A priorização usa valor de negócio × complexidade, apresenta justificativa e não produz números arbitrários excessivamente detalhados sem dados suficientes.

**RN-015 — Parâmetros de time não são presumidos**
Velocidade, story points, capacidade, quantidade de desenvolvedores e tamanho de equipe não são assumidos quando não informados na especificação.

**RN-016 — Limites de WIP são sugestões justificadas**
Todo limite de WIP é apresentado com justificativa e nunca declarado como matematicamente ideal na ausência de dados históricos.

**RN-017 — A EAP é orientada a entregáveis**
A EAP decompõe o escopo em entregas, segue a regra dos 100% e não utiliza atividades como pacotes principais.

**RN-018 — A exportação não reprocessa com IA nem exige persistência**
Exportar utiliza o resultado já processado; não há nova chamada ao serviço de IA nem gravação do conteúdo no banco para possibilitar download.

**RN-019 — Conteúdo interno nunca é exposto**
Prompt, raciocínio interno, nomes internos de agentes, logs técnicos e detalhes da API de IA não aparecem na interface nem nos arquivos exportados.

**RN-020 — Chamadas ao serviço de IA ocorrem somente no servidor**
Nenhuma credencial do serviço de IA é disponibilizada ao cliente.

**RN-021 — Logs não contêm conteúdo do usuário**
Logs registram apenas metadados operacionais e erros sanitizados.

**RN-022 — O resultado é apoio, não decisão**
O produto comunica que o resultado deve ser revisado pelo responsável pelo projeto e não substitui a avaliação de um gerente de projetos.

**RN-023 — Resultado só é exibido após validação**
Um pacote que não passe pela validação do contrato do framework não é apresentado como resultado válido.

---

## 11. Artefatos por Framework

Esta seção é normativa: define exatamente o que cada framework produz. Nenhum artefato adicional é gerado.

### 11.1 Scrum

| Artefato | Conteúdo |
|---|---|
| **Histórias de usuário** | Requisitos identificados transformados em histórias, no formato "Como [perfil], quero [necessidade], para [benefício]" quando aplicável; sem inventar perfil ou stakeholder inexistente. |
| **Critérios de aceite** | Critérios objetivos, verificáveis, claros e derivados da especificação, associados às histórias. |
| **Backlog priorizado** | Itens ordenados por critério simples de valor de negócio × complexidade, com justificativa da priorização e sem falsa precisão. |
| **Sugestão da primeira Sprint** | Itens sugeridos para a Sprint inicial e a razão da escolha, sem presumir velocidade, story points, capacidade ou tamanho de time. |
| **Cronograma macro** | Sequência de Sprints e dependências relevantes; sem datas na especificação, sem duração fixa inventada. |

### 11.2 Kanban

| Artefato | Conteúdo |
|---|---|
| **Quadro inicial** | Colunas do fluxo de trabalho, partindo da estrutura inicial Backlog → A Fazer → Em Andamento → Revisão → Concluído, adaptável quando a especificação justificar claramente outro fluxo, sem complexidade desnecessária. |
| **Itens** | Itens derivados da especificação, cada um com descrição; quando presentes na especificação, dependência e observação relevante. |
| **Classificação** | Tipo de cada item, derivado do conteúdo da especificação. |
| **Prioridade** | Prioridade de cada item, derivada da especificação. |
| **Limites de WIP** | Limites sugeridos para as colunas aplicáveis. |
| **Justificativas** | Racional explícito dos limites de WIP sugeridos e, quando aplicável, da classificação e priorização, sem afirmar idealidade matemática nem assumir tamanho de equipe. |

### 11.3 Cascata

| Artefato | Conteúdo |
|---|---|
| **TAP — Termo de Abertura do Projeto** | Objetivo, escopo resumido, stakeholders identificados, critérios de sucesso, premissas e restrições; ausências marcadas como "Não identificado na especificação." |
| **EAP — Estrutura Analítica do Projeto** | Decomposição do escopo em entregas, orientada a entregáveis, seguindo a regra dos 100%, sem atividades como pacotes principais. |
| **Cronograma macro** | Fases, marcos, sequência lógica e dependências relevantes, sem detalhamento operacional de tarefas; datas apenas quando identificadas. |
| **Material de Kick-off** | Conteúdo estruturado para apresentação: 1) Título, 2) Objetivo, 3) Escopo, 4) Principais marcos, 5) Papéis e responsabilidades. Sem geração de apresentação gráfica no MVP. |

### 11.4 Textos de comunicação dos frameworks na interface

| Framework | Texto de ajuda |
|---|---|
| **Scrum** | "Gera histórias de usuário, critérios de aceite, backlog priorizado, sugestão da primeira Sprint e cronograma macro." |
| **Kanban** | "Estrutura o quadro inicial, classifica itens e sugere limites de trabalho em andamento." |
| **Cascata** | "Gera TAP, EAP, cronograma macro e material de apoio para o Kick-off." |

---

## 12. Requisitos de UX

### 12.1 Experiência simples

Uma tarefa central por tela, vocabulário direto e ausência de configuração obrigatória antes do primeiro uso. O usuário deve conseguir concluir o primeiro planejamento sem treinamento.

### 12.2 Fluxo guiado

O caminho Especificação → Framework → Confirmação → Geração é apresentado como progressão explícita, com indicação da etapa atual, possibilidade de retorno antes da geração e bloqueio de avanço somente quando houver pendência real, sempre explicada.

### 12.3 Feedback durante o processamento

Progresso nomeado por etapa (**Interpretando especificação**, **Estruturando planejamento**, **Validando artefatos**), com experiência visual de progresso em vez de spinner isolado, e sem exposição de internals da IA.

### 12.4 Ajuda contextual

Tooltips e ícones de ajuda discretos nos pontos onde a dúvida ocorre: significado de TAP, EAP e WIP, e o que cada framework gera. A ajuda completa fica em `/app/help`, sem poluir a interface de trabalho.

### 12.5 Responsividade

Experiência adaptada por dispositivo, não apenas reduzida: desktop com maior densidade e aproveitamento horizontal; tablet com grids, colunas, menus e espaçamentos ajustados; smartphone em coluna única.

### 12.6 Experiência mobile

Coluna única, navegação simples, botões com área de toque adequada, campos confortáveis, cards responsivos, tipografia legível, menu mobile e modais dentro da viewport. O quadro Kanban é convertido em seções, tabs, accordion ou navegação horizontal controlada.

### 12.7 Estados de loading

Todo processo assíncrono — upload, extração de texto, geração, exportação — possui estado de carregamento visível, com indicação do que está acontecendo e sem travar a interface.

### 12.8 Estados vazios

Telas sem conteúdo apresentam explicação e próxima ação: dashboard sem histórico (que não é simulado), resultado inexistente na sessão, seção de artefato sem itens identificados na especificação.

### 12.9 Erros

Mensagens escritas para o usuário final, com o que ocorreu, o motivo quando relevante e o que fazer em seguida; a entrada do usuário é preservada quando possível, para permitir nova tentativa sem retrabalho.

### 12.10 Comunicação da privacidade

Aviso no ponto de envio do documento, com link "Saiba mais" para `/privacy`, seção de privacidade na landing e resposta direta no FAQ. A privacidade é tratada como elemento de experiência e de confiança, não apenas como texto legal.

### 12.11 Revisão humana comunicada

A interface e o guia reforçam que o resultado é um ponto de partida que deve ser revisado pelo responsável pelo projeto.

---

## 13. Requisitos Visuais

Esta seção registra apenas o direcionamento de produto. O detalhamento de tokens, componentes e estados é responsabilidade de `DESIGN_SYSTEM.md`.

### 13.1 Posicionamento visual

O produto deve se apresentar como **SaaS comercial premium**, com identidade própria. Deve ser evitada qualquer aparência de projeto acadêmico, template gratuito, protótipo, dashboard administrativo genérico ou biblioteca de componentes sem customização.

### 13.2 Atributos a transmitir

Inteligência Artificial, tecnologia, gestão, planejamento, organização, confiança, precisão e sofisticação.

### 13.3 Princípios visuais

1. **Base sóbria, destaque tecnológico** — base em tons profundos (navy, graphite, slate), superfícies claras (branco, off-white, cinzas muito claros) e uma cor de destaque tecnológica na família azul elétrico / índigo / violeta, reservada a CTAs, seleção, geração, indicadores e identidade.
2. **Paleta enxuta** — número reduzido de cores, com estados de sucesso, atenção e erro bem definidos; nuances podem ser ajustadas para harmonia e contraste, sem multiplicar cores.
3. **Gradiente como exceção** — gradiente (índigo → violeta) apenas onde contribui para a identidade: hero e pequenos destaques ligados à IA; nunca em todos os cards e botões.
4. **Hierarquia tipográfica definida** — fonte moderna, profissional e legível, com escala para display, H1, H2, H3, body, label, caption e metadata, sem tamanhos exagerados em telas internas.
5. **Sistema de espaçamento consistente** — spacing, padding, gap, radius, shadow e largura máxima de conteúdo definidos como sistema, evitando valores arbitrários.
6. **Cards discretos e legíveis** — bordas discretas, raio consistente, sombra sutil quando necessária, espaço interno confortável e hover apenas quando houver ação.
7. **Hierarquia de ações** — botões primário, secundário, ghost e destrutivo claramente diferenciados; o destrutivo exclusivo para ações destrutivas; sem múltiplos botões competindo pela mesma atenção.
8. **Microinterações com propósito** — sutis e funcionais, aplicadas a feedback e progressão, nunca decorativas.
9. **Representação visual por natureza do artefato** — board para Kanban, hierarquia para EAP, timeline para cronograma, cards/slides para Kick-off, cards com badges e conteúdo expansível para histórias.

### 13.4 Critérios de qualidade visual (checklist por página)

Antes de considerar uma página pronta: parece produto comercial? possui identidade própria? a ação principal está clara? há boa hierarquia? há excesso de informação? funciona bem no smartphone? os componentes são consistentes? a interface transmite confiança? parece template genérico? um usuário se sentiria confortável enviando uma especificação técnica real por essa interface?

---

## 14. Privacidade e Segurança

Requisitos de produto. O detalhamento operacional é responsabilidade de `DATA_PRIVACY.md`.

### 14.1 Documentos confidenciais

A especificação enviada é tratada, por padrão, como **potencialmente confidencial**, independentemente do conteúdo. Nenhuma funcionalidade do MVP depende de retê-la.

### 14.2 Processamento temporário

A especificação existe apenas durante o ciclo de processamento: entrada → extração → estruturação → consolidação → resultado. Encerrado o ciclo, o conteúdo não permanece em banco, arquivo ou log da aplicação.

### 14.3 Ausência de persistência permanente

Não são persistidos: PDF original, arquivo enviado, texto integral da especificação, prompts contendo a especificação completa, respostas contendo a especificação original em logs e documentos gerados. O banco não é repositório de projetos e não possui tabelas de projetos, documentos, especificações ou artefatos gerados.

### 14.4 Persistência temporária no navegador

O resultado da sessão permanece temporariamente no navegador, com preferência por `sessionStorage`, exclusivamente para navegação, visualização, exportação e retorno dentro da sessão atual, podendo ser descartado ao encerrar a sessão ou a aba.

### 14.5 Proteção de credenciais

API key do serviço de IA, string de conexão do banco e secret de autenticação permanecem server-side, fora do cliente e fora do repositório. O produto expõe apenas variáveis de ambiente de exemplo, sem valores reais.

### 14.6 Logs sanitizados

Logs registram timestamp, status, duração, framework utilizado, erro técnico sanitizado e identificador técnico não sensível. Não registram documento, texto integral, prompt completo com o documento ou resposta integral do modelo.

### 14.7 API de IA exclusivamente server-side

Todas as chamadas ao serviço de IA partem do backend. A configuração de modelo e limites é centralizada e não é exposta ao cliente.

### 14.8 Segurança aplicada ao fluxo

Validação de entrada, autenticação, autorização de rotas, sessões seguras, proteção de API, sanitização de entradas, rate limiting preparado, headers apropriados e tratamento seguro de erros, sem exposição de informação sensível em nenhuma resposta.

### 14.9 Comunicação ao usuário

A página `/privacy` explica, em linguagem simples, finalidade do processamento, tratamento temporário da especificação, uso da API de IA, ausência de armazenamento permanente no MVP, armazenamento de dados de autenticação e cuidados recomendados ao usuário — sem alegações que não possam ser garantidas tecnicamente.

> Esta seção não constitui política jurídica. O texto público de privacidade é um artefato do produto, definido em `/privacy` e documentado em `DATA_PRIVACY.md`.

---

## 15. Critérios de Aceitação do MVP

O MVP é considerado funcionalmente concluído quando todos os itens abaixo forem verdadeiros.

### 15.1 Autenticação e acesso

- [ ] Criação de conta com email e senha funciona.
- [ ] Login e logout funcionam.
- [ ] Sessão autenticada é mantida e expira de forma tratada.
- [ ] Rotas privadas (`/app`, `/app/new`, `/app/result`, `/app/help`) estão protegidas e redirecionam para `/login`.
- [ ] Rotas públicas (`/`, `/login`, `/register`, `/privacy`) estão acessíveis sem sessão.

### 15.2 Entrada

- [ ] Entrada por PDF com texto selecionável funciona, com extração no navegador.
- [ ] Entrada por texto funciona.
- [ ] PDF original não é armazenado.
- [ ] PDF sem texto extraível resulta em mensagem amigável.
- [ ] Validações de formato, tamanho, volume de texto, texto vazio e arquivo inválido funcionam.
- [ ] Entradas acima dos limites são bloqueadas antes de qualquer chamada ao serviço de IA.
- [ ] Aviso de privacidade aparece junto à entrada, com link para `/privacy`.

### 15.3 Framework e geração

- [ ] Seleção de framework é obrigatória e não vem pré-selecionada.
- [ ] A IA não escolhe nem altera o framework.
- [ ] O pipeline Extração → Estruturação → Consolidação executa integralmente.
- [ ] Contratos estruturados validam as respostas em todas as etapas.
- [ ] Respostas inválidas acionam recuperação limitada, sem loop, com mensagem amigável em caso de falha.
- [ ] O progresso é exibido nas três etapas nomeadas, sem expor internals.

### 15.4 Artefatos por framework

- [ ] **Scrum** gera histórias de usuário, critérios de aceite, backlog priorizado com justificativa, sugestão da primeira Sprint com razão da escolha e cronograma macro.
- [ ] **Kanban** gera quadro inicial, itens, classificação, prioridade e limites de WIP com justificativa.
- [ ] **Cascata** gera TAP, EAP orientada a entregáveis, cronograma macro e material de Kick-off.
- [ ] Nenhum artefato além dos definidos é produzido em qualquer framework.
- [ ] Informações ausentes aparecem como "Não identificado na especificação."
- [ ] Na ausência de datas, não há datas, durações fixas ou calendário inventados.

### 15.5 Resultado e exportação

- [ ] O resultado é apresentado com visualização adequada por artefato, não como JSON ou bloco único de texto.
- [ ] O resultado permanece disponível para navegação durante a sessão atual.
- [ ] O resultado não é persistido permanentemente.
- [ ] Exportação em PDF funciona e contém framework, título, data de geração e artefatos com hierarquia adequada.
- [ ] Exportação em texto funciona e é legível.
- [ ] Nenhuma exportação dispara nova chamada ao serviço de IA.
- [ ] Nenhuma exportação contém prompt, nome interno de agente ou informação técnica da API.

### 15.6 Experiência e interface

- [ ] A aplicação é responsiva e validada visualmente em ~375 px, ~430 px, ~768 px, ~1366 px e ≥1440 px.
- [ ] O mobile está validado, inclusive o resultado Kanban.
- [ ] Estados de loading, vazios e de erro estão implementados conforme §7.3 e §12.
- [ ] O design possui acabamento premium e identidade própria, aprovado pelo checklist de §13.4.
- [ ] Boas práticas de acessibilidade aplicadas: contraste, labels, teclado, foco visível, ARIA quando apropriado, significado não dependente apenas de cor.

### 15.7 Ajuda e privacidade

- [ ] Guia do usuário existe em `/app/help`, com os cinco passos e FAQ.
- [ ] Ajuda contextual existe nos pontos relevantes (TAP, EAP, WIP, o que cada framework gera).
- [ ] Página `/privacy` existe e cobre os pontos de §14.9.

### 15.8 Segurança, qualidade e entrega

- [ ] Nenhuma credencial está versionada.
- [ ] Nenhuma credencial, stack trace ou conteúdo de especificação é exposto em respostas ou logs.
- [ ] Logs seguem a política de sanitização.
- [ ] Testes críticos passam (contratos, transformações, validação, proteção contra respostas inválidas, geração de exportação).
- [ ] Lint passa.
- [ ] Typecheck passa.
- [ ] Build de produção passa.
- [ ] Aplicação publicada e acessível no ambiente de produção definido.
- [ ] Banco de produção configurado corretamente, contendo apenas os modelos necessários.
- [ ] Documentação do projeto atualizada.

### 15.9 Objetivo final verificável

- [ ] Um usuário consegue, de ponta a ponta: criar conta → entrar → enviar especificação em PDF ou texto → selecionar Scrum, Kanban ou Cascata → gerar os artefatos adequados → visualizar o resultado em interface premium e responsiva → exportar em PDF ou texto, **sem que sua especificação seja armazenada permanentemente pela aplicação**.

---

## 16. Métricas de Sucesso

Métricas propostas para o MVP. Nenhuma meta quantitativa é fixada agora: todas são marcadas como **Meta a definir após baseline**. Nenhuma métrica exige armazenar conteúdo de especificação — todas se baseiam em metadados operacionais permitidos pela política de logs (§14.6).

### 16.1 Métricas de eficácia do produto

| Métrica | Definição | Meta |
|---|---|---|
| Percentual de gerações concluídas | Gerações finalizadas com resultado válido ÷ gerações iniciadas | Meta a definir após baseline |
| Taxa de erro de geração | Gerações encerradas em erro ÷ gerações iniciadas, segmentada por tipo (indisponibilidade, timeout, falha de contrato) | Meta a definir após baseline |
| Taxa de recuperação de resposta inválida | Falhas de contrato recuperadas com sucesso ÷ total de falhas de contrato | Meta a definir após baseline |
| Tempo médio de geração | Duração média do pipeline completo, por framework | Meta a definir após baseline |

### 16.2 Métricas de entrada

| Métrica | Definição | Meta |
|---|---|---|
| Distribuição PDF vs. texto | Proporção de gerações por tipo de entrada | Meta a definir após baseline |
| Taxa de bloqueio por validação | Entradas bloqueadas antes do envio à IA ÷ tentativas, por motivo (vazio, inválido, acima do limite, PDF sem texto) | Meta a definir após baseline |
| Taxa de abandono por PDF sem texto | Sessões que terminam após o erro de PDF sem texto, sem alternar para entrada por texto | Meta a definir após baseline |

### 16.3 Métricas de uso

| Métrica | Definição | Meta |
|---|---|---|
| Uso por framework | Distribuição das gerações entre Scrum, Kanban e Cascata | Meta a definir após baseline |
| Exportações por geração | Exportações realizadas ÷ gerações concluídas, segmentado por PDF e texto | Meta a definir após baseline |
| Conclusão do fluxo completo | Sessões que vão de entrada até exportação ÷ sessões que iniciam um planejamento | Meta a definir após baseline |
| Retorno de usuários | Usuários que realizam mais de uma geração em períodos distintos | Meta a definir após baseline |

### 16.4 Métricas de funil de ativação

| Métrica | Definição | Meta |
|---|---|---|
| Cadastro a partir da landing | Contas criadas ÷ visitantes da landing | Meta a definir após baseline |
| Ativação | Usuários que concluem a primeira geração ÷ contas criadas | Meta a definir após baseline |
| Tempo até a primeira geração | Intervalo entre criação da conta e primeira geração concluída | Meta a definir após baseline |

### 16.5 Métricas operacionais e de custo

| Métrica | Definição | Meta |
|---|---|---|
| Custo médio por geração | Custo de IA por geração concluída, por framework | Meta a definir após baseline |
| Volume médio de entrada processada | Tamanho aproximado do texto processado por geração | Meta a definir após baseline |
| Uso em mobile | Proporção de sessões por classe de dispositivo | Meta a definir após baseline |

### 16.6 Qualidade percebida

A qualidade do conteúdo gerado não é diretamente mensurável por telemetria sem acessar o resultado, o que a política de privacidade do produto não permite. Para o MVP, a avaliação de qualidade é feita por **revisão manual com especificações de teste próprias**, não por coleta de dados de usuários. Mecanismos de feedback explícito do usuário sobre a qualidade não fazem parte do MVP (ver §20).

---

## 17. Riscos do Produto

| ID | Risco | Impacto | Mitigação conceitual |
|---|---|---|---|
| RP-01 | **Alucinação da IA** — invenção de requisitos, stakeholders, datas, prazos ou regras de negócio | Perda de confiança e decisões de projeto baseadas em informação inexistente | Regra explícita de não invenção; marcação obrigatória de ausência ("Não identificado na especificação."); etapa dedicada de consolidação que verifica possíveis informações inventadas; contratos estruturados por framework; comunicação de que o resultado deve ser revisado |
| RP-02 | **Especificações incompletas** — documento pobre gera planejamento pobre | Usuário atribui ao produto a limitação do insumo | Declarar ausências em vez de preenchê-las; comunicar no guia que a qualidade do resultado depende da especificação; manter a mensagem de revisão humana |
| RP-03 | **Documentos excessivamente grandes** | Falha de processamento, lentidão e custo elevado | Verificação de volume antes de qualquer chamada à IA; limites definidos pela aplicação; mensagem orientando redução ou divisão do conteúdo |
| RP-04 | **Custo da API de IA** | Inviabilidade econômica do uso aberto | Bloqueio antecipado de entradas incompatíveis; rate limiting preparado; pipeline linear sem reprocessamento; exportação sem nova chamada à IA; acompanhamento de custo por geração (§16.5) |
| RP-05 | **Erros de interpretação da especificação** | Artefatos corretos em forma, mas errados em conteúdo | Separação entre extração e estruturação, com contrato intermediário auditável; consolidação verificando consistência e duplicidade; revisão humana como parte explícita do fluxo de uso |
| RP-06 | **Privacidade e confidencialidade** — exposição de conteúdo sensível | Risco reputacional e de adoção; impedimento de uso corporativo | Não armazenamento de PDF, texto integral, prompts e respostas; processamento temporário; logs sanitizados; chamadas de IA server-side; comunicação clara em `/privacy` e junto à entrada |
| RP-07 | **Qualidade variável da entrada** — PDFs mal formatados, texto desorganizado, conteúdo não técnico | Resultado inconsistente ou vazio | Validações de entrada; mensagens específicas por tipo de problema; alternativa de entrada por texto sempre disponível; ausências declaradas em vez de inferidas |
| RP-08 | **Dependência de serviços externos** — IA, banco e hospedagem | Indisponibilidade do produto por falha de terceiro | Tratamento explícito de indisponibilidade e timeout com mensagem compreensível e nova tentativa; configuração de modelo e limites centralizada, facilitando ajuste; arquitetura passível de reavaliação futura |
| RP-09 | **Perda do resultado por não haver persistência** — fechamento de aba, expiração de sessão ou recarga | Retrabalho e consumo adicional de IA | Resultado disponível durante a sessão; incentivo claro à exportação ao final do fluxo; comunicação de que não há histórico no MVP (ver §20) |
| RP-10 | **Expectativa de substituição do gerente de projetos** | Uso inadequado do resultado em decisão de projeto | Mensagem de apoio e não substituição no guia, no FAQ e na interface; passo explícito "Revise" no guia de uso |
| RP-11 | **Percepção de protótipo** — interface sem acabamento reduz confiança para enviar documento sensível | Baixa adoção apesar de funcionalidade correta | Design premium como requisito de produto; checklist de qualidade visual por página; validação mobile obrigatória |
| RP-12 | **Resposta fora de contrato de forma recorrente** | Falhas intermitentes de geração | Validação em todas as etapas; recuperação controlada com limite de tentativas; registro sanitizado para diagnóstico; métrica de taxa de recuperação (§16.1) |
| RP-13 | **PDFs escaneados sem suporte no MVP** | Frustração de parte dos usuários | Mensagem amigável e orientação imediata para alternativa por texto; OCR registrado como evolução futura |

---

## 18. Dependências

Dependências de produto, sem detalhamento arquitetural (ver `ARCHITECTURE.md`).

### 18.1 Dependências externas

| Dependência | Papel no produto | Observação |
|---|---|---|
| **Serviço de IA (Claude API)** | Interpretação da especificação e estruturação dos artefatos pelos três agentes | Dependência crítica: sem ela não há geração. Acesso somente server-side |
| **Plataforma de hospedagem (Vercel)** | Execução e publicação da aplicação, com deploy automático a partir do repositório | Infraestrutura principal do MVP, junto ao banco gerenciado |
| **Banco de dados gerenciado (PostgreSQL / Neon)** | Dados de autenticação e operação básica | Não é repositório de especificações, projetos ou artefatos |
| **Repositório de código (GitHub)** | Versionamento e gatilho de deploy | Nenhuma credencial versionada |

### 18.2 Dependências funcionais internas

| Dependência | Papel no produto |
|---|---|
| **Autenticação** | Habilita toda a área autenticada; sem ela, nenhum fluxo de geração é acessível |
| **Extração de texto de PDF** | Habilita a entrada por PDF; sua ausência restringe o produto à entrada por texto |
| **Contratos estruturados por etapa e framework** | Condição para exibir qualquer resultado como válido |
| **Geração de exportações** | Condição para o usuário levar o resultado para fora do produto, especialmente por não haver histórico |
| **Persistência temporária de sessão no navegador** | Condição para navegar pelo resultado e exportá-lo sem reprocessamento |

### 18.3 Dependências de conteúdo

| Dependência | Papel no produto |
|---|---|
| **Textos de ajuda dos frameworks** | Apoiam a decisão do usuário na etapa obrigatória de seleção |
| **Conteúdo do guia rápido e FAQ** | Sustentam o uso autônomo e comunicam limites e privacidade |
| **Texto da página de privacidade** | Sustenta a proposta de valor de privacidade; deve refletir apenas o que é tecnicamente garantido |

### 18.4 Dependências explicitamente excluídas

Orquestradores externos (n8n, Make, Zapier), VPS própria, serviço de OCR, armazenamento de arquivos e ferramentas externas de gestão não são dependências do MVP.

### 18.5 Dependência condicional

Serviço transacional de email: necessário apenas se a recuperação de senha por email entrar no MVP (§6.9 e §20).

---

## 19. Evoluções Futuras

Roadmap conceitual. Nenhum item desta seção pertence ao escopo atual; estão registrados porque a arquitetura deve permitir sua adoção futura sem reescrita completa.

| Evolução | Descrição conceitual |
|---|---|
| **Histórico de planejamentos** | Consulta a planejamentos anteriores, com decisão explícita de retenção e consentimento, dado o compromisso atual de não persistência |
| **Workspaces** | Agrupamento de projetos de um mesmo usuário ou contexto |
| **Organizações** | Times e empresas, com múltiplos usuários |
| **Integrações com ferramentas de gestão** | Jira, Azure DevOps, Trello, ClickUp |
| **Exportação PPTX** | Principalmente para o material de Kick-off |
| **Conexão com ferramentas externas** | Envio dos artefatos gerados para sistemas já utilizados pelo usuário |
| **Integração com Project Risk AI** | Envio do projeto planejado para acompanhamento de riscos e Health Score |
| **OCR / PDFs escaneados** | Ampliação dos tipos de documento aceitos |
| **Feedback de qualidade pelo usuário** | Mecanismo explícito de avaliação do resultado gerado, hoje inexistente por restrição de privacidade |

> A arquitetura deve permitir a futura introdução de entidades como Projects, ProjectVersions, GeneratedArtifacts e Organizations sem reescrita completa — sem que essas entidades sejam criadas no MVP.

---

## 20. Open Questions

Apenas decisões de produto que a especificação deixou genuinamente abertas. Pontos já definidos pela especificação são considerados fechados e não constam aqui.

**OQ-001 — Recuperação de senha entra no MVP?**
A especificação condiciona a decisão: a recuperação de senha por email deve fazer parte do MVP se a implementação for simples e não gerar dependência excessiva, e deve ser adiada para a fase imediatamente posterior se exigir contratação ou configuração de serviço transacional adicional.
*Pendente:* confirmar a decisão após a avaliação técnica da Fase 0/1. Impacta §5.2, §6.9, §15.1 e §18.5.

**OQ-002 — Qual formato de exportação de texto: `.txt` ou `.md`?**
A especificação admite ambos e instrui escolher "a opção mais adequada à experiência final", sem fechar a escolha.
*Pendente:* definir um formato (ou oferecer ambos, o que amplia levemente o escopo de exportação). Impacta RF-055 e §15.5.

**OQ-003 — Quais são os limites numéricos de entrada?**
A especificação exige verificar tamanho e volume antes de chamar a IA e impedir requisições "claramente incompatíveis com os limites definidos pela aplicação", sem definir esses limites.
*Pendente:* definir tamanho máximo de arquivo, volume máximo de texto aceito e o limite mínimo de conteúdo útil, bem como as mensagens correspondentes. Impacta RF-021, RF-022, FE-03, FE-04 e RP-03.

**OQ-004 — Qual é o comportamento exato de descarte do resultado temporário?**
A especificação determina preferência por `sessionStorage` e que "ao encerrar a sessão ou aba conforme o comportamento definido, os dados temporários devem poder ser descartados", sem definir esse comportamento.
*Pendente:* definir se o resultado sobrevive a recarga da página e à navegação para outra rota da aplicação, e se há descarte explícito no logout e por ação do usuário. Impacta RF-053, RNF-013, FE-13 e RP-09.

**OQ-005 — Quantas tentativas de recuperação em caso de resposta fora do contrato?**
A especificação exige limitar a quantidade de tentativas e evitar loops, sem fixar o número.
*Pendente:* definir o limite de tentativas e o tempo máximo total aceitável de geração antes de apresentar falha ao usuário. Impacta RF-034, RNF-029 e FE-07/FE-08.

**OQ-006 — O rate limiting fica ativo no MVP ou apenas preparado?**
A especificação pede "rate limiting preparado", o que admite tanto estrutura pronta e inativa quanto limitação efetivamente aplicada.
*Pendente:* definir se há limite ativo por usuário e por período no MVP, e qual. Impacta RNF-007 e RP-04.

**OQ-007 — Qual é o idioma de saída quando a especificação está em outro idioma?**
A especificação, o produto e todos os textos de interface estão em português, mas nada define o comportamento quando o documento enviado está em outro idioma.
*Pendente:* definir se os artefatos são gerados sempre em português, no idioma do documento de origem, ou se o usuário escolhe. Impacta RF-029 a RF-047 e as mensagens de interface.

**OQ-008 — Em que condições a IA pode adaptar as colunas do quadro Kanban?**
A especificação define a estrutura inicial padrão e permite adaptação "quando a especificação justificar claramente outro fluxo", sem definir o critério de "claramente".
*Pendente:* definir se a adaptação exige menção explícita de um fluxo de trabalho na especificação e se a justificativa da adaptação deve ser exibida ao usuário, como ocorre com os limites de WIP. Impacta RF-040 e §11.2.

---

## Rastreabilidade com a especificação original

| Seção deste PRD | Seções da especificação original |
|---|---|
| §1 Visão do Produto | 1, 2, 3.1, 3.4, 20 |
| §2 Problema | 1, 2, 8 |
| §3 Público-Alvo | 2 |
| §4 Proposta de Valor | 1, 2, 3, 8, 62 |
| §5 Escopo do MVP | 11, 14 a 19, 20 a 25, 26 a 40, 41 a 57, 58 a 61, 72 a 79 |
| §6 Fora do Escopo | 6, 12, 13, 16, 40, 101 |
| §7 Fluxo Principal | 41 a 53, 81, 82, 87 |
| §8 Requisitos Funcionais | 11 a 57, 75 a 82 |
| §9 Requisitos Não Funcionais | 58 a 61, 62 a 74, 77 a 79, 82, 95 a 97 |
| §10 Regras de Negócio | 3.1, 3.2, 3.3, 8, 9, 13, 17, 18, 29, 30, 35, 37 a 39, 51, 53, 78, 79 |
| §11 Artefatos por Framework | 19, 26 a 40 |
| §12 Requisitos de UX | 44 a 50, 54 a 57, 73, 75, 81 |
| §13 Requisitos Visuais | 62 a 73, 96 |
| §14 Privacidade e Segurança | 8, 9, 75 a 79 |
| §15 Critérios de Aceitação | 95, 97, 105, 106 |
| §16 Métricas de Sucesso | 2, 78, 85 |
| §17 Riscos do Produto | 3.2, 8, 16, 17, 81, 82 |
| §18 Dependências | 4, 5, 7, 10, 79, 98 |
| §19 Evoluções Futuras | 13, 40, 102 |
| §20 Open Questions | 9, 12, 17, 33, 52, 77, 82 |

---

**Fim do documento.**
Próximos documentos da Fase 0 (não iniciados): `ARCHITECTURE.md`, `USER_FLOW.md`, `DESIGN_SYSTEM.md`, `AI_AGENTS.md`, `DATA_PRIVACY.md`, `USER_GUIDE.md`, `ROADMAP.md`.
