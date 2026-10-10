import { randomUUID } from "node:crypto";

import { afterEach, describe, expect, it } from "vitest";

import { prisma } from "@/lib/db/prisma";
import {
  checkLoginRateLimit,
  checkRegisterRateLimit,
  recordFailedLoginAttempt,
  recordRegisterAttempt,
} from "@/lib/rate-limit/auth-attempts";
import { AUTH_RATE_LIMIT } from "@/lib/rate-limit/config";

/**
 * Testes de integração contra o Postgres real (mesma justificativa de
 * `generation-quota.test.ts`). IPs e e-mails de teste usam faixas
 * reservadas para documentação/teste (RFC 5737 / RFC 2606) — nunca
 * colidem com dados reais, mesmo que a limpeza falhe por algum motivo.
 */
const hasDatabase = Boolean(process.env.DATABASE_URL);

function testIp(): string {
  // 203.0.113.0/24 — TEST-NET-3 (RFC 5737), reservado para documentação.
  return `203.0.113.${Math.floor(Math.random() * 255)}`;
}

function testEmail(): string {
  return `${randomUUID()}@example.invalid`;
}

const trackedIps = new Set<string>();

afterEach(async () => {
  if (!hasDatabase || trackedIps.size === 0) return;
  const ipKeys = Array.from(trackedIps).map((ip) => `ip:${ip}`);
  await prisma.authAttempt.deleteMany({ where: { key: { in: ipKeys } } });
  trackedIps.clear();
});

function track(ip: string): string {
  trackedIps.add(ip);
  return ip;
}

describe.skipIf(!hasDatabase)("checkLoginRateLimit / recordFailedLoginAttempt", () => {
  it("permite login com IP e e-mail novos", async () => {
    const ip = track(testIp());
    const email = testEmail();
    expect(await checkLoginRateLimit(ip, email)).toBe(true);
  });

  it("bloqueia por IP após o número máximo de falhas, mesmo com e-mails diferentes", async () => {
    const ip = track(testIp());

    for (let i = 0; i < AUTH_RATE_LIMIT.login.byIp.max; i++) {
      await recordFailedLoginAttempt(ip, testEmail());
    }

    expect(await checkLoginRateLimit(ip, testEmail())).toBe(false);
  });

  it("bloqueia por e-mail após o número máximo de falhas, mesmo com IPs diferentes (ataque distribuído)", async () => {
    const email = testEmail();

    for (let i = 0; i < AUTH_RATE_LIMIT.login.byEmail.max; i++) {
      const ip = track(testIp());
      await recordFailedLoginAttempt(ip, email);
    }

    expect(await checkLoginRateLimit(track(testIp()), email)).toBe(false);
  });

  it("nunca bloqueia permanentemente: um login bem-sucedido (nunca registrado) não conta contra o limite", async () => {
    const ip = track(testIp());
    const email = testEmail();

    for (let i = 0; i < AUTH_RATE_LIMIT.login.byIp.max - 1; i++) {
      await recordFailedLoginAttempt(ip, testEmail());
    }
    // Um login bem-sucedido não chama `recordFailedLoginAttempt` — por
    // isso o limite continua abaixo do máximo.
    expect(await checkLoginRateLimit(ip, email)).toBe(true);
  });

  it("nunca grava a senha ou o e-mail em texto puro na chave de controle", async () => {
    const ip = track(testIp());
    const email = testEmail();
    await recordFailedLoginAttempt(ip, email);

    const rows = await prisma.authAttempt.findMany({
      where: { key: `ip:${ip}` },
    });
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      expect(row.key).not.toContain(email);
      expect(row.key).not.toContain("@");
    }
  });
});

describe.skipIf(!hasDatabase)("checkRegisterRateLimit / recordRegisterAttempt", () => {
  it("permite cadastro com IP novo", async () => {
    const ip = track(testIp());
    expect(await checkRegisterRateLimit(ip)).toBe(true);
  });

  it("bloqueia por IP após o número máximo de tentativas (sucesso ou falha contam)", async () => {
    const ip = track(testIp());

    for (let i = 0; i < AUTH_RATE_LIMIT.register.byIp.max; i++) {
      await recordRegisterAttempt(ip, i % 2 === 0);
    }

    expect(await checkRegisterRateLimit(ip)).toBe(false);
  });
});
