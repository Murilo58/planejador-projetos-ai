import type { ReactNode } from "react";

/**
 * Identificação do resultado (framework, título, data de geração) —
 * visível também no PDF, como exige RF-054. As ações (exportação) ficam
 * à direita e se ocultam sozinhas na impressão.
 */
export function ResultHeader({
  frameworkLabel,
  generatedAt,
  actions,
}: {
  frameworkLabel: string;
  generatedAt: string;
  actions: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <p className="text-primary text-sm font-semibold tracking-wide uppercase">
          {frameworkLabel}
        </p>
        <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
          Resultado do planejamento
        </h1>
        <p className="text-muted-foreground text-sm">
          Gerado em {new Date(generatedAt).toLocaleString("pt-BR")}
        </p>
      </div>
      {actions}
    </div>
  );
}
