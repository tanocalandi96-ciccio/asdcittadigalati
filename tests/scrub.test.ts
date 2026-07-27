import { describe, it, expect } from "vitest";
import { framePosition, frameIndex, lerp } from "../src/lib/scrub";

describe("framePosition", () => {
  it("0 scroll → esattamente il primo frame", () => {
    expect(framePosition(0, 1000, 70)).toBe(1);
  });
  it("fine range → esattamente l'ultimo frame", () => {
    expect(framePosition(1000, 1000, 70)).toBe(70);
  });
  it("resta frazionaria tra due frame, senza arrotondare", () => {
    // 1/4 del range su 70 frame: 1 + 0.25 * 69 = 18.25
    expect(framePosition(250, 1000, 70)).toBeCloseTo(18.25, 5);
  });
  it("clamp fuori range in entrambe le direzioni", () => {
    expect(framePosition(-500, 1000, 70)).toBe(1);
    expect(framePosition(5000, 1000, 70)).toBe(70);
  });
  it("range non valido non produce NaN", () => {
    expect(framePosition(100, 0, 70)).toBe(70);
  });
  it("un solo frame resta sempre sul primo", () => {
    expect(framePosition(500, 1000, 1)).toBe(1);
  });
});

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
