"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import type { ConsolidatedResult } from "@/lib/ai/schemas/result";
import { loadResultFromSession } from "@/lib/result/storage";
import { cn } from "@/lib/utils";

import { ExportActions } from "./export-actions";
import { CascataResult } from "./sections/cascata-result";
import { KanbanResult } from "./sections/kanban-result";
import { ScrumResult } from "./sections/scrum-result";

const FRAMEWORK_LABEL: Record<ConsolidatedResult["framework"], string> = {
  scrum: "Scrum",
  kanban: "Kanban",
  cascata: "Cascata",
};

/**
 * O resultado só existe em `sessionStorage` (RNF-012) — por isso esta
 * leitura acontece no cliente, após a montagem, nunca no servidor.
 *
 * O cabeçalho abaixo (framework, título, data de geração) permanece
 * visível também na exportação em PDF — é exatamente a identificação
 * exigida por RF-054 — enquanto os botões de exportação e as observações
 * de validação ficam ocultos na impressão (`print:hidden`).
 */
export function ResultView() {
  const [result, setResult] = useState<ConsolidatedResult | null | "loading">(
    "loading",
  );

  useEffect(() => {
    // Leitura única de sessionStorage (indisponível durante SSR) — não é
    // uma assinatura reativa, por isso o padrão genérico do lint não se
    // aplica aqui.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setResult(loadResultFromSession());
  }, []);

  if (result === "loading") {
    return null;
  }

  if (!result) {
    return (
      <Container>
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <p className="text-foreground text-lg font-medium">
            Nenhum resultado disponível nesta sessão.
          </p>
          <p className="text-muted-foreground max-w-md text-sm">
            O resultado só fica disponível durante a sessão em que foi gerado.
            Crie um novo planejamento para visualizá-lo aqui.
          </p>
          <Button
            size="lg"
            className="h-11 px-6 text-base"
            render={<Link href="/app/new">Criar novo planejamento</Link>}
          />
        </div>
      </Container>
    );
  }

  // Kanban (colunas) e Cascata (grid do Material de Kick-off) precisam
  // de mais largura do que o `max-w-6xl` (1152px) padrão do Container
  // para distribuir seus cards horizontalmente sem cortes em telas
  // desktop comuns — por isso o próprio limite externo do Container é
  // sobrescrito para ~95% da viewport nesses dois casos. A Cascata ainda
  // mantém TAP/EAP/Cronograma na largura de leitura (max-w-3xl) por
  // dentro — ver cascata-result.tsx; só o Kick-off usa o espaço extra.
  // Scrum continua exatamente como antes: Container no seu max-w-6xl
  // padrão, com o `max-w-3xl` interno abaixo.
  const isWideLayout =
    result.framework === "kanban" || result.framework === "cascata";

  return (
    <Container
      className={cn(isWideLayout && "max-w-[95vw]", "print:max-w-none")}
    >
      <div
        className={cn(
          "flex flex-col gap-8",
          !isWideLayout && "mx-auto w-full max-w-3xl",
        )}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-primary text-sm font-semibold tracking-wide uppercase">
              {FRAMEWORK_LABEL[result.framework]}
            </p>
            <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
              Resultado do planejamento
            </h1>
            <p className="text-muted-foreground text-sm">
              Gerado em {new Date(result.generatedAt).toLocaleString("pt-BR")}
            </p>
          </div>
          <ExportActions result={result} />
        </div>

        {result.framework === "scrum" ? (
          <ScrumResult data={result.data} />
        ) : null}
        {result.framework === "kanban" ? (
          <KanbanResult data={result.data} />
        ) : null}
        {result.framework === "cascata" ? (
          <CascataResult data={result.data} />
        ) : null}

        {result.notes.length > 0 ? (
          <details className="border-border bg-muted/40 rounded-lg border p-4 text-sm print:hidden">
            <summary className="text-foreground cursor-pointer font-medium">
              Observações da validação ({result.notes.length})
            </summary>
            <ul className="text-muted-foreground mt-2 list-disc space-y-1 pl-5">
              {result.notes.map((note) => (
                <li key={note}>{note}</li>
              ))}
            </ul>
          </details>
        ) : null}
      </div>
    </Container>
  );
}
