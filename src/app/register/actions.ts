"use server";

import { AuthError } from "next-auth";

import { signIn } from "@/auth";
import { hashPassword } from "@/lib/auth/password";
import { registerSchema } from "@/lib/auth/schemas";
import { prisma } from "@/lib/db/prisma";
import { getClientIp } from "@/lib/rate-limit/client-ip";
import {
  checkRegisterRateLimit,
  recordRegisterAttempt,
} from "@/lib/rate-limit/auth-attempts";

export interface RegisterFormState {
  error: string | null;
}

const RATE_LIMITED_MESSAGE =
  "Muitas tentativas. Aguarde alguns minutos e tente novamente.";

// Mensagem neutra (A2): nunca confirma se o e-mail já tem conta — a
// mesma frase serve tanto para "e-mail já cadastrado" quanto para
// qualquer outra falha genérica, para não dar a um atacante um oráculo
// de quais e-mails já existem.
const GENERIC_REGISTER_ERROR =
  "Não foi possível concluir o cadastro com os dados informados. Verifique e tente novamente.";

export async function registerAction(
  _prevState: RegisterFormState,
  formData: FormData,
): Promise<RegisterFormState> {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { email, password } = parsed.data;
  const ip = await getClientIp();

  // A2: todas as tentativas contam (sucesso ou falha) — o próprio ato de
  // criar conta é o recurso a proteger, inclusive contra varredura de
  // e-mails para descobrir quais já têm conta.
  if (!(await checkRegisterRateLimit(ip))) {
    return { error: RATE_LIMITED_MESSAGE };
  }

  // Verificação de existência e hashing da senha em paralelo, SEMPRE —
  // mesmo quando o e-mail já existe e o hash será descartado. Isso
  // equaliza o tempo de resposta entre "e-mail novo" e "e-mail já
  // cadastrado": o bcrypt (custo 12) domina o tempo total nos dois
  // casos, em vez de um retornar quase instantaneamente e o outro levar
  // o tempo do hash — o que por si só já seria um oráculo de timing para
  // descobrir contas existentes, mesmo com a mensagem de erro neutra.
  const [existingUser, passwordHash] = await Promise.all([
    prisma.user.findUnique({ where: { email } }),
    hashPassword(password),
  ]);

  if (existingUser) {
    await recordRegisterAttempt(ip, false);
    return { error: GENERIC_REGISTER_ERROR };
  }

  await prisma.user.create({ data: { email, passwordHash } });
  await recordRegisterAttempt(ip, true);

  try {
    // Login automático após o cadastro, para evitar pedir a senha de novo.
    await signIn("credentials", { email, password, redirectTo: "/app" });
    return { error: null };
  } catch (error) {
    if (error instanceof AuthError) {
      // Conta criada com sucesso; apenas o login automático falhou.
      return { error: "Conta criada. Faça login para continuar." };
    }
    throw error;
  }
}
