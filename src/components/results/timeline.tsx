import { cn } from "@/lib/utils";

export interface TimelineItem {
  title: string;
  description?: string;
  meta?: string;
}

/**
 * Timeline vertical genérica — compartilhada pelo cronograma macro do
 * Scrum (Sprints) e da Cascata (fases), já que ambos são, na essência,
 * a mesma estrutura: uma sequência nomeada com descrição e dependências
 * (PRD §49/§50 — "visão macro do cronograma" / "timeline ou estrutura
 * equivalente").
 */
export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="flex flex-col">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <li key={item.title} className="flex gap-4 print:break-inside-avoid">
            <div className="flex flex-col items-center">
              <span className="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                {index + 1}
              </span>
              {!isLast ? (
                <span aria-hidden className="bg-border w-px flex-1" />
              ) : null}
            </div>
            <div className={cn("pb-6", isLast && "pb-0")}>
              <p className="text-foreground pt-1 font-medium">{item.title}</p>
              {item.description ? (
                <p className="text-muted-foreground mt-0.5 text-sm">
                  {item.description}
                </p>
              ) : null}
              {item.meta ? (
                <p className="text-muted-foreground mt-1 text-xs">
                  {item.meta}
                </p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
