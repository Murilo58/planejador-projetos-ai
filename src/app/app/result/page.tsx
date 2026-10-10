import type { Metadata } from "next";

import { auth } from "@/auth";
import { AppHeader } from "@/components/layout/app-header";

import { ResultView } from "./result-view";

export const metadata: Metadata = {
  title: "Resultado — Planejador de Projetos AI",
};

export default async function ResultPage() {
  const session = await auth();
  const userEmail = session?.user?.email ?? "";

  return (
    <>
      <AppHeader userEmail={userEmail} />
      {/* Sem <Container> aqui de propósito: o limite de 1152px do
          Container impedia o Kanban de se aproximar dos ~95% da
          viewport mesmo depois de remover o max-w-3xl extra. A largura
          (e o padding lateral equivalente) agora é decidida inteiramente
          pelo ResultView, por framework — ele é quem sabe qual
          framework está sendo exibido. */}
      <main className="bg-muted/30 flex-1 py-12 sm:py-16 print:bg-white print:py-0">
        <ResultView />
      </main>
    </>
  );
}
