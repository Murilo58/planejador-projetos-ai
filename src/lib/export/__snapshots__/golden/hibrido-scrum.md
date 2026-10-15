# Planejamento Híbrido — Cascata + Scrum

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

## Backlog priorizado

### 1. Configurar agenda

Vínculo: US-01 · EAP 1.1 Agenda por profissional

Como recepcionista, quero configurar agenda, para atender melhor.

Valor de negócio: alta · Complexidade: media

Critérios de aceite:
- Critério verificável derivado da especificação

Justificativa da prioridade: Base para as demais funcionalidades.

### 2. Agendar consulta online

Vínculo: US-02 · EAP 1.2 Agendamento online

Como recepcionista, quero agendar consulta online, para atender melhor.

Valor de negócio: alta · Complexidade: media

Critérios de aceite:
- Critério verificável derivado da especificação

Justificativa da prioridade: Base para as demais funcionalidades.

### 3. Gerar relatório de faltas

Vínculo: US-03 · EAP 2 Relatório de faltas

Como recepcionista, quero gerar relatório de faltas, para atender melhor.

Valor de negócio: alta · Complexidade: media

Critérios de aceite:
- Critério verificável derivado da especificação

Justificativa da prioridade: Base para as demais funcionalidades.

## Primeira Sprint sugerida

- US-01 · Configurar agenda

A agenda é pré-requisito do agendamento.

## Planejamento macro das Sprints

### Sprint 1

Agenda

Histórias: US-01

### Sprint 2

Agendamento e relatório

Histórias: US-02, US-03

Dependências: US-01

## Rastreabilidade EAP ↔ execução

Entregáveis com histórias vinculadas: 3 de 3 · Histórias: 3 · Marcos associados à EAP: 2 de 2

| EAP | Entregável | Fases | Marcos | Histórias |
| --- | --- | --- | --- | --- |
| 1.1 | Agenda por profissional (em 1 Módulo de agendamento) | F1 Construção | M2 Produção nas três unidades | US-01 Configurar agenda |
| 1.2 | Agendamento online (em 1 Módulo de agendamento) | F1 Construção | M1 Homologação na unidade Centro; M2 Produção nas três unidades | US-02 Agendar consulta online |
| 2 | Relatório de faltas | F2 Implantação | M2 Produção nas três unidades | US-03 Gerar relatório de faltas |

### Pontos de atenção para revisão

Nenhum ponto de atenção: todos os entregáveis da EAP têm itens vinculados, e fases e marcos estão associados à EAP.
