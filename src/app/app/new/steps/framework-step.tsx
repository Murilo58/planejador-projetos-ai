"use client";

import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { FRAMEWORKS, type FrameworkInfo } from "@/lib/frameworks";
import {
  HYBRID_FRAMEWORKS,
  type HybridFrameworkInfo,
} from "@/lib/hybrid/frameworks";
import type { PlanningFrameworkId } from "@/lib/planning-frameworks";

interface FrameworkStepProps {
  framework: PlanningFrameworkId | null;
  /** Feature flag do Planejamento Híbrido, avaliada no servidor. */
  hybridEnabled: boolean;
  error: string | null;
  onSelect: (framework: PlanningFrameworkId) => void;
  onBack: () => void;
  onContinue: () => void;
}

export function FrameworkStep({
  framework,
  hybridEnabled,
  error,
  onSelect,
  onBack,
  onContinue,
}: FrameworkStepProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-foreground text-xl font-semibold tracking-tight">
          Framework
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Escolha o framework de trabalho. A IA não decide por você — ela apenas
          estrutura o conteúdo dentro das regras do framework selecionado.
        </p>
      </div>

      <div
        role="radiogroup"
        aria-label="Framework"
        className="grid gap-4 sm:grid-cols-3"
      >
        {FRAMEWORKS.map((item) => (
          <FrameworkOption
            key={item.id}
            item={item}
            isSelected={framework === item.id}
            onSelect={onSelect}
          />
        ))}
      </div>

      {hybridEnabled ? (
        <div className="flex flex-col gap-3">
          <div>
            <h3 className="text-foreground text-base font-semibold">
              Planejamento Híbrido
            </h3>
            <p className="text-muted-foreground mt-1 text-sm">
              Combina a governança da Cascata com a execução ágil. Cada item
              ágil fica vinculado a um entregável da EAP.
            </p>
          </div>
          <div
            role="radiogroup"
            aria-label="Planejamento Híbrido"
            className="grid gap-4 sm:grid-cols-2"
          >
            {HYBRID_FRAMEWORKS.map((item) => (
              <FrameworkOption
                key={item.id}
                item={item}
                isSelected={framework === item.id}
                onSelect={onSelect}
              />
            ))}
          </div>
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      ) : null}

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-11 px-6 text-base"
          onClick={onBack}
        >
          Voltar
        </Button>
        <Button
          type="button"
          size="lg"
          className="h-11 px-6 text-base"
          onClick={onContinue}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}

function FrameworkOption({
  item,
  isSelected,
  onSelect,
}: {
  item: FrameworkInfo | HybridFrameworkInfo;
  isSelected: boolean;
  onSelect: (framework: PlanningFrameworkId) => void;
}) {
  return (
    <Card
      role="radio"
      aria-checked={isSelected}
      tabIndex={0}
      onClick={() => onSelect(item.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(item.id);
        }
      }}
      className={cn(
        "relative cursor-pointer p-5 transition-colors",
        isSelected ? "ring-primary ring-2" : "hover:border-primary/40",
      )}
    >
      {isSelected ? (
        <span className="bg-primary text-primary-foreground absolute top-4 right-4 flex size-5 items-center justify-center rounded-full">
          <Check className="size-3.5" />
        </span>
      ) : null}
      <h3 className="text-foreground font-semibold">{item.name}</h3>
      <p className="text-muted-foreground mt-1 text-xs font-medium">
        {item.tagline}
      </p>
      <p className="text-muted-foreground mt-3 text-sm leading-relaxed">
        {item.description}
      </p>
    </Card>
  );
}
