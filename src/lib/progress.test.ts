import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  bestFor,
  bestHistoryFor,
  clearProgress,
  readDraft,
  readProgress,
  saveDraft,
  saveRun,
} from "./progress";
import { DEFAULT_CONFIG, simulateRun } from "./simulation";
import { sensibleActions } from "./test-fixtures";

// Fixtures are action records; outcomes are always recomputed through the actual engine.
describe("versioned personal progress", () => {
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
  it("keeps only improvements in local best history and separates seeds", () => {
    const low = simulateRun(
      DEFAULT_CONFIG,
      Array.from({ length: 9 }, () => ({ kind: "pass" })),
    );
    saveRun(low);
    saveRun(simulateRun(DEFAULT_CONFIG, sensibleActions()));
    saveRun(low);
    const other = { ...DEFAULT_CONFIG, seed: 9 };
    saveRun(simulateRun(other, sensibleActions(other)));
    expect(bestHistoryFor(DEFAULT_CONFIG)).toEqual([
      { runNumber: 1, score: low.score, maxScore: 90 },
      { runNumber: 2, score: 90, maxScore: 90 },
    ]);
    expect(bestHistoryFor(other)).toEqual([
      { runNumber: 4, score: 90, maxScore: 90 },
    ]);
    expect(clearProgress()).toBe(true);
    expect(bestHistoryFor(DEFAULT_CONFIG)).toEqual([]);
  });
  it("recomputes stored results and keeps best scores only for matching seed and version", () => {
    saveRun(simulateRun(DEFAULT_CONFIG, sensibleActions()));
    const another = { ...DEFAULT_CONFIG, seed: 43 };
    saveRun(
      simulateRun(
        another,
        Array.from({ length: 9 }, () => ({ kind: "pass" })),
      ),
    );
    expect(bestFor(DEFAULT_CONFIG)).toBe(90);
    expect(bestFor(another)).toBeLessThan(90);
    expect(bestFor({ ...DEFAULT_CONFIG, seed: 999 })).toBeNull();
    expect(bestFor({ ...DEFAULT_CONFIG, version: "old" })).toBeNull();
    expect(readProgress().completedRuns).toBe(2);
    const data = JSON.parse(items.get("raiku-inside-the-block:progress:v2")!);
    data.lastRun.score = 999;
    items.set("raiku-inside-the-block:progress:v2", JSON.stringify(data));
    expect(readProgress().lastRun?.score).not.toBe(999);
  });
  it("retains prototype records but never imports or compares their scores", () => {
    items.set(
      "raiku-inside-the-block:progress:v1",
      JSON.stringify({ bestScore: 100 }),
    );
    expect(readProgress()).toMatchObject({
      completedRuns: 0,
      lastRun: null,
      legacyAvailable: true,
    });
    saveRun(simulateRun(DEFAULT_CONFIG, sensibleActions()));
    expect(items.has("raiku-inside-the-block:progress:v1")).toBe(true);
    expect(bestFor(DEFAULT_CONFIG)).toBe(90);
  });
  it("can resume a paused decision or review and rejects invalid draft paths", () => {
    saveDraft({
      config: DEFAULT_CONFIG,
      actions: [{ kind: "pass" }],
      reviewing: true,
    });
    expect(readDraft()?.reviewing).toBe(true);
    saveDraft({
      config: DEFAULT_CONFIG,
      actions: [{ kind: "act", pathId: "raiku" }],
      reviewing: true,
    });
    expect(readDraft()).toBeNull();
    items.set("raiku-inside-the-block:progress:v2", "{broken");
    expect(readProgress().lastRun).toBeNull();
  });
  it("clears every generation of personal progress and handles blocked storage", () => {
    saveRun(simulateRun(DEFAULT_CONFIG, sensibleActions()));
    saveDraft({ config: DEFAULT_CONFIG, actions: [], reviewing: false });
    items.set("raiku-inside-the-block:progress:v1", "legacy");
    expect(clearProgress()).toBe(true);
    expect(items.size).toBe(0);
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
    expect(
      saveRun(simulateRun(DEFAULT_CONFIG, sensibleActions())).persisted,
    ).toBe(false);
    expect(clearProgress()).toBe(false);
  });
});
