import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";

const NAV_LINKS = [
  { href: "#como-funciona", label: "Como funciona" },
  { href: "#frameworks", label: "Frameworks" },
  { href: "#privacidade", label: "Privacidade" },
] as const;

/**
 * Cabeçalho da área pública (landing). A navegação e os links de
 * login/cadastro são implementados em suas rotas reais na Etapa 2 —
 * por ora apontam para /login e /register.
 */
export function SiteHeader() {
  return (
    <header className="border-border/60 bg-background/80 sticky top-0 z-40 w-full border-b backdrop-blur-sm">
      <Container className="flex h-16 items-center justify-between">
        <Link
          href="/"
          className="font-heading text-foreground flex items-center gap-2 text-base font-semibold tracking-tight"
        >
          <span className="gradient-ai inline-flex size-7 items-center justify-center rounded-lg text-sm font-bold text-white">
            P
          </span>
          <span className="hidden sm:inline">Planejador de Projetos AI</span>
        </Link>

        <nav className="text-muted-foreground hidden items-center gap-6 text-sm md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-foreground transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            render={<Link href="/login">Entrar</Link>}
          />
          <Button
            size="sm"
            render={<Link href="/register">Criar conta</Link>}
          />
        </div>
      </Container>
    </header>
  );
}
