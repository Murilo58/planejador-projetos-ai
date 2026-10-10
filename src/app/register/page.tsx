import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";

import { auth } from "@/auth";
import { AuthShell } from "@/components/layout/auth-shell";

import { RegisterForm } from "./register-form";

export const metadata: Metadata = {
  title: "Criar conta — Planejador de Projetos AI",
};

export default async function RegisterPage() {
  const session = await auth();
  if (session?.user) {
    redirect("/app");
  }

  return (
    <AuthShell
      title="Criar conta"
      subtitle="Comece a transformar especificações técnicas em planejamento estruturado."
      message="Transforme especificações técnicas em planejamento estruturado com IA."
      footer={
        <p>
          Já tem conta?{" "}
          <Link
            href="/login"
            className="text-primary font-medium hover:underline"
          >
            Entrar
          </Link>
        </p>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
