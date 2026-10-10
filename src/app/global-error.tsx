"use client";

/**
 * Último fallback: só é acionado se o próprio layout raiz falhar. Por
 * convenção do Next.js, precisa definir <html>/<body> próprios e não
 * herda o CSS global — por isso o estilo aqui é inline, sem depender do
 * Tailwind/tokens terem sido carregados.
 */
export default function GlobalError({
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          display: "flex",
          minHeight: "100vh",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
          background: "#f7f8fa",
          color: "#111827",
        }}
      >
        <div style={{ maxWidth: 420, padding: 24, textAlign: "center" }}>
          <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>
            Algo deu errado
          </h1>
          <p style={{ fontSize: 14, color: "#6b7280", marginBottom: 16 }}>
            Não foi possível carregar a aplicação. Tente novamente.
          </p>
          <button
            onClick={retry}
            style={{
              borderRadius: 8,
              border: "1px solid #e5e7eb",
              background: "#ffffff",
              padding: "8px 16px",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  );
}
