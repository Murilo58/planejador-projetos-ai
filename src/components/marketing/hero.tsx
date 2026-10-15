import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { getPlanningCopy } from "@/lib/planning-copy";

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#0b1220] text-white">
      {/* Destaque de identidade (índigo → violeta), reservado ao hero — PRD §13.3 */}
      <div
        aria-hidden
        className="gradient-ai absolute -top-40 right-[-10%] size-[32rem] rounded-full opacity-20 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -bottom-32 left-[-10%] size-[24rem] rounded-full bg-[#4f46e5] opacity-10 blur-3xl"
      />

      <Container className="relative flex flex-col items-start gap-6 py-24 sm:py-32">
        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium text-white/80">
          <Sparkles className="size-3.5" />
          Apoio por Inteligência Artificial
        </span>

        <h1 className="max-w-3xl text-4xl leading-tight font-semibold tracking-tight sm:text-5xl sm:leading-tight">
          Transforme especificações técnicas em artefatos estruturados de gestão
          de projetos com Inteligência Artificial.
        </h1>

        <p className="max-w-2xl text-lg leading-relaxed text-white/70">
          {getPlanningCopy().heroDescription}
        </p>

        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <Button
            size="lg"
            className="h-11 px-6 text-base"
            render={
              <Link href="/register">
                Criar conta
                <ArrowRight className="size-4" data-icon="inline-end" />
              </Link>
            }
          />
          <Button
            size="lg"
            variant="outline"
            className="h-11 border-white/20 bg-transparent px-6 text-base text-white hover:bg-white/10 hover:text-white"
            render={<Link href="/login">Entrar</Link>}
          />
        </div>

        <p className="pt-1 text-sm text-white/50">
          A escolha do framework é sempre sua. A IA estrutura o conteúdo dentro
          das regras do framework selecionado.
        </p>
      </Container>
    </section>
  );
}
