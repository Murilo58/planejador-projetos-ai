import { describe, expect, it } from "vitest";

import { hashPassword, verifyPassword } from "@/lib/auth/password";

describe("hashPassword / verifyPassword", () => {
  it("gera um hash diferente da senha em texto puro", async () => {
    const hash = await hashPassword("senha-segura-123");
    expect(hash).not.toBe("senha-segura-123");
  });

  it("verifica corretamente a senha certa", async () => {
    const hash = await hashPassword("senha-segura-123");
    await expect(verifyPassword("senha-segura-123", hash)).resolves.toBe(true);
  });

  it("rejeita a senha errada", async () => {
    const hash = await hashPassword("senha-segura-123");
    await expect(verifyPassword("senha-errada", hash)).resolves.toBe(false);
  });

  it("gera hashes diferentes para a mesma senha (salt aleatório)", async () => {
    const hashA = await hashPassword("senha-segura-123");
    const hashB = await hashPassword("senha-segura-123");
    expect(hashA).not.toBe(hashB);
  });
});
