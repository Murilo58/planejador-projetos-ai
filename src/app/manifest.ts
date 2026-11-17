import type { MetadataRoute } from "next";

import { getPlanningCopy } from "@/lib/planning-copy";

/**
 * Web App Manifest — ícones para "Adicionar à tela inicial" (Android/Chrome).
 *
 * `display: "browser"` mantém o comportamento atual: o atalho abre o site no
 * navegador, sem modo standalone. Não há Service Worker nem modo offline.
 * O iOS usa o `apple-icon.png` (convenção de arquivo em `app/`).
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Planejador de Projetos AI",
    short_name: "Planejador AI",
    description: getPlanningCopy().siteDescription,
    start_url: "/",
    display: "browser",
    background_color: "#f7f8fa",
    theme_color: "#4f46e5",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
