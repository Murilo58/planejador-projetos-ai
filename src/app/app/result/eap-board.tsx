import type { EapDeliverable } from "@/lib/ai/schemas/waterfall";

/**
 * Hierarquia visual da EAP (RF-051): cada entregável de alto nível é uma
 * "caixa"; os subentregáveis aparecem como chips dentro dela — o
 * contêiner comunica a relação pai-filho sem precisar de uma biblioteca
 * de diagramação.
 */
export function EapBoard({ deliverables }: { deliverables: EapDeliverable[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {deliverables.map((deliverable) => (
        <div
          key={deliverable.name}
          className="border-border bg-muted/30 rounded-lg border p-4"
        >
          <p className="text-foreground font-medium">{deliverable.name}</p>
          {deliverable.subDeliverables &&
          deliverable.subDeliverables.length > 0 ? (
            <ul className="mt-3 flex flex-col gap-1.5">
              {deliverable.subDeliverables.map((sub) => (
                <li
                  key={sub.name}
                  className="bg-card text-muted-foreground ring-border rounded-md px-2.5 py-1.5 text-sm ring-1"
                >
                  {sub.name}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}
    </div>
  );
}
