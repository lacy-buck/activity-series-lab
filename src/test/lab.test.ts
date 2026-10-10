import { describe, it, expect } from "vitest";
import { reacts, FULL_SERIES } from "@/lib/lab";

describe("activity series rules", () => {
  it("more active metal replaces less active ion", () => {
    expect(reacts("Vm", "Zb")).toBe(true);
  });
  it("less active metal does not react", () => {
    expect(reacts("Th", "Kr")).toBe(false);
  });
  it("Quarnite sits between Velmar and Zorbium", () => {
    expect(reacts("Vm", "Qn")).toBe(true);
    expect(reacts("Zb", "Qn")).toBe(false);
  });
  it("Ombrium sits between Velmar and Quarnite", () => {
    expect(reacts("Om", "Qn")).toBe(true);
    expect(reacts("Om", "Vm")).toBe(false);
    expect(FULL_SERIES.indexOf("Om")).toBe(2);
  });
});
