"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import {
  runConsolidationStep,
  runExtractionStep,
  runStructuringStep,
} from "@/lib/ai/actions";
import type { FrameworkId } from "@/lib/frameworks";
import {
  extractTextFromPdf,
  PdfTextExtractionError,
} from "@/lib/pdf/extract-text";
import { saveResultToSession } from "@/lib/result/storage";
import {
  ACCEPTED_FILE_TYPE,
  formatBytes,
  MAX_FILE_SIZE_BYTES,
  MAX_TEXT_LENGTH,
  MIN_TEXT_LENGTH,
} from "@/lib/specification/limits";

import type { GenerationStage } from "./generation-progress";
import { StepIndicator } from "./step-indicator";
import { ConfirmationStep } from "./steps/confirmation-step";
import { FrameworkStep } from "./steps/framework-step";
import { SpecificationStep, type InputMode } from "./steps/specification-step";

type Step = 1 | 2 | 3;

export function NewPlanningWizard() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);

  const [inputMode, setInputMode] = useState<InputMode>("text");
  const [text, setText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [specificationError, setSpecificationError] = useState<string | null>(
    null,
  );

  const [framework, setFramework] = useState<FrameworkId | null>(null);
  const [frameworkError, setFrameworkError] = useState<string | null>(null);

  const [generationStage, setGenerationStage] =
    useState<GenerationStage | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);

  function handleModeChange(mode: InputMode) {
    if (mode === inputMode) return;
    setInputMode(mode);
    // RN-009: a entrada é PDF OU texto — trocar o modo descarta a outra.
    setText("");
    setFileName(null);
    setSpecificationError(null);
  }

  async function handleFileSelected(file: File) {
    setSpecificationError(null);

    const isPdf =
      file.type === ACCEPTED_FILE_TYPE ||
      file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setSpecificationError("Envie um arquivo no formato PDF.");
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setSpecificationError(
        `O arquivo excede o limite de ${formatBytes(MAX_FILE_SIZE_BYTES)}.`,
      );
      return;
    }

    setFileName(file.name);
    setText("");
    setIsExtracting(true);
    try {
      const extracted = await extractTextFromPdf(file);
      setText(extracted);
    } catch (error) {
      setFileName(null);
      setSpecificationError(
        error instanceof PdfTextExtractionError
          ? error.message
          : "Não foi possível processar este arquivo. Tente novamente ou cole o conteúdo diretamente.",
      );
    } finally {
      setIsExtracting(false);
    }
  }

  function handleRemoveFile() {
    setFileName(null);
    setText("");
    setSpecificationError(null);
  }

  function handleSpecificationContinue() {
    const trimmed = text.trim();

    if (trimmed.length === 0) {
      setSpecificationError(
        inputMode === "pdf"
          ? "Envie um arquivo PDF com texto selecionável."
          : "Cole o conteúdo da especificação.",
      );
      return;
    }
    if (trimmed.length < MIN_TEXT_LENGTH) {
      setSpecificationError(
        `A especificação precisa ter pelo menos ${MIN_TEXT_LENGTH} caracteres.`,
      );
      return;
    }
    if (trimmed.length > MAX_TEXT_LENGTH) {
      setSpecificationError(
        `A especificação excede o limite de ${MAX_TEXT_LENGTH.toLocaleString("pt-BR")} caracteres.`,
      );
      return;
    }

    setSpecificationError(null);
    setStep(2);
  }

  function handleFrameworkContinue() {
    if (!framework) {
      setFrameworkError("Selecione um framework para continuar.");
      return;
    }
    setFrameworkError(null);
    setStep(3);
  }

  // FE-10: sessão expirada no meio do fluxo é tratada como caso especial
  // (redireciona para /login), não como um erro inline qualquer.
  function handleStageFailure(result: { code: string; message: string }) {
    if (result.code === "session_expired") {
      router.push(`/login?callbackUrl=${encodeURIComponent("/app/new")}`);
      return;
    }
    setGenerationError(result.message);
    setGenerationStage(null);
  }

  async function handleGenerate() {
    if (!framework) return;

    setGenerationError(null);
    setGenerationStage("extraction");

    // Um id por tentativa de geração (não por chamada) — identifica as 3
    // etapas como parte de uma única geração para fins de cota (A1):
    // cobrada uma única vez, na Etapa 1, nunca nas Etapas 2 e 3.
    const generationId = crypto.randomUUID();

    try {
      const extraction = await runExtractionStep({
        sourceType: inputMode,
        fileName: fileName ?? undefined,
        text,
        framework,
        generationId,
      });
      if (!extraction.success) {
        handleStageFailure(extraction);
        return;
      }

      setGenerationStage("structuring");
      const structuring = await runStructuringStep(
        framework,
        extraction.data,
        generationId,
      );
      if (!structuring.success) {
        handleStageFailure(structuring);
        return;
      }

      setGenerationStage("consolidation");
      const consolidation = await runConsolidationStep(
        framework,
        extraction.data,
        structuring.data,
        generationId,
      );
      if (!consolidation.success) {
        handleStageFailure(consolidation);
        return;
      }

      saveResultToSession(consolidation.data);
      router.push("/app/result");
    } catch {
      // FE-11: falha de rede ao chamar a Server Action (não um erro da
      // IA em si, que já é tratado dentro de cada etapa).
      setGenerationError(
        "Erro de conexão durante a geração. Verifique sua internet e tente novamente.",
      );
      setGenerationStage(null);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <StepIndicator current={step} />

      <Card className="p-6 sm:p-8">
        <CardContent className="p-0">
          {step === 1 ? (
            <SpecificationStep
              inputMode={inputMode}
              text={text}
              fileName={fileName}
              isExtracting={isExtracting}
              error={specificationError}
              onModeChange={handleModeChange}
              onTextChange={(value) => {
                setText(value);
                if (specificationError) setSpecificationError(null);
              }}
              onFileSelected={handleFileSelected}
              onRemoveFile={handleRemoveFile}
              onContinue={handleSpecificationContinue}
            />
          ) : null}

          {step === 2 ? (
            <FrameworkStep
              framework={framework}
              error={frameworkError}
              onSelect={(value) => {
                setFramework(value);
                setFrameworkError(null);
              }}
              onBack={() => setStep(1)}
              onContinue={handleFrameworkContinue}
            />
          ) : null}

          {step === 3 && framework ? (
            <ConfirmationStep
              sourceType={inputMode}
              fileName={fileName}
              text={text}
              framework={framework}
              generationStage={generationStage}
              generationError={generationError}
              onBack={() => setStep(2)}
              onGenerate={handleGenerate}
            />
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
