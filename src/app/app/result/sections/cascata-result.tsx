import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Timeline } from "@/components/results/timeline";
import type { WaterfallOutput } from "@/lib/ai/schemas/waterfall";

import { EapBoard } from "../eap-board";
import { FieldValue, ListField } from "../field-value";

export function CascataResult({ data }: { data: WaterfallOutput }) {
  return (
    <div className="flex flex-col gap-8">
      {/* TAP, EAP e cronograma mantêm a largura de leitura confortável
          (max-w-3xl) mesmo com o container externo mais largo — esse
          espaço extra (ver result-view.tsx) existe apenas para o grid
          do Kick-off abaixo, não para estes três. */}
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <section>
          <h2 className="text-foreground text-lg font-semibold">
            TAP — Termo de Abertura do Projeto
          </h2>
          <Card className="mt-4 overflow-hidden p-0">
            <div className="border-border bg-muted/40 border-b px-5 py-3">
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Termo de Abertura do Projeto
              </p>
            </div>
            <CardContent className="flex flex-col gap-4 p-5 text-sm">
              <div>
                <p className="text-foreground font-medium">Objetivo</p>
                <FieldValue value={data.tap.objective} />
              </div>
              <div>
                <p className="text-foreground font-medium">Escopo resumido</p>
                <FieldValue value={data.tap.scopeSummary} />
              </div>
              <div className="bg-border h-px" />
              <div className="grid gap-4 sm:grid-cols-2">
                <ListField label="Stakeholders" items={data.tap.stakeholders} />
                <ListField
                  label="Critérios de sucesso"
                  items={data.tap.successCriteria}
                />
                <ListField label="Premissas" items={data.tap.assumptions} />
                <ListField label="Restrições" items={data.tap.constraints} />
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-foreground text-lg font-semibold">
            EAP — Estrutura Analítica do Projeto
          </h2>
          <div className="mt-4">
            <EapBoard deliverables={data.eap.deliverables} />
          </div>
        </section>

        <section>
          <h2 className="text-foreground text-lg font-semibold">
            Cronograma macro
          </h2>
          <Card className="mt-4 p-5">
            <CardContent className="p-0">
              <Timeline
                items={data.schedule.phases.map((phase) => ({
                  title: phase.name,
                  description:
                    phase.milestones.length > 0
                      ? `Marcos: ${phase.milestones.join(", ")}`
                      : undefined,
                  meta:
                    phase.dependencies.length > 0
                      ? `Dependências: ${phase.dependencies.join(", ")}`
                      : undefined,
                }))}
              />
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Material de Kick-off: usa a largura total liberada pelo
          Container (result-view.tsx) — grid responsivo (1/2/3 colunas)
          em vez do carrossel horizontal anterior, que cortava o
          terceiro card num container estreito.

          A tela usa CSS Grid (`sm:grid-cols-2 lg:grid-cols-3`); a
          impressão usa **Flexbox** (`print:flex print:flex-wrap`), não
          Grid — decisão deliberada: `break-inside: avoid` tem suporte
          muito mais confiável em itens `flex` do que em itens de
          `display: grid` nos motores de impressão do Chromium, que
          frequentemente ignoram essa regra em grids multi-linha. Essa
          era a causa real de um card aparecer sozinho numa página,
          mesmo com a proteção aplicada.

          O `break-inside-avoid` também saiu do contêiner e ficou **só
          em cada card** (ver KickoffSlide): o bloco inteiro não é mais
          tratado como uma unidade atômica "tudo ou nada" — os cards
          fluem para preencher o espaço que sobra em cada página, sem
          nunca partir um card no meio. Isso evita o vão quase vazio que
          aparecia quando o bloco inteiro pulava para a página seguinte
          só porque não cabia por completo na anterior. */}
      <section>
        <h2 className="text-foreground text-lg font-semibold print:break-after-avoid">
          Material de Kick-off
        </h2>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 print:flex print:flex-wrap">
          <KickoffSlide className="bg-[#0b1220] text-white" eyebrow="01" dark>
            <p className="gradient-ai mb-3 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium text-white">
              Kick-off
            </p>
            <h3 className="text-2xl leading-tight font-semibold">
              {data.kickoff.title}
            </h3>
          </KickoffSlide>

          <KickoffSlide eyebrow="02" label="Objetivo">
            <p className="text-foreground text-base">
              {data.kickoff.objective}
            </p>
          </KickoffSlide>

          <KickoffSlide eyebrow="03" label="Escopo">
            <p className="text-foreground text-base">{data.kickoff.scope}</p>
          </KickoffSlide>

          <KickoffSlide eyebrow="04" label="Principais marcos">
            <ul className="text-foreground list-disc space-y-1.5 pl-5 text-sm">
              {data.kickoff.keyMilestones.map((milestone) => (
                <li key={milestone}>{milestone}</li>
              ))}
            </ul>
          </KickoffSlide>

          <KickoffSlide eyebrow="05" label="Papéis e responsabilidades">
            {data.kickoff.rolesAndResponsibilities.length === 0 ? (
              <p className="text-muted-foreground text-sm italic">
                Não identificado na especificação.
              </p>
            ) : (
              <ul className="text-foreground flex flex-col gap-2 text-sm">
                {data.kickoff.rolesAndResponsibilities.map((item) => (
                  <li key={item.role}>
                    <span className="font-medium">{item.role}:</span>{" "}
                    <span className="text-muted-foreground">
                      {item.responsibility}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </KickoffSlide>
        </div>
      </section>
    </div>
  );
}

function KickoffSlide({
  eyebrow,
  label,
  className,
  dark = false,
  children,
}: {
  eyebrow: string;
  label?: string;
  className?: string;
  dark?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        // Largura explícita para a impressão: com `flex-wrap`, cada
        // item precisa declarar sua própria largura (diferente de
        // Grid, onde as colunas já fazem essa divisão) — aqui, 2 cards
        // por linha, descontando a metade do gap-4 (1rem) entre eles.
        "border-border bg-card flex flex-col gap-2 rounded-xl border p-6 shadow-sm print:shrink-0 print:grow-0 print:basis-[calc(50%-0.5rem)] print:break-inside-avoid",
        className,
      )}
    >
      <span
        className={cn(
          "text-xs font-medium",
          dark ? "text-white/50" : "text-muted-foreground",
        )}
      >
        {eyebrow}
      </span>
      {label ? (
        <p
          className={cn(
            "text-sm font-semibold tracking-wide uppercase",
            dark ? "text-white/80" : "text-primary",
          )}
        >
          {label}
        </p>
      ) : null}
      {children}
    </div>
  );
}
