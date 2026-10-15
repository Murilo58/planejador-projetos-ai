import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

/**
 * Complementa `generate-structured.test.ts` (que simula o cliente):
 * aqui o SDK real `@google/genai` é usado de ponta a ponta e só o
 * `fetch` é substituído — prova que uma resposta HTTP 503 de verdade,
 * no formato devolvido pela API do Gemini, chega a `generateStructured`
 * como indisponibilidade transitória e dispara a espera com jitter.
 * Nenhuma chamada real à IA é feita.
 */

vi.mock("@/lib/ai/log", () => ({ logAiEvent: vi.fn() }));

const fetchMock = vi.fn<typeof fetch>();

const overloadedResponse = () =>
  new Response(
    JSON.stringify({
      error: {
        code: 503,
        message:
          "This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.",
        status: "UNAVAILABLE",
      },
    }),
    { status: 503, headers: { "Content-Type": "application/json" } },
  );

const okResponse = () =>
  new Response(
    JSON.stringify({
      candidates: [
        {
          content: { role: "model", parts: [{ text: '{"ok":true}' }] },
          finishReason: "STOP",
        },
      ],
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );

describe("generateStructured com o SDK real e HTTP 503 simulado", () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv("GEMINI_API_KEY", "chave-de-teste");
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    fetchMock.mockReset();
    vi.useFakeTimers({ toFake: ["setTimeout", "clearTimeout"] });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  async function load() {
    return (await import("@/lib/ai/generate-structured")).generateStructured;
  }

  it("espera ~3,5s após o 503 e recupera na segunda tentativa", async () => {
    fetchMock
      .mockResolvedValueOnce(overloadedResponse())
      .mockResolvedValueOnce(okResponse());
    const generateStructured = await load();

    const result = generateStructured({
      stage: "test",
      schema: z.object({ ok: z.boolean() }),
      systemInstruction: "s",
      prompt: "p",
    });

    await vi.advanceTimersByTimeAsync(3_499);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1);
    await expect(result).resolves.toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("com 503 nas duas tentativas, falha como indisponível após uma única espera", async () => {
    fetchMock.mockImplementation(async () => overloadedResponse());
    const generateStructured = await load();

    const result = generateStructured({
      stage: "test",
      schema: z.object({ ok: z.boolean() }),
      systemInstruction: "s",
      prompt: "p",
    });
    const assertion = expect(result).rejects.toMatchObject({
      code: "unavailable",
    });

    await vi.advanceTimersByTimeAsync(3_500);
    await assertion;
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
