import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

/**
 * CSP sem nonce (RNF-008 / item de manutenção v1.0.1): a alternativa com
 * nonce exigiria renderização dinâmica em todas as rotas (inclusive `/` e
 * `/privacy`, hoje estáticas) — documentado explicitamente pelo próprio
 * Next.js como um efeito colateral da abordagem com nonce, não algo
 * específico desta aplicação. Como nenhuma página daqui depende de script
 * de terceiro, a troca não compensa: mantemos geração estática com
 * `'unsafe-inline'` para script/style, que é o padrão "sem nonce"
 * oficialmente documentado pelo Next.js para quem está nessa situação.
 *
 * Levantamento do que a aplicação realmente carrega, antes de escrever a
 * política: fontes via `next/font/google` (auto-hospedadas no build, sem
 * requisição a fonts.googleapis.com em runtime), nenhum `<script>` ou
 * `next/image` remoto, nenhum `fetch()` client-side para fora da própria
 * origem — o Gemini só é chamado no servidor. `'unsafe-eval'` só em dev
 * (exigido pelo React para stack traces; o próprio Next.js documenta que
 * não é necessário em produção).
 *
 * Fase atual: Report-Only — só registra violações no console do
 * navegador, nunca bloqueia nada. Trocar para `Content-Security-Policy`
 * (sem o `-Report-Only`) é a ativação definitiva, feita só depois de
 * validar os três frameworks e as exportações sem violações inesperadas.
 */
const cspDirectives = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

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

  // Headers de segurança (RNF-008).
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
          // Report-Only por enquanto — ver comentário em cspDirectives.
          {
            key: "Content-Security-Policy-Report-Only",
            value: cspDirectives,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
