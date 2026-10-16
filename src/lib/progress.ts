import { isChoices, simulate } from "./simulation";
import type { RunResult } from "./simulation";
import { ONBOARDING_KEY } from "./onboarding";

const KEY = "raiku-inside-the-block:progress:v1";
export interface Progress {
  completedRuns: number;
  bestScore: number;
  lastRun: RunResult | null;
}
const empty: Progress = { completedRuns: 0, bestScore: 0, lastRun: null };

export function readProgress(): Progress {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(KEY) || "null");
    if (!value || typeof value !== "object") return { ...empty };
    const data = value as Record<string, unknown>;
    const last = data.lastRun as Record<string, unknown> | null;
    if (
      !Number.isSafeInteger(data.completedRuns) ||
      (data.completedRuns as number) < 0 ||
      typeof data.bestScore !== "number" ||
      !Number.isFinite(data.bestScore) ||
      data.bestScore < 0 ||
      data.bestScore > 100 ||
      !last ||
      !isChoices(last.choices)
    )
      return { ...empty };
    return {
      completedRuns: data.completedRuns as number,
      bestScore: data.bestScore,
      lastRun: simulate(last.choices),
    };
  } catch {
    return { ...empty };
  }
}

export function saveRun(run: RunResult): {
  progress: Progress;
  persisted: boolean;
} {
  const previous = readProgress();
  const progress = {
    completedRuns: previous.completedRuns + 1,
    bestScore: Math.max(previous.bestScore, run.score),
    lastRun: run,
  };
  try {
    localStorage.setItem(KEY, JSON.stringify(progress));
    return { progress, persisted: true };
  } catch {
    return { progress, persisted: false };
  }
}

export function clearProgress(): boolean {
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem(ONBOARDING_KEY);
    return true;
  } catch {
    return false;
  }
}
