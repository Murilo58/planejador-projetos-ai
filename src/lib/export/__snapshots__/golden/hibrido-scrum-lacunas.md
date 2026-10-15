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

### F3 · Operação assistida

Marcos:
- M3 Encerramento

## Backlog priorizado

### 1. Agendar consulta online

Vínculo: US-02 · EAP 1 Módulo de agendamento

Como recepcionista, quero agendar consulta online, para atender melhor.

Valor de negócio: alta · Complexidade: media

Critérios de aceite:
- Critério verificável derivado da especificação

Justificativa da prioridade: Base para as demais funcionalidades.

### 2. Gerar relatório | faltas

Vínculo: US-03 · EAP 2 Relatório de faltas

Como recepcionista, quero gerar relatório de faltas, para atender melhor.

Valor de negócio: alta · Complexidade: media

Critérios de aceite:
- Critério verificável derivado da especificação

Justificativa da prioridade: Base para as demais funcionalidades.

## Primeira Sprint sugerida

- US-02 · Agendar consulta online

A agenda é pré-requisito do agendamento.

## Planejamento macro das Sprints

### Sprint 1

Agenda

Histórias: US-02

## Rastreabilidade EAP ↔ execução

Entregáveis com histórias vinculadas: 1 de 3 · Histórias: 2 · Marcos associados à EAP: 2 de 3

| EAP | Entregável | Fases | Marcos | Histórias |
| --- | --- | --- | --- | --- |
| 1.1 | Agenda por profissional (em 1 Módulo de agendamento) | F1 Construção | M2 Produção nas três unidades | Sem vínculo — revisar |
| 1.2 | Agendamento online (em 1 Módulo de agendamento) | F1 Construção | M1 Homologação na unidade Centro; M2 Produção nas três unidades | Sem vínculo — revisar |
| 2 | Relatório de faltas | F2 Implantação | M2 Produção nas três unidades | US-03 Gerar relatório \| faltas |

### Pontos de atenção para revisão

Lacunas de vínculo a revisar — não são erros. Um entregável documental, por exemplo, pode legitimamente não ter item ágil.

- 1.1 Agenda por profissional: nenhum item de execução vinculado. Revise se é esperado (ex.: entregável documental) ou se falta trabalho no backlog.
- 1.2 Agendamento online: nenhum item de execução vinculado. Revise se é esperado (ex.: entregável documental) ou se falta trabalho no backlog.
- US-02 está vinculado ao entregável 1 Módulo de agendamento, e não a um de seus subentregáveis — vínculo menos preciso.
- Fase F3 Operação assistida: não produz nenhum entregável da EAP.
- Marco M3 Encerramento: não está associado a nenhum entregável da EAP.
- US-03 Gerar relatório | faltas: não está prevista em nenhuma Sprint do cronograma macro.
