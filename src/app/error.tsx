"use client";

import Link from "next/link";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";

/** Error boundary da área pública (landing, login, register, privacy). */
export default function RootError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(
      JSON.stringify({
        scope: "public",
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
          Não foi possível carregar esta página. Tente novamente em alguns
          instantes.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={retry}>
            Tentar novamente
          </Button>
          <Button render={<Link href="/">Voltar ao início</Link>} />
        </div>
      </Container>
    </main>
  );
}
