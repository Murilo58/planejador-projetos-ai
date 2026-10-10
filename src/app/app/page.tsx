import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { auth } from "@/auth";
import { AppHeader } from "@/components/layout/app-header";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FRAMEWORKS } from "@/lib/frameworks";

export const metadata: Metadata = {
  title: "Painel — Planejador de Projetos AI",
};

export default async function DashboardPage() {
  // A rota já está protegida por src/proxy.ts; aqui a sessão só é lida
  // para exibir o email do usuário no cabeçalho (RF-012/RF-013).
  const session = await auth();
  const userEmail = session?.user?.email ?? "";

  return (
    <>
      <AppHeader userEmail={userEmail} />
      <main className="bg-muted/30 flex-1 py-12 sm:py-16">
        <Container className="flex flex-col gap-10">
          <div className="flex flex-col gap-4">
            <h1 className="text-foreground max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
              Transforme especificações técnicas em artefatos estruturados de
              gestão de projetos com Inteligência Artificial.
            </h1>
            <p className="text-primary text-sm font-medium tracking-wide uppercase">
              Envie → Escolha → Gere
            </p>
            <div>
              <Button
                size="lg"
                className="h-11 px-6 text-base"
                render={
                  <Link href="/app/new">
                    Criar novo planejamento
                    <ArrowRight className="size-4" data-icon="inline-end" />
                  </Link>
                }
              />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {FRAMEWORKS.map((framework) => (
              <Card key={framework.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{framework.name}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {framework.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </Container>
      </main>
    </>
  );
}
