"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

/** Bloco expansível com microinteração sutil (RF-049 / PRD §73). */
export function Disclosure({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        aria-expanded={isOpen}
        className="text-foreground flex items-center gap-1.5 text-sm font-medium"
      >
        <ChevronDown
          className={cn(
            "text-muted-foreground size-4 transition-transform",
            isOpen && "rotate-180",
          )}
        />
        {title}
      </button>
      {/* Sempre no DOM (nunca desmontado) para que a impressão mostre o
          conteúdo mesmo que o usuário nunca tenha expandido o bloco na
          tela — `window.print()` não pode exibir o que não existe no
          DOM. `hidden`/`block` controla a tela conforme `isOpen`;
          `print:block` força a exibição na impressão independente
          disso. */}
      <div className={cn("mt-2 pl-6", isOpen ? "block" : "hidden print:block")}>
        {children}
      </div>
    </div>
  );
}
