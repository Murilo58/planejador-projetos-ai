import { FileUp, ListChecks, Sparkles } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const STEPS = [
  {
    icon: FileUp,
    title: "Envie",
    description:
      "Faça upload de um PDF com texto selecionável ou cole o conteúdo técnico diretamente no campo de especificação.",
  },
  {
    icon: ListChecks,
    title: "Escolha",
    description:
      "Selecione manualmente o framework de trabalho: Scrum, Kanban ou Cascata. A IA não decide por você.",
  },
  {
    icon: Sparkles,
    title: "Gere",
    description:
      "A aplicação interpreta a especificação e estrutura os artefatos correspondentes ao framework escolhido.",
  },
] as const;

export function HowItWorks() {
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
          {STEPS.map((step, index) => (
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
