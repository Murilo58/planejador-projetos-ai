import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";

/**
 * Cliente Prisma único para toda a aplicação.
 *
 * O gerador `prisma-client` (Prisma 7) não lê mais a connection string de
 * `prisma7.config.ts` em runtime — o client precisa de um driver adapter
 * explícito. Usamos `@prisma/adapter-pg` (node-postgres) com a connection
 * string POOLADA do Neon (`DATABASE_URL`); migrations usam a conexão
 * direta (`DIRECT_URL`), configurada separadamente em `prisma7.config.ts`.
 *
 * O padrão de cache em `globalThis` evita recriar o client (e o pool de
 * conexões) a cada hot-reload do Next.js em desenvolvimento.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL não definida. Configure-a em .env.local (ver .env.example).",
    );
  }

  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
