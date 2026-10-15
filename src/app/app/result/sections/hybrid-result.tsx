import type { HybridPackage } from "@/lib/ai/schemas/hybrid";
import { buildTraceabilityMatrix } from "@/lib/hybrid/traceability";

import { EapBoard } from "../eap-board";
import { FirstSprintCard } from "./first-sprint-card";
import { KanbanResult } from "./kanban-result";
import { ResultSection } from "./result-section";
import { StoryCard } from "./story-card";
import { TapCard } from "./tap-card";
import { TimelineCard } from "./timeline-card";
import { TraceabilitySection } from "./traceability-section";

/**
 * Resultado do Planejamento Híbrido (v1.1): governança preditiva (TAP,
 * EAP codificada, cronograma de fases e marcos) seguida da execução ágil
 * — Scrum ou Kanban — e da matriz de rastreabilidade entre as duas.
 * Reaproveita as seções da Cascata e do Scrum/Kanban; sem Kick-off.
 */
export function HybridResult({ pkg }: { pkg: HybridPackage }) {
  const { data } = pkg;
  const eapNames = eapNameIndex(pkg);
  const eapRef = (code: string) =>
    `EAP ${code}${eapNames.has(code) ? ` ${eapNames.get(code)}` : ""}`;

  return (
    <div className="flex flex-col gap-8">
      {/* Mesma largura de leitura da Cascata para os artefatos textuais;
          o quadro Kanban e a matriz usam o espaço extra. */}
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <ResultSection title="TAP — Termo de Abertura do Projeto">
          <TapCard tap={data.tap} />
        </ResultSection>

        <ResultSection title="EAP — Estrutura Analítica do Projeto">
          <div className="mt-4">
            <EapBoard deliverables={data.eap.deliverables} />
          </div>
        </ResultSection>

        <ResultSection title="Cronograma macro — fases e marcos">
          <TimelineCard
            items={data.schedule.phases.map((phase) => ({
              title: `${phase.id} · ${phase.name}`,
              description:
                phase.milestones.length > 0
                  ? `Marcos: ${phase.milestones
                      .map(
                        (milestone) =>
                          `${milestone.id} ${milestone.name}${
                            milestone.eapCodes.length > 0
                              ? ` (EAP ${milestone.eapCodes.join(", ")})`
                              : ""
                          }`,
                      )
                      .join("; ")}`
                  : undefined,
              meta:
                [
                  phase.eapCodes.length > 0
                    ? `Entregáveis: ${phase.eapCodes.join(", ")}`
                    : null,
                  phase.dependencies.length > 0
                    ? `Dependências: ${phase.dependencies.join(", ")}`
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · ") || undefined,
            }))}
          />
        </ResultSection>

        {pkg.variant === "scrum" ? (
          <>
            <ResultSection title="Backlog priorizado">
              <div className="mt-4 flex flex-col gap-4">
                {pkg.data.backlog.map((story, index) => (
                  <StoryCard
                    key={story.id}
                    position={index + 1}
                    story={story}
                    reference={`${story.id} · ${eapRef(story.eapCode)}`}
                  />
                ))}
              </div>
            </ResultSection>

            <ResultSection title="Primeira Sprint sugerida">
              <FirstSprintCard
                storyTitles={pkg.data.firstSprint.selectedStoryIds.map((id) => {
                  const story = pkg.data.backlog.find((item) => item.id === id);
                  return story ? `${id} · ${story.title}` : id;
                })}
                rationale={pkg.data.firstSprint.rationale}
              />
            </ResultSection>

            <ResultSection title="Planejamento macro das Sprints">
              <TimelineCard
                items={pkg.data.macroSchedule.sprints.map((sprint) => ({
                  title: sprint.name,
                  description: sprint.focus,
                  meta:
                    [
                      sprint.storyIds.length > 0
                        ? `Histórias: ${sprint.storyIds.join(", ")}`
                        : null,
                      sprint.dependencies.length > 0
                        ? `Dependências: ${sprint.dependencies.join(", ")}`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" · ") || undefined,
                }))}
              />
            </ResultSection>
          </>
        ) : null}
      </div>

      {pkg.variant === "kanban" ? (
        <ResultSection title="Quadro Kanban">
          <div className="mt-4">
            <KanbanResult
              data={{
                columns: pkg.data.columns,
                items: pkg.data.items.map((item) => ({
                  ...item,
                  reference: `${item.id} · ${eapRef(item.eapCode)}`,
                })),
              }}
            />
          </div>
        </ResultSection>
      ) : null}

      <div className="mx-auto w-full max-w-6xl">
        <TraceabilitySection
          matrix={buildTraceabilityMatrix(pkg)}
          variant={pkg.variant}
        />
      </div>
    </div>
  );
}

function eapNameIndex(pkg: HybridPackage): Map<string, string> {
  const names = new Map<string, string>();
  for (const deliverable of pkg.data.eap.deliverables) {
    names.set(deliverable.code, deliverable.name);
    for (const sub of deliverable.subDeliverables ?? []) {
      names.set(sub.code, sub.name);
    }
  }
  return names;
}
