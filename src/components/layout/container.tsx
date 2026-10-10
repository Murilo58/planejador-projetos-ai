import type * as React from "react";

import { cn } from "@/lib/utils";

/**
 * Largura máxima de conteúdo consistente entre seções (PRD §13.3.5).
 * Abstração única e deliberadamente simples: evita repetir a mesma
 * className em cada seção da landing page.
 */
export function Container({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6", className)}
      {...props}
    />
  );
}
