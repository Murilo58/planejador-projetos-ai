import { FileUp, ListChecks, Sparkles } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPlanningCopy } from "@/lib/planning-copy";

// O passo "Escolha" depende da feature flag do Planejamento Híbrido
// (lida no servidor) — por isso os passos são montados na renderização.
const stepsFor = (chooseStepDescription: string) =>
  [
    {
      icon: FileUp,
      title: "Envie",
      description:
        "Faça upload de um PDF com texto selecionável ou cole o conteúdo técnico diretamente no campo de especificação.",
    },
    {
      icon: ListChecks,
      title: "Escolha",
      description: chooseStepDescription,
    },
    {
      icon: Sparkles,
      title: "Gere",
      description:
        "A aplicação interpreta a especificação e estrutura os artefatos correspondentes ao framework escolhido.",
    },
  ] as const;

export function HowItWorks() {
  const steps = stepsFor(getPlanningCopy().chooseStepDescription);
  return (
    <section id="como-funciona" className="py-20 sm:py-28">
      <Container>
        <div className="flex flex-col gap-3 text-center">
          <h2 className="text-primary text-sm font-semibold tracking-wide uppercase">
            Como funciona
          </h2>
          <p className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
            Envie → Escolha → Gere
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {steps.map((step, index) => (
            <Card key={step.title} className="relative">
              <CardHeader>
                <span className="text-muted-foreground absolute top-4 right-4 text-xs font-medium">
                  0{index + 1}
                </span>
                <span className="bg-accent text-accent-foreground inline-flex size-10 items-center justify-center rounded-lg">
                  <step.icon className="size-5" />
                </span>
                <CardTitle className="pt-2 text-lg">{step.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground text-sm leading-relaxed">
                {step.description}
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  );
}
