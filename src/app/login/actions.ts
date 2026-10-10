"use server";

import { AuthError } from "next-auth";

import { signIn } from "@/auth";
import { loginSchema } from "@/lib/auth/schemas";
import { getClientIp } from "@/lib/rate-limit/client-ip";
import {
  checkLoginRateLimit,
  recordFailedLoginAttempt,
} from "@/lib/rate-limit/auth-attempts";

export interface LoginFormState {
  error: string | null;
}

const RATE_LIMITED_MESSAGE =
  "Muitas tentativas. Aguarde alguns minutos e tente novamente.";

export async function loginAction(
  _prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Informe um email e senha válidos." };
  }

  const ip = await getClientIp();

  // A2: janela deslizante por IP e por conta — nunca permanente, basta a
  // janela de tempo passar. Verificada antes de chamar `signIn` para não
  // gastar um ciclo de verificação de senha em tentativas já bloqueadas.
  if (!(await checkLoginRateLimit(ip, parsed.data.email))) {
    return { error: RATE_LIMITED_MESSAGE };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/app",
    });
    return { error: null };
  } catch (error) {
    // Credenciais inválidas: next-auth lança um AuthError (subclasse
    // CredentialsSignin) quando `authorize` retorna null. Qualquer outro
    // erro (inclusive o redirecionamento interno do Next.js em caso de
    // sucesso) deve continuar propagando — RF-068, RNF-009: mensagem
    // genérica, nunca detalhe interno.
    if (error instanceof AuthError) {
      // Só falhas contam para o limite (A2) — um login bem-sucedido
      // nunca penaliza tentativas legítimas futuras. O caminho de
      // sucesso acima nunca chega aqui: `signIn` com `redirectTo`
      // interrompe a execução antes deste bloco.
      await recordFailedLoginAttempt(ip, parsed.data.email);
      return { error: "Email ou senha inválidos." };
    }
    throw error;
  }
}
