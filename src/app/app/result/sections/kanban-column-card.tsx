import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { PriorityBadge } from "@/components/results/priority-badge";
import type { KanbanOutput } from "@/lib/ai/schemas/kanban";

type Column = KanbanOutput["columns"][number];
type Item = KanbanOutput["items"][number];

export function KanbanColumnCard({
  column,
  items,
}: {
  column: Column;
  items: Item[];
}) {
  return (
    <Card className="flex h-full flex-col p-4 print:h-auto print:break-inside-avoid-page">
      <CardContent className="flex flex-1 flex-col gap-3 p-0">
        <div className="flex items-center justify-between gap-2 print:break-after-avoid">
          <h3 className="text-foreground font-semibold">{column.name}</h3>
          <Badge variant="secondary">WIP: {column.wipLimit}</Badge>
        </div>
        <p className="text-muted-foreground text-xs">
          {column.wipJustification}
        </p>

        {/* Rolagem vertical independente por coluna (ex.: Backlog com
            muitos itens) — sem isso, uma coluna longa estica o board
            inteiro e força rolagem da página toda. `min-h-0` é
            necessário para o overflow funcionar dentro de um flex
            column. Na impressão, não há rolagem possível em papel — o
            limite de altura é removido para que nada fique cortado. */}
        <div className="flex max-h-[520px] min-h-0 flex-1 flex-col gap-2 overflow-y-auto print:max-h-none print:overflow-visible">
          {items.length === 0 ? (
            <p className="border-border text-muted-foreground rounded-lg border border-dashed p-4 text-center text-sm">
              Nenhum item nesta coluna.
            </p>
          ) : (
            items.map((item) => (
              <div
                key={item.title}
                className="border-border bg-card rounded-lg border p-3 print:break-inside-avoid"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-foreground text-sm font-medium">
                    {item.title}
                  </p>
                  <PriorityBadge level={item.priority} />
                </div>
                <p className="text-muted-foreground text-xs">{item.type}</p>
                <p className="text-muted-foreground mt-1 text-sm">
                  {item.description}
                </p>
                {item.dependency ? (
                  <p className="text-muted-foreground mt-1 text-xs">
                    Dependência: {item.dependency}
                  </p>
                ) : null}
                {item.note ? (
                  <p className="text-muted-foreground mt-1 text-xs">
                    Obs.: {item.note}
                  </p>
                ) : null}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
