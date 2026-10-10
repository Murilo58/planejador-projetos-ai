import { createHash } from "node:crypto";

import { prisma } from "@/lib/db/prisma";

import { AUTH_RATE_LIMIT } from "./config";

/**
 * Proteção de login e cadastro (A2 da auditoria de produção): janela
 * deslizante de tentativas por IP e, no login, também por conta — sem
 * bloqueio permanente (basta a janela de tempo passar) e sem jamais
 * registrar senha, token ou qualquer dado de credencial — apenas uma
 * chave de identificação, o tipo de tentativa e se teve sucesso.
 *
 * O e-mail nunca é gravado em texto puro aqui: vira hash (SHA-256) antes
 * de ser usado como chave, para não manter uma segunda cópia legível de
 * endereços de e-mail numa tabela de controle operacional.
 */

function ipKey(ip: string): string {
  return `ip:${ip}`;
}

function emailKey(email: string): string {
  const hash = createHash("sha256").update(email.trim().toLowerCase()).digest("hex");
  return `email:${hash}`;
}

async function countRecentAttempts(
  key: string,
  kind: string,
  windowMs: number,
  onlyFailed: boolean,
): Promise<number> {
  return prisma.authAttempt.count({
    where: {
      key,
      kind,
      createdAt: { gte: new Date(Date.now() - windowMs) },
      ...(onlyFailed ? { succeeded: false } : {}),
    },
  });
}

/**
 * Verifica se um login pode ser tentado, ANTES de chamar `signIn`. Conta
 * apenas tentativas que **falharam** — um login bem-sucedido nunca
 * penaliza tentativas futuras legítimas (ex.: IP compartilhado de
 * escritório).
 */
export async function checkLoginRateLimit(
  ip: string,
  email: string,
): Promise<boolean> {
  const { byIp, byEmail } = AUTH_RATE_LIMIT.login;
  const [ipCount, emailCount] = await Promise.all([
    countRecentAttempts(ipKey(ip), "login", byIp.windowMs, true),
    countRecentAttempts(emailKey(email), "login", byEmail.windowMs, true),
  ]);
  return ipCount < byIp.max && emailCount < byEmail.max;
}

/**
 * Registrada só quando o login falha (ver `checkLoginRateLimit` acima) —
 * nunca chamada no caminho de sucesso, que de qualquer forma é
 * interrompido pelo redirecionamento interno do Next.js antes de
 * qualquer código depois de `signIn` ser executado.
 */
export async function recordFailedLoginAttempt(
  ip: string,
  email: string,
): Promise<void> {
  await prisma.authAttempt.createMany({
    data: [
      { key: ipKey(ip), kind: "login", succeeded: false },
      { key: emailKey(email), kind: "login", succeeded: false },
    ],
  });
}

/**
 * Verifica se um cadastro pode ser tentado. Diferente do login, conta
 * **todas** as tentativas (sucesso ou falha) — o próprio ato de criar
 * conta é o recurso a proteger, inclusive contra varredura de e-mails
 * para descobrir quais já têm conta.
 */
export async function checkRegisterRateLimit(ip: string): Promise<boolean> {
  const { byIp } = AUTH_RATE_LIMIT.register;
  const count = await countRecentAttempts(
    ipKey(ip),
    "register",
    byIp.windowMs,
    false,
  );
  return count < byIp.max;
}

export async function recordRegisterAttempt(
  ip: string,
  succeeded: boolean,
): Promise<void> {
  await prisma.authAttempt.create({
    data: { key: ipKey(ip), kind: "register", succeeded },
  });
}
