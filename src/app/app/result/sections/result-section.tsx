import type { ReactNode } from "react";

/**
 * Seção titulada do resultado (TAP, EAP, Backlog…). O título nunca fica
 * sozinho no fim de uma página impressa (`print:break-after-avoid`).
 * Compartilhada por todos os frameworks — e pelo Planejamento Híbrido
 * (v1.1), que combina seções da Cascata com as de Scrum ou Kanban.
 */
export function ResultSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="text-foreground text-lg font-semibold print:break-after-avoid">
        {title}
      </h2>
      {children}
    </section>
  );
}
