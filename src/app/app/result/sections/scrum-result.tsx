import { Rocket } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Disclosure } from "@/components/results/disclosure";
import { PriorityBadge } from "@/components/results/priority-badge";
import { Timeline } from "@/components/results/timeline";
import type { ScrumOutput } from "@/lib/ai/schemas/scrum";

export function ScrumResult({ data }: { data: ScrumOutput }) {
  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="text-foreground text-lg font-semibold print:break-after-avoid">
          Backlog priorizado
        </h2>
        <div className="mt-4 flex flex-col gap-4">
          {data.backlog.map((story, index) => (
            <Card key={story.title} className="p-5 print:break-inside-avoid">
              <CardContent className="flex flex-col gap-3 p-0">
                <div className="flex items-start gap-3">
                  <span className="bg-accent text-accent-foreground flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h3 className="text-foreground font-semibold">
                        {story.title}
                      </h3>
                      <div className="flex shrink-0 gap-1.5">
                        <PriorityBadge
                          level={story.businessValue}
                          label="Valor"
                        />
                        <PriorityBadge
                          level={story.complexity}
                          label="Complexidade"
                        />
                      </div>
                    </div>
                    <p className="text-muted-foreground mt-1 text-sm">
                      {story.statement}
                    </p>
                  </div>
                </div>

                <Disclosure
                  title={`Critérios de aceite (${story.acceptanceCriteria.length})`}
                >
                  <ul className="text-muted-foreground list-disc space-y-1 pl-4 text-sm">
                    {story.acceptanceCriteria.map((criterion) => (
                      <li key={criterion}>{criterion}</li>
                    ))}
                  </ul>
                </Disclosure>

                <p className="text-muted-foreground pl-10 text-xs">
                  Justificativa: {story.priorityJustification}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-foreground text-lg font-semibold print:break-after-avoid">
          Primeira Sprint sugerida
        </h2>
        <Card className="border-primary/30 bg-accent/40 mt-4 p-5 print:break-inside-avoid">
          <CardContent className="flex flex-col gap-3 p-0">
            <div className="flex items-center gap-2">
              <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-full">
                <Rocket className="size-4" />
              </span>
              <p className="text-foreground font-medium">
                {data.firstSprint.selectedStoryTitles.length} histórias
                selecionadas
              </p>
            </div>
            <ul className="text-foreground list-disc space-y-1 pl-5 text-sm">
              {data.firstSprint.selectedStoryTitles.map((title) => (
                <li key={title}>{title}</li>
              ))}
            </ul>
            <p className="text-muted-foreground text-sm">
              {data.firstSprint.rationale}
            </p>
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="text-foreground text-lg font-semibold print:break-after-avoid">
          Cronograma macro
        </h2>
        <Card className="mt-4 p-5">
          <CardContent className="p-0">
            <Timeline
              items={data.macroSchedule.sprints.map((sprint) => ({
                title: sprint.name,
                description: sprint.focus,
                meta:
                  sprint.dependencies.length > 0
                    ? `Dependências: ${sprint.dependencies.join(", ")}`
                    : undefined,
              }))}
            />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
