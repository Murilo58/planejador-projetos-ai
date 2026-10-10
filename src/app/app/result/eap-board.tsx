import type { EapDeliverable } from "@/lib/ai/schemas/waterfall";

/**
 * Hierarquia visual da EAP (RF-051): cada entregável de alto nível é uma
 * "caixa"; os subentregáveis aparecem como chips dentro dela — o
 * contêiner comunica a relação pai-filho sem precisar de uma biblioteca
 * de diagramação.
 */
export function EapBoard({ deliverables }: { deliverables: EapDeliverable[] }) {
  return (
    // Impressão usa Flexbox, não Grid, pelo mesmo motivo já diagnosticado
    // no Material de Kick-off: `break-inside: avoid` (e a própria
    // fragmentação entre páginas) não é confiável em itens de CSS Grid
    // multi-linha nos motores de impressão do Chromium — o sintoma é
    // exatamente o relatado aqui (páginas com espaços vazios
    // significativos). 2 colunas no print (não 3): a mesma largura de
    // A4 já mostrou ser estreita demais para 3 colunas no Kick-off.
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 print:flex print:flex-wrap">
      {deliverables.map((deliverable) => (
        <div
          key={deliverable.name}
          className="border-border bg-muted/30 rounded-lg border p-4 print:shrink-0 print:grow-0 print:basis-[calc(50%-0.5rem)] print:break-inside-avoid"
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
