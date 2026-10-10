"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { FileText, Loader2, ShieldCheck, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  ACCEPTED_FILE_TYPE,
  formatBytes,
  MAX_FILE_SIZE_BYTES,
  MAX_TEXT_LENGTH,
} from "@/lib/specification/limits";

export type InputMode = "text" | "pdf";

interface SpecificationStepProps {
  inputMode: InputMode;
  text: string;
  fileName: string | null;
  isExtracting: boolean;
  error: string | null;
  onModeChange: (mode: InputMode) => void;
  onTextChange: (text: string) => void;
  onFileSelected: (file: File) => void;
  onRemoveFile: () => void;
  onContinue: () => void;
}

export function SpecificationStep({
  inputMode,
  text,
  fileName,
  isExtracting,
  error,
  onModeChange,
  onTextChange,
  onFileSelected,
  onRemoveFile,
  onContinue,
}: SpecificationStepProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-foreground text-xl font-semibold tracking-tight">
          Especificação
        </h2>
        <p className="text-muted-foreground mt-1 text-sm">
          Envie um PDF com texto selecionável ou cole o conteúdo técnico
          diretamente.
        </p>
      </div>

      <div
        role="tablist"
        aria-label="Forma de entrada"
        className="border-border bg-muted inline-flex w-fit rounded-lg border p-1"
      >
        <button
          type="button"
          role="tab"
          aria-selected={inputMode === "text"}
          onClick={() => onModeChange("text")}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            inputMode === "text"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Colar texto
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={inputMode === "pdf"}
          onClick={() => onModeChange("pdf")}
          className={cn(
            "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
            inputMode === "pdf"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Enviar PDF
        </button>
      </div>

      {inputMode === "text" ? (
        <div className="flex flex-col gap-2">
          <Textarea
            value={text}
            onChange={(event) => onTextChange(event.target.value)}
            placeholder="Cole aqui o conteúdo técnico da especificação..."
            className="min-h-64 text-sm"
            maxLength={MAX_TEXT_LENGTH}
            aria-label="Conteúdo da especificação"
          />
          <p className="text-muted-foreground text-xs">
            {text.trim().length.toLocaleString("pt-BR")} /{" "}
            {MAX_TEXT_LENGTH.toLocaleString("pt-BR")} caracteres
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {fileName ? (
            <div className="border-border bg-card flex items-center gap-3 rounded-lg border p-4">
              <FileText className="text-primary size-8 shrink-0" />
              <div className="flex-1 overflow-hidden">
                <p className="text-foreground truncate text-sm font-medium">
                  {fileName}
                </p>
                <p className="text-muted-foreground text-xs">
                  {isExtracting
                    ? "Extraindo texto..."
                    : `${text.trim().length.toLocaleString("pt-BR")} caracteres extraídos`}
                </p>
              </div>
              {isExtracting ? (
                <Loader2 className="text-muted-foreground size-4 animate-spin" />
              ) : (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label="Remover arquivo"
                  onClick={onRemoveFile}
                >
                  <X className="size-4" />
                </Button>
              )}
            </div>
          ) : (
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setIsDragging(false);
                const file = event.dataTransfer.files[0];
                if (file) onFileSelected(file);
              }}
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  fileInputRef.current?.click();
                }
              }}
              className={cn(
                "flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed p-10 text-center transition-colors",
                isDragging
                  ? "border-primary bg-accent"
                  : "border-border hover:border-primary/50 hover:bg-muted/50",
              )}
            >
              <Upload className="text-muted-foreground size-8" />
              <p className="text-foreground text-sm font-medium">
                Arraste um PDF aqui ou clique para selecionar
              </p>
              <p className="text-muted-foreground text-xs">
                PDF com texto selecionável · até{" "}
                {formatBytes(MAX_FILE_SIZE_BYTES)}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept={`${ACCEPTED_FILE_TYPE},.pdf`}
                className="sr-only"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) onFileSelected(file);
                  event.target.value = "";
                }}
              />
            </div>
          )}
        </div>
      )}

      <div className="border-border bg-muted/40 text-muted-foreground flex items-start gap-2 rounded-lg border p-3 text-xs">
        <ShieldCheck className="text-primary mt-0.5 size-4 shrink-0" />
        <p>
          Privacidade: sua especificação é utilizada apenas durante o
          processamento e não é armazenada permanentemente pelo Planejador de
          Projetos AI.{" "}
          <Link href="/privacy" className="font-medium underline">
            Saiba mais
          </Link>
          .
        </p>
      </div>

      {error ? (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      ) : null}

      <div>
        <Button
          type="button"
          size="lg"
          className="h-11 px-6 text-base"
          disabled={isExtracting}
          onClick={onContinue}
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}
