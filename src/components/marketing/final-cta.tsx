import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";

export function FinalCta() {
  return (
    <section className="bg-muted/40 py-20 sm:py-28">
      <Container className="flex flex-col items-center gap-6 text-center">
        <h2 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
          Comece seu primeiro planejamento
        </h2>
        <p className="text-muted-foreground max-w-xl text-base">
          Crie sua conta, envie uma especificação e veja o resultado estruturado
          em poucos minutos.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button
            size="lg"
            className="h-11 px-6 text-base"
            render={<Link href="/register">Criar conta</Link>}
          />
          <Button
            size="lg"
            variant="outline"
            className="h-11 px-6 text-base"
            render={<Link href="/login">Entrar</Link>}
          />
        </div>
      </Container>
    </section>
  );
}
