import type { NextAuthConfig } from "next-auth";

/**
 * Configuração "leve" do Auth.js: usada pelo guard de rotas (proxy.ts) e
 * reaproveitada pela configuração completa (auth.ts). Não importa Prisma,
 * bcrypt nem qualquer provider que toque o banco — o guard de rotas só
 * precisa verificar a presença de uma sessão válida (JWT), nunca consulta
 * o banco de dados.
 */
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth }) {
      return Boolean(auth?.user);
    },
  },
} satisfies NextAuthConfig;
