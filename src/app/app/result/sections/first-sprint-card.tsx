import { Rocket } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

/**
 * Primeira Sprint sugerida. Recebe os títulos já resolvidos: o Scrum os
 * traz prontos; o Planejamento Híbrido seleciona por id de história.
 */
export function FirstSprintCard({
  storyTitles,
  rationale,
}: {
  storyTitles: string[];
  rationale: string;
}) {
  return (
    <Card className="border-primary/30 bg-accent/40 mt-4 p-5 print:break-inside-avoid">
      <CardContent className="flex flex-col gap-3 p-0">
        <div className="flex items-center gap-2">
          <span className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-full">
            <Rocket className="size-4" />
          </span>
          <p className="text-foreground font-medium">
            {storyTitles.length} histórias selecionadas
          </p>
        </div>
        <ul className="text-foreground list-disc space-y-1 pl-5 text-sm">
          {storyTitles.map((title) => (
            <li key={title}>{title}</li>
          ))}
        </ul>
        <p className="text-muted-foreground text-sm">{rationale}</p>
      </CardContent>
    </Card>
  );
}
