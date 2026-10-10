import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Cache Components (dynamicIO) e Partial Prefetching ficam desligados de
  // propósito: são paradigmas novos do Next.js 16 que exigiriam diretivas
  // "use cache" e limites de Suspense em todas as rotas dinâmicas (as rotas
  // autenticadas do /app dependem de sessão em tempo de requisição). Manter
  // a renderização dinâmica convencional evita essa complexidade adicional
  // sem necessidade para o MVP.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },

  // Headers de segurança básicos (RNF-008). Deliberadamente não inclui uma
  // Content-Security-Policy completa — tuná-la corretamente para
  // Next.js/Turbopack sem quebrar a aplicação é um esforço maior do que o
  // justificável neste MVP; fica registrado como item futuro.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
