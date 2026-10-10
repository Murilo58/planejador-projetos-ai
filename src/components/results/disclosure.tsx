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
      {isOpen ? <div className="mt-2 pl-6">{children}</div> : null}
    </div>
  );
}
