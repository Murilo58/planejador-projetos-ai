import { ApiError } from "@google/genai";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { z } from "zod";

import { AiGenerationError } from "@/lib/ai/errors";

const generateContent = vi.fn();

vi.mock("@/lib/ai/client", () => ({
  getAiClient: () => ({ models: { generateContent } }),
}));
vi.mock("@/lib/ai/log", () => ({ logAiEvent: vi.fn() }));

const { generateStructured } = await import("@/lib/ai/generate-structured");

const schema = z.object({ ok: z.boolean() });

function call() {
  return generateStructured({
    stage: "test",
    schema,
    systemInstruction: "s",
    prompt: "p",
  });
}

const validResponse = { text: JSON.stringify({ ok: true }) };
const overloaded = () => new ApiError({ message: "high demand", status: 503 });

describe("generateStructured — nova tentativa", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Meio do intervalo de 2–5s → 3,5s de espera, determinístico.
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    generateContent.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("espera com jitter antes de repetir após um 503 e então recupera", async () => {
    generateContent
      .mockRejectedValueOnce(overloaded())
      .mockResolvedValueOnce(validResponse);

    const result = call();
    await vi.advanceTimersByTimeAsync(3_499);
    expect(generateContent).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(1);
    await expect(result).resolves.toEqual({ ok: true });
    expect(generateContent).toHaveBeenCalledTimes(2);
  });

  it("também espera após 429 e após falha de rede sem status HTTP", async () => {
    generateContent
      .mockRejectedValueOnce(new ApiError({ message: "quota", status: 429 }))
      .mockResolvedValueOnce(validResponse);
    const afterRateLimit = call();
    await vi.advanceTimersByTimeAsync(0);
    expect(generateContent).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(3_500);
    await expect(afterRateLimit).resolves.toEqual({ ok: true });

    generateContent.mockReset();
    generateContent
      .mockRejectedValueOnce(new TypeError("fetch failed"))
      .mockResolvedValueOnce(validResponse);
    const afterNetwork = call();
    await vi.advanceTimersByTimeAsync(0);
    expect(generateContent).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(3_500);
    await expect(afterNetwork).resolves.toEqual({ ok: true });
  });

  it("não espera depois da última tentativa: falha como indisponível", async () => {
    generateContent.mockRejectedValue(overloaded());

    const result = call();
    const assertion = expect(result).rejects.toMatchObject({
      code: "unavailable",
    });
    await vi.advanceTimersByTimeAsync(3_500);
    await assertion;
    expect(generateContent).toHaveBeenCalledTimes(2);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("repete imediatamente quando a resposta é inválida (sem espera)", async () => {
    generateContent
      .mockResolvedValueOnce({ text: "não é JSON" })
      .mockResolvedValueOnce(validResponse);

    const result = call();
    await vi.advanceTimersByTimeAsync(0);
    await expect(result).resolves.toEqual({ ok: true });
    expect(generateContent).toHaveBeenCalledTimes(2);
  });

  it("repete imediatamente após timeout e após erro 4xx não transitório", async () => {
    const timeout = new Error("timed out");
    timeout.name = "TimeoutError";
    generateContent
      .mockRejectedValueOnce(timeout)
      .mockResolvedValueOnce(validResponse);
    const afterTimeout = call();
    await vi.advanceTimersByTimeAsync(0);
    await expect(afterTimeout).resolves.toEqual({ ok: true });

    generateContent.mockReset();
    generateContent
      .mockRejectedValueOnce(new ApiError({ message: "bad", status: 400 }))
      .mockResolvedValueOnce(validResponse);
    const afterBadRequest = call();
    await vi.advanceTimersByTimeAsync(0);
    await expect(afterBadRequest).resolves.toEqual({ ok: true });
  });

  it("mantém a classificação de timeout ao esgotar as tentativas", async () => {
    const timeout = new Error("timed out");
    timeout.name = "TimeoutError";
    generateContent.mockRejectedValue(timeout);

    const result = call();
    const assertion = expect(result).rejects.toBeInstanceOf(AiGenerationError);
    await vi.advanceTimersByTimeAsync(0);
    await assertion;
    await expect(result).rejects.toMatchObject({ code: "timeout" });
  });
});
