import NextAuth from "next-auth";

import { authConfig } from "@/auth.config";

/**
 * Guard de rotas da área autenticada (RF-008 / RN-011).
 *
 * Next.js 16 renomeou `middleware.ts` para `proxy.ts` (função `proxy` em
 * vez de `middleware`); o arquivo roda em runtime Node.js por padrão desde
 * a v16. Usa apenas `authConfig` (sem Credentials/Prisma): só verifica se
 * existe uma sessão válida no cookie — nunca consulta o banco de dados.
 *
 * Usuário não autenticado tentando acessar `/app/*` é redirecionado para
 * `/login`, com `callbackUrl` apontando para a rota originalmente pedida.
 */
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  matcher: ["/app/:path*"],
};
