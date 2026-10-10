import type { DefaultSession } from "next-auth";

// Adiciona `id` à sessão e ao token, expostos pelos callbacks em src/auth.ts.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
  }
}
