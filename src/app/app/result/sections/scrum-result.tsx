import type { ScrumOutput } from "@/lib/ai/schemas/scrum";

import { FirstSprintCard } from "./first-sprint-card";
import { ResultSection } from "./result-section";
import { StoryCard } from "./story-card";
import { TimelineCard } from "./timeline-card";

export function ScrumResult({ data }: { data: ScrumOutput }) {
  return (
    <div className="flex flex-col gap-8">
      <ResultSection title="Backlog priorizado">
        <div className="mt-4 flex flex-col gap-4">
          {data.backlog.map((story, index) => (
            <StoryCard key={story.title} position={index + 1} story={story} />
          ))}
        </div>
      </ResultSection>

      <ResultSection title="Primeira Sprint sugerida">
        <FirstSprintCard
          storyTitles={data.firstSprint.selectedStoryTitles}
          rationale={data.firstSprint.rationale}
        />
      </ResultSection>

      <ResultSection title="Cronograma macro">
        <TimelineCard
          items={data.macroSchedule.sprints.map((sprint) => ({
            title: sprint.name,
            description: sprint.focus,
            meta:
              sprint.dependencies.length > 0
                ? `Dependências: ${sprint.dependencies.join(", ")}`
                : undefined,
          }))}
        />
      </ResultSection>
    </div>
  );
}
