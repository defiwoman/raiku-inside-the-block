import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  emptyOnboarding,
  normalizeDisplayName,
  ONBOARDING_KEY,
  readOnboarding,
  saveOnboarding,
} from "./onboarding";
import { clearProgress, readProgress, saveRun } from "./progress";
import { simulate } from "./simulation";

describe("local beginner progress", () => {
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
  it("allows guest defaults and saves a tutorial without completing a game", () => {
    expect(readOnboarding()).toEqual(emptyOnboarding());
    expect(
      saveOnboarding({ displayName: "", choice: "pass", replayStep: 2 }),
    ).toBe(true);
    expect(readOnboarding()).toEqual({
      displayName: "",
      choice: "pass",
      replayStep: 2,
    });
    expect(readProgress().completedRuns).toBe(0);
  });
  it("trims and limits names to 24 characters, without splitting Unicode code points", () => {
    expect(normalizeDisplayName("  Ada\n  ")).toBe("Ada");
    expect(normalizeDisplayName("a".repeat(30))).toHaveLength(24);
    expect(Array.from(normalizeDisplayName("🌱".repeat(30)))).toHaveLength(24);
  });
  it("sanitizes corrupt or invalid saved choices and replay positions", () => {
    for (const data of ["broken", "null", "[]"]) {
      items.set(ONBOARDING_KEY, data);
      expect(readOnboarding()).toEqual(emptyOnboarding());
    }
    items.set(
      ONBOARDING_KEY,
      JSON.stringify({
        displayName: "a".repeat(80),
        choice: "pass",
        replayStep: 999,
      }),
    );
    expect(readOnboarding()).toEqual({
      displayName: "a".repeat(24),
      choice: "pass",
      replayStep: 0,
    });
    items.set(
      ONBOARDING_KEY,
      JSON.stringify({ choice: "pending", replayStep: 3 }),
    );
    expect(readOnboarding()).toEqual(emptyOnboarding());
  });
  it("preserves existing game progress and resets both types of progress", () => {
    saveRun(simulate(["earlier", "check", "eligible"]));
    saveOnboarding({ displayName: "Ada", choice: "act", replayStep: 3 });
    expect(readProgress().completedRuns).toBe(1);
    expect(readOnboarding().displayName).toBe("Ada");
    expect(clearProgress()).toBe(true);
    expect(items.size).toBe(0);
  });
  it("gracefully handles inaccessible browser storage", () => {
    vi.stubGlobal("localStorage", {
      getItem() {
        throw new Error("blocked");
      },
      setItem() {
        throw new Error("blocked");
      },
    });
    expect(readOnboarding()).toEqual(emptyOnboarding());
    expect(
      saveOnboarding({ displayName: "Ada", choice: null, replayStep: 0 }),
    ).toBe(false);
  });
});
