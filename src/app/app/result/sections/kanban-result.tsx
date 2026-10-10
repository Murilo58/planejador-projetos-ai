"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";
import type { KanbanOutput } from "@/lib/ai/schemas/kanban";

import { KanbanColumnCard } from "./kanban-column-card";

/**
 * Quadro Kanban (PRD §49/RF-050): no desktop, colunas horizontais lado a
 * lado; no mobile, uma coluna por vez via tabs — nunca um board inteiro
 * rolando horizontalmente na tela pequena.
 */
export function KanbanResult({ data }: { data: KanbanOutput }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeColumn = data.columns[activeIndex];

  function itemsFor(columnName: string) {
    return data.items.filter((item) => item.column === columnName);
  }

  return (
    <div>
      {/* Mobile: seletor de coluna (sem scroll horizontal do quadro). */}
      <div
        role="tablist"
        aria-label="Colunas do quadro"
        className="mb-4 flex flex-wrap gap-1.5 sm:hidden print:hidden"
      >
        {data.columns.map((column, index) => (
          <button
            key={column.name}
            type="button"
            role="tab"
            aria-selected={activeIndex === index}
            onClick={() => setActiveIndex(index)}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
              activeIndex === index
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:text-foreground",
            )}
          >
            {column.name}
          </button>
        ))}
      </div>
      <div className="sm:hidden print:hidden">
        {activeColumn ? (
          <KanbanColumnCard
            column={activeColumn}
            items={itemsFor(activeColumn.name)}
          />
        ) : null}
      </div>

      {/* Desktop/tablet: colunas em uma única linha, cada uma ocupando o
          espaço disponível (flex-1) entre um mínimo e um máximo legível —
          preenche a largura em vez de deixar margem sobrando, e só rola
          horizontalmente quando as colunas realmente não cabem (RF-050).
          Na impressão, isso é substituído por uma pilha vertical (ver
          abaixo). */}
      <div className="hidden gap-4 overflow-x-auto pb-2 sm:flex print:hidden">
        {data.columns.map((column) => (
          <div key={column.name} className="max-w-[380px] min-w-[280px] flex-1">
            <KanbanColumnCard column={column} items={itemsFor(column.name)} />
          </div>
        ))}
      </div>

      {/* Impressão: colunas em pilha, cada uma usando a largura total da
          página — não um grid lado a lado. Paginação de grid/flex-wrap em
          CSS varia de forma imprevisível entre motores de impressão de
          navegador; um fluxo em bloco simples quebra entre páginas de
          forma previsível em qualquer um deles, usa 100% da largura da
          página (sem sobra) e, combinado com `break-inside-avoid` nos
          cards e `break-after-avoid` no cabeçalho de cada coluna
          (kanban-column-card.tsx), evita cortar itens no meio e reduz
          páginas quase vazias. */}
      <div className="hidden print:flex print:flex-col print:gap-4">
        {data.columns.map((column) => (
          <KanbanColumnCard
            key={column.name}
            column={column}
            items={itemsFor(column.name)}
          />
        ))}
      </div>
    </div>
  );
}
