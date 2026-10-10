import path from "node:path";

import { defineConfig } from "vitest/config";

/**
 * Testes unitários (spec §94): schemas, validação, utilitários e geração
 * de exportação. Sem ambiente de navegador (jsdom) — nenhum teste aqui
 * renderiza componentes React, apenas funções puras e schemas Zod.
 */
export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    // Carrega `.env` (DATABASE_URL etc.) — necessário para os testes de
    // rate limiting (src/lib/rate-limit/*.test.ts), que exercitam o
    // Postgres real do Neon em vez de mockar o banco (mesma filosofia já
    // usada nos testes de exportação Excel: comportamento real, não
    // substituto). Esses testes se auto-ignoram se DATABASE_URL não
    // estiver definida.
    setupFiles: ["./vitest.setup.ts"],
  },
});
