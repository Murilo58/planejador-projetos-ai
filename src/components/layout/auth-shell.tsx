import Link from "next/link";
import type { ReactNode } from "react";

import { getPlanningCopy } from "@/lib/planning-copy";

/**
 * Layout compartilhado por /login e /register — RF-010: a tela de
 * autenticação não pode ser apenas "logo + formulário branco centralizado".
 * Painel escuro com identidade de marca à esquerda (oculto em telas
 * pequenas) + formulário à direita.
 */
export function AuthShell({
  title,
  subtitle,
  message,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  message: string;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-[#0b1220] p-10 text-white lg:flex lg:w-1/2">
        <div
          aria-hidden
          className="gradient-ai absolute -top-32 right-[-15%] size-[28rem] rounded-full opacity-20 blur-3xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-24 left-[-10%] size-[20rem] rounded-full bg-[#4f46e5] opacity-10 blur-3xl"
        />

        <Link
          href="/"
          className="font-heading relative flex items-center gap-2 text-base font-semibold tracking-tight"
        >
          <span className="gradient-ai inline-flex size-7 items-center justify-center rounded-lg text-sm font-bold text-white">
            P
          </span>
          Planejador de Projetos AI
        </Link>

        <p className="relative max-w-md text-2xl leading-snug font-medium text-white/90">
          {message}
        </p>

        <p className="relative text-sm text-white/50">
          {getPlanningCopy().authTagline}
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-sm">
          <Link
            href="/"
            className="font-heading text-foreground mb-10 flex items-center gap-2 text-base font-semibold tracking-tight lg:hidden"
          >
            <span className="gradient-ai inline-flex size-7 items-center justify-center rounded-lg text-sm font-bold text-white">
              P
            </span>
            Planejador de Projetos AI
          </Link>

          <h1 className="text-foreground text-2xl font-semibold tracking-tight">
            {title}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">{subtitle}</p>

          <div className="mt-8">{children}</div>

          <div className="text-muted-foreground mt-6 text-sm">{footer}</div>
        </div>
      </div>
    </div>
  );
}
