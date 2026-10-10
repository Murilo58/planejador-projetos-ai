import Link from "next/link";

import { Container } from "@/components/layout/container";

export function SiteFooter() {
  return (
    <footer className="border-border/60 bg-background border-t">
      <Container className="text-muted-foreground flex flex-col gap-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} Planejador de Projetos AI. Ferramenta de
          apoio à estruturação — o resultado deve ser revisado pelo responsável
          pelo projeto.
        </p>
        <Link
          href="/privacy"
          className="text-foreground hover:text-primary font-medium transition-colors"
        >
          Política de privacidade
        </Link>
      </Container>
    </footer>
  );
}
