import {
  consolidatedResultSchema,
  type ConsolidatedResult,
} from "@/lib/ai/schemas/result";

/**
 * Persistência do resultado durante a sessão (RNF-012 / spec §9):
 * `sessionStorage`, nunca `localStorage` — descartado ao fechar a aba, e
 * nunca enviado de volta ao servidor a partir daqui.
 */
const STORAGE_KEY = "planejador:result";

export function saveResultToSession(result: ConsolidatedResult): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(result));
}

export function loadResultFromSession(): ConsolidatedResult | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = consolidatedResultSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

export function clearResultFromSession(): void {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(STORAGE_KEY);
}
