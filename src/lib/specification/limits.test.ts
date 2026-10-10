import { describe, expect, it } from "vitest";

import { formatBytes } from "@/lib/specification/limits";

describe("formatBytes", () => {
  it("formata bytes abaixo de 1 KB", () => {
    expect(formatBytes(500)).toBe("500 B");
  });

  it("formata quilobytes", () => {
    expect(formatBytes(2048)).toBe("2 KB");
  });

  it("formata megabytes com uma casa decimal", () => {
    expect(formatBytes(10 * 1024 * 1024)).toBe("10.0 MB");
  });
});
