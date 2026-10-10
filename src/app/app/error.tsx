"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";

/**
 * Error boundary da área autenticada (RF-067/RNF-009 / FE-15): nunca
 * expõe stack trace ou detalhe técnico — apenas uma mensagem amigável e
 * uma saída clara.
 */
export default function AppError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    // Log sanitizado: só o "digest" (identificador técnico não sensível
    // gerado pelo Next.js), nunca a mensagem completa do erro.
    console.error(
      JSON.stringify({
        scope: "app",
        event: "unhandled_error",
        digest: error.digest ?? null,
      }),
    );
  }, [error]);

  return (
    <main className="flex flex-1 items-center justify-center py-20">
      <Container className="flex max-w-md flex-col items-center gap-4 text-center">
        <h1 className="text-foreground text-xl font-semibold">
          Algo deu errado
        </h1>
        <p className="text-muted-foreground text-sm">
          Não foi possível concluir esta ação. Tente novamente — se o problema
          continuar, volte ao painel e comece de novo.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={retry}>
            Tentar novamente
          </Button>
          <Button render={<Link href="/app">Voltar ao painel</Link>} />
        </div>
      </Container>
    </main>
  );
}
