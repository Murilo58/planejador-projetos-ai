import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { signOutAction } from "@/lib/auth/actions";

/** Cabeçalho da área autenticada (/app/*). */
export function AppHeader({ userEmail }: { userEmail: string }) {
  return (
    <header className="border-border/60 bg-background/80 sticky top-0 z-40 w-full border-b backdrop-blur-sm print:hidden">
      <Container className="flex h-16 items-center justify-between">
        <Link
          href="/app"
          className="font-heading text-foreground flex items-center gap-2 text-base font-semibold tracking-tight"
        >
          <span className="gradient-ai inline-flex size-7 items-center justify-center rounded-lg text-sm font-bold text-white">
            P
          </span>
          <span className="hidden sm:inline">Planejador de Projetos AI</span>
        </Link>

        <div className="flex items-center gap-3">
          <span className="text-muted-foreground hidden text-sm sm:inline">
            {userEmail}
          </span>
          <form action={signOutAction}>
            <Button type="submit" variant="ghost" size="sm">
              Sair
            </Button>
          </form>
        </div>
      </Container>
    </header>
  );
}
