import { Container } from "@/components/layout/container";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FRAMEWORKS } from "@/lib/frameworks";
import {
  HYBRID_PLANNING_OVERVIEW,
  isHybridPlanningEnabled,
} from "@/lib/hybrid/frameworks";

export function FrameworksSection() {
  // Feature flag avaliada no servidor. Esta página é estática: o valor
  // vale a partir do build — mudar a flag exige um novo deploy (o que já
  // é o caso de qualquer variável de ambiente na Vercel).
  const showHybrid = isHybridPlanningEnabled();

  return (
    <section id="frameworks" className="bg-muted/40 py-20 sm:py-28">
      <Container>
        <div className="flex flex-col gap-3 text-center">
          <h2 className="text-primary text-sm font-semibold tracking-wide uppercase">
            Frameworks suportados
          </h2>
          <p className="text-foreground text-3xl font-semibold tracking-tight sm:text-4xl">
            Você escolhe o framework. A IA estrutura o conteúdo.
          </p>
          <p className="text-muted-foreground mx-auto max-w-2xl text-base">
            A seleção é sempre manual e obrigatória. Cada framework produz
            exclusivamente os artefatos definidos para ele — nenhum artefato
            adicional é gerado.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {FRAMEWORKS.map((framework) => (
            <Card key={framework.id} className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{framework.name}</CardTitle>
                  <Badge variant="secondary">{framework.tagline}</Badge>
                </div>
                <CardDescription className="pt-2 text-sm leading-relaxed">
                  {framework.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
          {/* Planejamento Híbrido (v1.1): linha inteira abaixo dos três
              frameworks, sem alterar a grade deles. */}
          {showHybrid ? (
            <Card className="h-full sm:col-span-3">
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-xl">
                    {HYBRID_PLANNING_OVERVIEW.name}
                  </CardTitle>
                  <Badge variant="secondary">
                    {HYBRID_PLANNING_OVERVIEW.tagline}
                  </Badge>
                </div>
                <CardDescription className="pt-2 text-sm leading-relaxed">
                  {HYBRID_PLANNING_OVERVIEW.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
