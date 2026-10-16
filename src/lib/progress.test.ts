import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { clearProgress, readProgress, saveRun } from "./progress";
import { simulate } from "./simulation";

describe("personal progress", () => {
  let items: Map<string, string>;
  beforeEach(() => {
    items = new Map();
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => items.get(key) ?? null,
      setItem: (key: string, value: string) => items.set(key, value),
      removeItem: (key: string) => items.delete(key),
    });
  });
  afterEach(() => vi.unstubAllGlobals());
  it("persists only personal progress and keeps the best score across runs", () => {
    saveRun(simulate(["earlier", "check", "eligible"]));
    saveRun(simulate(["standard", "rush", "queue"]));
    expect(readProgress()).toMatchObject({ completedRuns: 2, bestScore: 100 });
    expect(items.size).toBe(1);
    expect(clearProgress()).toBe(true);
    expect(readProgress().lastRun).toBeNull();
  });
  it("ignores corrupt progress", () => {
    items.set("raiku-inside-the-block:progress:v1", "{broken json");
    expect(readProgress().completedRuns).toBe(0);
  });
  it("recomputes stored results instead of trusting stored outcomes", () => {
    saveRun(simulate(["standard", "rush", "queue"]));
    const key = [...items.keys()][0];
    const value = JSON.parse(items.get(key)!);
    value.lastRun.executed = true;
    items.set(key, JSON.stringify(value));
    expect(readProgress().lastRun?.executed).toBe(false);
  });
  it("allows a run to complete when browser storage is blocked", () => {
    vi.stubGlobal("localStorage", {
      getItem() {
        throw new Error("blocked");
      },
      setItem() {
        throw new Error("blocked");
      },
      removeItem() {
        throw new Error("blocked");
      },
    });
    expect(readProgress().lastRun).toBeNull();
    const { progress, persisted } = saveRun(
      simulate(["earlier", "check", "eligible"]),
    );
    expect(persisted).toBe(false);
    expect(progress.lastRun?.executed).toBe(true);
    expect(clearProgress()).toBe(false);
  });
});
