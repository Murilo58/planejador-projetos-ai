import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { auth } from "@/auth";
import { AuthShell } from "@/components/layout/auth-shell";

import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Entrar — Planejador de Projetos AI",
};

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/app");
  }

  return (
    <AuthShell
      title="Entrar"
      subtitle="Acesse sua conta para continuar seu planejamento."
      message="Planejamento inteligente começa com uma boa especificação."
      footer={
        <p>
          Não tem conta?{" "}
          <Link
            href="/register"
            className="text-primary font-medium hover:underline"
          >
            Criar conta
          </Link>
        </p>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
