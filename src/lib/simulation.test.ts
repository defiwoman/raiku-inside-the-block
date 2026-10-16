import { describe, expect, it } from "vitest";
import { isChoices, missions, simulate } from "./simulation";
import type { Choices } from "./simulation";

describe("illustrative simulation", () => {
  it("models an included and executed considered order", () => {
    expect(simulate(["earlier", "check", "eligible"])).toMatchObject({
      observation: 40,
      decision: 60,
      inclusion: 80,
      total: 180,
      included: true,
      executed: true,
      score: 100,
    });
  });
  it("does not equate inclusion with execution", () => {
    expect(simulate(["earlier", "rush", "eligible"])).toMatchObject({
      total: 130,
      included: true,
      executed: false,
      score: 70,
    });
  });
  it("misses the window when observation, checks, and queue consume too much time", () => {
    expect(simulate(["standard", "check", "queue"])).toMatchObject({
      total: 480,
      included: false,
      executed: false,
      score: 50,
    });
  });
  it("does not make the eligible path necessary for every successful scenario", () => {
    expect(simulate(["earlier", "check", "queue"])).toMatchObject({
      total: 340,
      included: true,
      executed: true,
    });
  });
  it("validates untrusted choices and rejects invalid engine inputs", () => {
    for (const value of [
      null,
      [],
      ["earlier", "check"],
      ["pending", "check", "eligible"],
      [1, 2, 3],
    ])
      expect(isChoices(value)).toBe(false);
    expect(() => simulate(["invalid", "check", "eligible"])).toThrow();
  });
  it("keeps all eight combinations deterministic, bounded, and independent of input mutation", () => {
    let count = 0;
    for (const see of missions[0].options)
      for (const act of missions[1].options)
        for (const land of missions[2].options) {
          const choices: Choices = [see.value, act.value, land.value];
          const run = simulate(choices);
          expect(run).toEqual(simulate(choices));
          expect(run.score).toBeGreaterThanOrEqual(0);
          expect(run.score).toBeLessThanOrEqual(100);
          expect(run.executed && !run.included).toBe(false);
          choices[0] = "changed";
          expect(run.choices[0]).toBe(see.value);
          count++;
        }
    expect(count).toBe(8);
  });
});
