import { cn } from "@/lib/utils";

const STEPS = [
  { number: 1, label: "Especificação" },
  { number: 2, label: "Framework" },
  { number: 3, label: "Confirmação" },
] as const;

/** Comunica sempre em que etapa o usuário está (RNF-031). */
export function StepIndicator({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol className="flex items-center gap-2 text-sm sm:gap-4">
      {STEPS.map((step, index) => {
        const isCurrent = step.number === current;
        const isDone = step.number < current;
        return (
          <li key={step.number} className="flex items-center gap-2 sm:gap-4">
            {index > 0 ? (
              <span
                aria-hidden
                className={cn(
                  "h-px w-4 sm:w-8",
                  isDone || isCurrent ? "bg-primary" : "bg-border",
                )}
              />
            ) : null}
            <span className="flex items-center gap-1.5">
              <span
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full text-xs font-medium",
                  isCurrent
                    ? "bg-primary text-primary-foreground"
                    : isDone
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {step.number}
              </span>
              <span
                className={cn(
                  "hidden font-medium sm:inline",
                  isCurrent ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
