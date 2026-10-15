import { Card, CardContent } from "@/components/ui/card";
import { Timeline, type TimelineItem } from "@/components/results/timeline";

/**
 * Cronograma macro em cartão — Sprints do Scrum, fases da Cascata e, no
 * Planejamento Híbrido, ambos. Quem chama decide como mapear seus dados
 * para `TimelineItem`.
 */
export function TimelineCard({ items }: { items: TimelineItem[] }) {
  return (
    <Card className="mt-4 p-5">
      <CardContent className="p-0">
        <Timeline items={items} />
      </CardContent>
    </Card>
  );
}
