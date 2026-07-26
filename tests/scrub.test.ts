import { describe, it, expect } from "vitest";
import { frameIndex, lerp } from "../src/lib/scrub";

describe("frameIndex", () => {
  it("0 scroll → primo frame (1-based)", () => {
    expect(frameIndex(0, 1000, 70)).toBe(1);
  });
  it("fine range → ultimo frame", () => {
    expect(frameIndex(1000, 1000, 70)).toBe(70);
  });
  it("oltre il range resta sull'ultimo", () => {
    expect(frameIndex(1500, 1000, 70)).toBe(70);
  });
  it("scroll negativo resta sul primo", () => {
    expect(frameIndex(-50, 1000, 70)).toBe(1);
  });
  it("metà range → frame centrale", () => {
    expect(frameIndex(500, 1000, 70)).toBe(36);
  });
});

describe("lerp", () => {
  it("si avvicina al target", () => {
    expect(lerp(0, 10, 0.5)).toBe(5);
  });
  it("alpha 1 arriva subito", () => {
    expect(lerp(0, 10, 1)).toBe(10);
  });
});
