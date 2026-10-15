import { TriangleAlert } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { HybridVariant } from "@/lib/ai/schemas/hybrid";
import type { TraceabilityMatrix } from "@/lib/hybrid/traceability";

import { ResultSection } from "./result-section";

/**
 * Rastreabilidade EAP ↔ execução ágil (requisito obrigatório da v1.1):
 * uma linha por folha da EAP, com fases, marcos e itens vinculados. As
 * lacunas aparecem como pontos de atenção para revisão — nunca como erro.
 * A matriz é sempre recalculada do pacote (`buildTraceabilityMatrix`).
 */
export function TraceabilitySection({
  matrix,
  variant,
}: {
  matrix: TraceabilityMatrix;
  variant: HybridVariant;
}) {
  const { summary, rows, attentionPoints } = matrix;
  const itemsLabel = variant === "scrum" ? "Histórias" : "Itens Kanban";
  const linkedLabel =
    variant === "scrum" ? "histórias vinculadas" : "itens vinculados";

  return (
    <ResultSection title="Rastreabilidade EAP ↔ execução">
      <p className="text-muted-foreground mt-1 text-sm">
        Entregáveis com {linkedLabel}: {summary.leavesWithItems} de{" "}
        {summary.leaves} · {itemsLabel}: {summary.items} · Marcos associados à
        EAP: {summary.milestonesWithEap} de {summary.milestones}
      </p>

      {/* Rolagem horizontal só dentro do cartão, nunca da página: em
          telas estreitas a tabela mantém uma largura mínima legível. Na
          impressão, a tabela ocupa a largura da página e cada linha
          fica inteira numa página. */}
      <Card className="mt-4 overflow-hidden p-0">
        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full min-w-[640px] text-left text-sm print:min-w-0">
            <thead className="bg-muted/40 text-muted-foreground text-xs tracking-wide uppercase">
              <tr>
                <th scope="col" className="px-4 py-3 font-medium">
                  EAP
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Entregável
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Fases
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  Marcos
                </th>
                <th scope="col" className="px-4 py-3 font-medium">
                  {itemsLabel}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.code}
                  className="border-border border-t align-top print:break-inside-avoid"
                >
                  <td className="text-primary px-4 py-3 font-semibold tabular-nums">
                    {row.code}
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-foreground font-medium">
                      {row.subDeliverable?.name ?? row.deliverable.name}
                    </p>
                    {row.subDeliverable ? (
                      <p className="text-muted-foreground text-xs">
                        em {row.deliverable.code} {row.deliverable.name}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <RefList
                      refs={row.phases}
                      empty="Nenhuma fase"
                      warnWhenEmpty
                    />
                  </td>
                  <td className="px-4 py-3">
                    <RefList refs={row.milestones} empty="—" />
                  </td>
                  <td className="px-4 py-3">
                    <RefList
                      refs={row.items.map(({ id, title }) => ({
                        id,
                        name: title,
                      }))}
                      empty="Sem vínculo — revisar"
                      warnWhenEmpty
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <AttentionPoints
        messages={attentionPoints.map((point) => point.message)}
      />
    </ResultSection>
  );
}

function RefList({
  refs,
  empty,
  warnWhenEmpty = false,
}: {
  refs: Array<{ id: string; name: string }>;
  empty: string;
  warnWhenEmpty?: boolean;
}) {
  if (refs.length === 0) {
    return (
      <span
        className={
          warnWhenEmpty
            ? "text-warning text-xs font-medium"
            : "text-muted-foreground text-xs"
        }
      >
        {empty}
      </span>
    );
  }
  return (
    <ul className="flex flex-col gap-1">
      {refs.map((ref) => (
        <li key={ref.id} className="text-muted-foreground text-xs">
          <span className="text-foreground font-semibold">{ref.id}</span>{" "}
          {ref.name}
        </li>
      ))}
    </ul>
  );
}

function AttentionPoints({ messages }: { messages: string[] }) {
  if (messages.length === 0) {
    return (
      <p className="text-muted-foreground mt-4 text-sm">
        Nenhum ponto de atenção: todos os entregáveis da EAP têm itens
        vinculados, e fases e marcos estão associados à EAP.
      </p>
    );
  }

  return (
    <Card className="border-warning/40 bg-warning/5 mt-4 p-5 print:break-inside-avoid">
      <CardContent className="flex flex-col gap-3 p-0">
        <div className="flex items-center gap-2">
          <TriangleAlert className="text-warning size-4 shrink-0" />
          <p className="text-foreground font-medium">
            Pontos de atenção para revisão ({messages.length})
          </p>
        </div>
        <p className="text-muted-foreground text-xs">
          Lacunas de vínculo a revisar — não são erros. Um entregável
          documental, por exemplo, pode legitimamente não ter item ágil.
        </p>
        <ul className="text-foreground list-disc space-y-1 pl-5 text-sm">
          {messages.map((message) => (
            <li key={message}>{message}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
