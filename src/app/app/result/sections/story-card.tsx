import { Card, CardContent } from "@/components/ui/card";
import { Disclosure } from "@/components/results/disclosure";
import { PriorityBadge } from "@/components/results/priority-badge";
import type { ScrumOutput } from "@/lib/ai/schemas/scrum";

/** História do backlog priorizado (Scrum e Cascata + Scrum). */
export function StoryCard({
  position,
  story,
}: {
  /** Posição no backlog, a partir de 1 (a ordem é a prioridade). */
  position: number;
  story: ScrumOutput["backlog"][number];
}) {
  return (
    <Card className="p-5 print:break-inside-avoid">
      <CardContent className="flex flex-col gap-3 p-0">
        <div className="flex items-start gap-3">
          <span className="bg-accent text-accent-foreground flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold">
            {position}
          </span>
          <div className="flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h3 className="text-foreground font-semibold">{story.title}</h3>
              <div className="flex shrink-0 gap-1.5">
                <PriorityBadge level={story.businessValue} label="Valor" />
                <PriorityBadge level={story.complexity} label="Complexidade" />
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
  );
}
