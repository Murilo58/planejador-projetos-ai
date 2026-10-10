"use client";

import { FileText, Type } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FRAMEWORKS, type FrameworkId } from "@/lib/frameworks";

import {
  GenerationProgress,
  type GenerationStage,
} from "../generation-progress";

interface ConfirmationStepProps {
  sourceType: "text" | "pdf";
  fileName: string | null;
  text: string;
  framework: FrameworkId;
  generationStage: GenerationStage | null;
  generationError: string | null;
  onBack: () => void;
  onGenerate: () => void;
}

export function ConfirmationStep({
  sourceType,
  fileName,
  text,
  framework,
  generationStage,
  generationError,
  onBack,
  onGenerate,
}: ConfirmationStepProps) {
  const frameworkInfo = FRAMEWORKS.find((item) => item.id === framework);
  const charCount = text.trim().length;
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const isGenerating = generationStage !== null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-foreground text-xl font-semibold tracking-tight">
          Confirmação
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Revise os dados antes de gerar o planejamento.
        </p>
      </div>

      <Card className="p-5">
        <CardContent className="flex flex-col gap-4 p-0">
          <div className="flex items-start gap-3">
            {sourceType === "pdf" ? (
              <FileText className="text-primary mt-0.5 size-5 shrink-0" />
            ) : (
              <Type className="text-primary mt-0.5 size-5 shrink-0" />
            )}
            <div>
              <p className="text-foreground text-sm font-medium">
                {sourceType === "pdf"
                  ? `Arquivo PDF: ${fileName}`
                  : "Texto colado"}
              </p>
              <p className="text-muted-foreground text-xs">
                {charCount.toLocaleString("pt-BR")} caracteres · ~
                {wordCount.toLocaleString("pt-BR")} palavras
              </p>
            </div>
          </div>

          <div className="bg-border h-px" />

          <div>
            <div className="flex items-center gap-2">
              <p className="text-foreground text-sm font-medium">
                Framework selecionado
              </p>
              <Badge>{frameworkInfo?.name}</Badge>
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              {frameworkInfo?.description}
            </p>
          </div>
        </CardContent>
      </Card>

      <p className="text-muted-foreground text-xs">
        A IA interpretará a especificação dentro das regras do framework
        selecionado. Informações não identificadas serão marcadas como tal —
        nada é inventado.
      </p>

      {isGenerating ? (
        <Card className="p-5">
          <CardContent className="p-0">
            <GenerationProgress stage={generationStage} />
          </CardContent>
        </Card>
      ) : null}

      {generationError ? (
        <p role="alert" className="text-destructive text-sm">
          {generationError}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-11 px-6 text-base"
          onClick={onBack}
          disabled={isGenerating}
        >
          Voltar
        </Button>
        <Button
          type="button"
          size="lg"
          className="h-11 px-6 text-base"
          onClick={onGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? "Gerando..." : "Gerar planejamento"}
        </Button>
      </div>
    </div>
  );
}
