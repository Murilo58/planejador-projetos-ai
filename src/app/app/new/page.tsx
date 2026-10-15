import type { Metadata } from "next";

import { auth } from "@/auth";
import { AppHeader } from "@/components/layout/app-header";
import { Container } from "@/components/layout/container";
import { isHybridPlanningEnabled } from "@/lib/hybrid/frameworks";

import { NewPlanningWizard } from "./new-planning-wizard";

export const metadata: Metadata = {
  title: "Novo planejamento — Planejador de Projetos AI",
};

/**
 * Teto explícito de duração para as 3 Server Actions dos agentes de IA
 * chamadas nesta página (Extração, Estruturação, Consolidação) — cada
 * uma é uma invocação de Function independente (RF-081/FE-07), nunca a
 * soma das três. Pior caso real por etapa: 60s × 2 tentativas + até 5s
 * de espera entre elas = 125s (`AI_CONFIG` em `src/lib/ai/config.ts`);
 * 150s dá ~20% de folga sem depender do padrão implícito da plataforma
 * (hoje 300s no Hobby/Pro). As etapas do Planejamento Híbrido seguem o
 * mesmo teto por tentativa (`AI_CONFIG.timeoutMs`), então o mesmo limite
 * vale para elas.
 */
export const maxDuration = 150;

export default async function NewPlanningPage() {
  const session = await auth();
  const userEmail = session?.user?.email ?? "";

  return (
    <>
      <AppHeader userEmail={userEmail} />
      <main className="bg-muted/30 flex-1 py-12 sm:py-16">
        <Container className="max-w-3xl">
          <div className="mb-8">
            <h1 className="text-foreground text-2xl font-semibold tracking-tight sm:text-3xl">
              Novo planejamento
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Envie sua especificação e escolha o framework de trabalho.
            </p>
          </div>

          <NewPlanningWizard hybridEnabled={isHybridPlanningEnabled()} />
        </Container>
      </main>
    </>
  );
}
