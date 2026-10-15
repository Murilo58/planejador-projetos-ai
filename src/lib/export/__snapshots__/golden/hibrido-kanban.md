# Planejamento Híbrido — Cascata + Kanban

Gerado por Planejador de Projetos AI em 09/10/2026, 09:00:00.

## TAP — Termo de Abertura do Projeto

**Objetivo:** Permitir o agendamento online de consultas.

**Escopo resumido:** Agendamento online, agendas por unidade e relatórios.

**Stakeholders:**
- Diretoria da clínica
- Recepcionistas

**Critérios de sucesso:** Não identificado na especificação.

**Premissas:**
- Serviço de e-mail já contratado

**Restrições:**
- Atender à LGPD

## EAP — Estrutura Analítica do Projeto

- 1 Módulo de agendamento
  - 1.1 Agenda por profissional
  - 1.2 Agendamento online
- 2 Relatório de faltas

## Cronograma macro — fases e marcos

### F1 · Construção

Entregáveis: 1

Marcos:
- M1 Homologação na unidade Centro (EAP 1.2)

### F2 · Implantação

Entregáveis: 2

Marcos:
- M2 Produção nas três unidades (EAP 1, 2)

Dependências: Construção concluída

## Quadro Kanban

### Backlog

WIP: Sem limite — coluna de entrada — Coluna de entrada.

- **Agendamento online** (funcionalidade, prioridade alta)
  Vínculo: KB-02 · EAP 1.2 Agendamento online
  Agendamento online, conforme a especificação.
- **Relatório de faltas** (funcionalidade, prioridade alta)
  Vínculo: KB-03 · EAP 2 Relatório de faltas
  Relatório de faltas, conforme a especificação.

### Em Andamento

WIP: 2 — Evita multitarefa, sem assumir tamanho de equipe.

- **Configurar agenda** (funcionalidade, prioridade alta)
  Vínculo: KB-01 · EAP 1.1 Agenda por profissional
  Configurar agenda, conforme a especificação.

## Rastreabilidade EAP ↔ execução

Entregáveis com itens vinculados: 3 de 3 · Itens Kanban: 3 · Marcos associados à EAP: 2 de 2

| EAP | Entregável | Fases | Marcos | Itens Kanban |
| --- | --- | --- | --- | --- |
| 1.1 | Agenda por profissional (em 1 Módulo de agendamento) | F1 Construção | M2 Produção nas três unidades | KB-01 Configurar agenda |
| 1.2 | Agendamento online (em 1 Módulo de agendamento) | F1 Construção | M1 Homologação na unidade Centro; M2 Produção nas três unidades | KB-02 Agendamento online |
| 2 | Relatório de faltas | F2 Implantação | M2 Produção nas três unidades | KB-03 Relatório de faltas |

### Pontos de atenção para revisão

Nenhum ponto de atenção: todos os entregáveis da EAP têm itens vinculados, e fases e marcos estão associados à EAP.
