import { describe, it, expect } from "vitest";
import { reacts, buildScenario, SCENARIOS, MAX_ATTEMPTS } from "@/lib/lab";

describe("activity series rules", () => {
  it("has 3 different attempts", () => {
    expect(MAX_ATTEMPTS).toBe(3);
    const orders = new Set(SCENARIOS.map((s) => s.series.join(",")));
    expect(orders.size).toBe(3);
  });
  it("more active metal replaces less active ion", () => {
    const s = SCENARIOS[0]!.series;
    expect(reacts(s, "Vm", "Zb")).toBe(true);
    expect(reacts(s, "Th", "Kr")).toBe(false);
  });
  it("every attempt's Om clues place Om correctly and questions have valid answers", () => {
    for (let a = 0; a < 3; a++) {
      const sc = buildScenario(a);
      const k = sc.full.indexOf("Om");
      expect(sc.clues[0]!.metal).toBe(sc.full[k - 1]);
      expect(sc.clues[0]!.metal).not.toBe("Qn");
      for (const c of sc.clues) expect(reacts(sc.full, c.metal, c.ion)).toBe(true);
      expect(sc.questions.length).toBe(14);
      for (const q of sc.questions) expect(q.answer).toBeGreaterThanOrEqual(0);
    }
  });
});
