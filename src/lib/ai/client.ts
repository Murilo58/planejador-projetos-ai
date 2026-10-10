import { GoogleGenAI } from "@google/genai";

/**
 * Cliente da API de IA — exclusivamente server-side (RF-065 / spec §79).
 * Nunca importar este módulo de um componente client.
 */
let client: GoogleGenAI | undefined;

export function getAiClient(): GoogleGenAI {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY não definida. Configure-a em .env.local (ver .env.example).",
      );
    }
    client = new GoogleGenAI({ apiKey });
  }
  return client;
}
