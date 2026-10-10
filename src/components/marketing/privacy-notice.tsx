import Link from "next/link";
import { ShieldCheck } from "lucide-react";

import { Container } from "@/components/layout/container";

export function PrivacyNotice() {
  return (
    <section id="privacidade" className="py-20 sm:py-28">
      <Container className="flex flex-col items-center gap-6 text-center">
        <span className="bg-accent text-accent-foreground inline-flex size-12 items-center justify-center rounded-full">
          <ShieldCheck className="size-6" />
        </span>
        <h2 className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
          Privacidade
        </h2>
        <p className="text-muted-foreground max-w-2xl text-base leading-relaxed">
          Sua especificação é utilizada apenas durante o processamento e não é
          armazenada permanentemente pelo Planejador de Projetos AI. O arquivo
          original não é retido, e a especificação não compõe nenhum histórico.
        </p>
        <Link
          href="/privacy"
          className="text-primary text-sm font-semibold underline-offset-4 hover:underline"
        >
          Saiba mais sobre privacidade
        </Link>
      </Container>
    </section>
  );
}
