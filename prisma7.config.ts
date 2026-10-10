// Configuração do Prisma CLI (migrate, generate, studio, db pull...).
//
// Usada apenas pelo CLI — o Prisma Client em runtime (src/lib/db/prisma.ts)
// NÃO lê este arquivo; ele recebe a connection string explicitamente via
// um driver adapter (@prisma/adapter-pg), como exige o novo gerador
// `prisma-client` do Prisma 7.
//
// DIRECT_URL (não poolada) é usada aqui deliberadamente: o Prisma Migrate
// precisa de locks de sessão que a conexão poolada do Neon (PgBouncer em
// modo transaction) não suporta de forma confiável. A aplicação, em
// runtime, usa a connection string poolada (DATABASE_URL) — ver
// src/lib/db/prisma.ts.
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DIRECT_URL"] ?? process.env["DATABASE_URL"],
  },
});
