import { describe, expect, it } from "vitest";

import { specificationInputSchema } from "@/lib/specification/schema";
import { MAX_TEXT_LENGTH, MIN_TEXT_LENGTH } from "@/lib/specification/limits";

const validText = "a".repeat(MIN_TEXT_LENGTH);

describe("specificationInputSchema", () => {
  it("aceita uma entrada válida por texto", () => {
    const result = specificationInputSchema.safeParse({
      sourceType: "text",
      text: validText,
      framework: "scrum",
    });
    expect(result.success).toBe(true);
  });

  it("aceita uma entrada válida por PDF, com nome de arquivo", () => {
    const result = specificationInputSchema.safeParse({
      sourceType: "pdf",
      fileName: "especificacao.pdf",
      text: validText,
      framework: "kanban",
    });
    expect(result.success).toBe(true);
  });

  it("rejeita texto mais curto que o mínimo (RF-021)", () => {
    const result = specificationInputSchema.safeParse({
      sourceType: "text",
      text: "muito curto",
      framework: "scrum",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita texto mais longo que o máximo (RF-022/RN-012)", () => {
    const result = specificationInputSchema.safeParse({
      sourceType: "text",
      text: "a".repeat(MAX_TEXT_LENGTH + 1),
      framework: "scrum",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita um framework fora dos três suportados (RN-002)", () => {
    const result = specificationInputSchema.safeParse({
      sourceType: "text",
      text: validText,
      framework: "scrumban",
    });
    expect(result.success).toBe(false);
  });

  it("rejeita sourceType desconhecido", () => {
    const result = specificationInputSchema.safeParse({
      sourceType: "voice",
      text: validText,
      framework: "scrum",
    });
    expect(result.success).toBe(false);
  });
});
