import { Card, CardContent } from "@/components/ui/card";
import type { WaterfallOutput } from "@/lib/ai/schemas/waterfall";

import { FieldValue, ListField } from "../field-value";

/** TAP — Termo de Abertura do Projeto (Cascata e Planejamento Híbrido). */
export function TapCard({ tap }: { tap: WaterfallOutput["tap"] }) {
  return (
    <Card className="mt-4 overflow-hidden p-0">
      <div className="border-border bg-muted/40 border-b px-5 py-3">
        <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          Termo de Abertura do Projeto
        </p>
      </div>
      <CardContent className="flex flex-col gap-4 p-5 text-sm">
        <div>
          <p className="text-foreground font-medium">Objetivo</p>
          <FieldValue value={tap.objective} />
        </div>
        <div>
          <p className="text-foreground font-medium">Escopo resumido</p>
          <FieldValue value={tap.scopeSummary} />
        </div>
        <div className="bg-border h-px" />
        {/* Impressão em Flexbox, não Grid — mesmo motivo do EapBoard
            e do Material de Kick-off: evita páginas com espaços
            vazios causadas pela fragmentação pouco confiável de
            CSS Grid multi-linha nos motores de impressão. */}
        <div className="grid gap-4 sm:grid-cols-2 print:flex print:flex-wrap">
          <div className="print:shrink-0 print:grow-0 print:basis-[calc(50%-0.5rem)] print:break-inside-avoid">
            <ListField label="Stakeholders" items={tap.stakeholders} />
          </div>
          <div className="print:shrink-0 print:grow-0 print:basis-[calc(50%-0.5rem)] print:break-inside-avoid">
            <ListField
              label="Critérios de sucesso"
              items={tap.successCriteria}
            />
          </div>
          <div className="print:shrink-0 print:grow-0 print:basis-[calc(50%-0.5rem)] print:break-inside-avoid">
            <ListField label="Premissas" items={tap.assumptions} />
          </div>
          <div className="print:shrink-0 print:grow-0 print:basis-[calc(50%-0.5rem)] print:break-inside-avoid">
            <ListField label="Restrições" items={tap.constraints} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
