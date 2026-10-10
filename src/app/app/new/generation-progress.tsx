import { Check, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

export type GenerationStage = "extraction" | "structuring" | "consolidation";

const STAGES: { id: GenerationStage; label: string }[] = [
  { id: "extraction", label: "Interpretando especificação" },
  { id: "structuring", label: "Estruturando planejamento" },
  { id: "consolidation", label: "Validando artefatos" },
];

/**
 * Progresso da geração (RF-032): nunca apenas um spinner — mostra as três
 * etapas nomeadas do pipeline, sem expor prompt, raciocínio interno ou
 * detalhes da API de IA.
 */
export function GenerationProgress({ stage }: { stage: GenerationStage }) {
  const currentIndex = STAGES.findIndex((item) => item.id === stage);

  return (
    <ol className="flex flex-col gap-3" aria-live="polite">
      {STAGES.map((item, index) => {
        const isDone = index < currentIndex;
        const isActive = index === currentIndex;
        return (
          <li key={item.id} className="flex items-center gap-3">
            <span
              className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-full",
                isDone && "bg-primary text-primary-foreground",
                isActive && "bg-accent text-accent-foreground",
                !isDone && !isActive && "bg-muted text-muted-foreground",
              )}
            >
              {isDone ? (
                <Check className="size-3.5" />
              ) : isActive ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <span className="size-1.5 rounded-full bg-current" />
              )}
            </span>
            <span
              className={cn(
                "text-sm",
                isActive
                  ? "text-foreground font-medium"
                  : isDone
                    ? "text-foreground"
                    : "text-muted-foreground",
              )}
            >
              {item.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
