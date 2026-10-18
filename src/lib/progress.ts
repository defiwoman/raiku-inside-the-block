import {
  canCompare,
  comparisonKey,
  isPlayerAction,
  isRunConfig,
  readRun,
  resolveRound,
} from "./simulation";
import type { PlayerAction, RunConfig, RunResult } from "./simulation";
import { ONBOARDING_KEY } from "./onboarding";

const KEY = "raiku-inside-the-block:progress:v2";
const LEGACY_KEY = "raiku-inside-the-block:progress:v1";
const DRAFT_KEY = "raiku-inside-the-block:game:v3";
type Snapshot = { config: RunConfig; actions: PlayerAction[] };
interface BestRecord {
  runNumber: number;
  record: Snapshot;
}
export interface Progress {
  completedRuns: number;
  bestScore: number;
  lastRun: RunResult | null;
  legacyAvailable: boolean;
}
function snapshot(run: RunResult): Snapshot {
  return { config: run.config, actions: run.actions };
}
function loadStore(): {
  completedRuns: number;
  lastRun: RunResult | null;
  best: Record<string, Snapshot>;
  history: BestRecord[];
  legacyAvailable: boolean;
} {
  const empty = {
    completedRuns: 0,
    lastRun: null,
    best: {},
    history: [],
    legacyAvailable: false,
  };
  try {
    const legacyAvailable = localStorage.getItem(LEGACY_KEY) !== null;
    const data = JSON.parse(localStorage.getItem(KEY) || "null");
    if (!data || typeof data !== "object") return { ...empty, legacyAvailable };
    const lastRun = readRun(data.lastRun);
    if (
      !lastRun ||
      !Number.isSafeInteger(data.completedRuns) ||
      data.completedRuns < 1
    )
      return { ...empty, legacyAvailable };
    const best: Record<string, Snapshot> = {};
    if (data.best && typeof data.best === "object")
      for (const value of Object.values(data.best).slice(-32)) {
        const run = readRun(value);
        if (run) best[comparisonKey(run.config)] = snapshot(run);
      }
    const history: BestRecord[] = [];
    if (Array.isArray(data.history))
      for (const entry of data.history.slice(-20)) {
        const run = readRun(entry?.record);
        if (
          run &&
          Number.isSafeInteger(entry.runNumber) &&
          entry.runNumber > 0 &&
          entry.runNumber <= data.completedRuns
        )
          history.push({ runNumber: entry.runNumber, record: snapshot(run) });
      }
    return {
      completedRuns: data.completedRuns,
      lastRun,
      best,
      history,
      legacyAvailable,
    };
  } catch {
    return empty;
  }
}
export function readProgress(): Progress {
  const data = loadStore();
  const best = data.lastRun
    ? readRun(data.best[comparisonKey(data.lastRun.config)])
    : null;
  return {
    completedRuns: data.completedRuns,
    lastRun: data.lastRun,
    bestScore: best?.score ?? data.lastRun?.score ?? 0,
    legacyAvailable: data.legacyAvailable,
  };
}
export function bestFor(config: RunConfig): number | null {
  const run = readRun(loadStore().best[comparisonKey(config)]);
  return run && canCompare(run.config, config) ? run.score : null;
}
export function bestHistoryFor(
  config: RunConfig,
): { runNumber: number | null; score: number; maxScore: number }[] {
  const data = loadStore();
  const entries = data.history.flatMap((entry) => {
    const run = readRun(entry.record);
    return run && canCompare(run.config, config)
      ? [
          {
            runNumber: entry.runNumber as number | null,
            score: run.score,
            maxScore: run.maxScore,
          },
        ]
      : [];
  });
  const best = readRun(data.best[comparisonKey(config)]);
  if (!entries.length && best)
    return [{ runNumber: null, score: best.score, maxScore: best.maxScore }];
  return entries;
}
export function saveRun(input: RunResult): {
  progress: Progress;
  persisted: boolean;
} {
  const run = readRun(input);
  if (!run) throw new Error("Cannot save an invalid or incomplete run.");
  const previous = loadStore();
  const key = comparisonKey(run.config);
  const existing = readRun(previous.best[key]);
  const best = {
    ...previous.best,
    [key]: snapshot(existing && existing.score > run.score ? existing : run),
  };
  const progress = {
    completedRuns: previous.completedRuns + 1,
    lastRun: run,
    bestScore: readRun(best[key])!.score,
    legacyAvailable: previous.legacyAvailable,
  };
  const history =
    !existing || run.score > existing.score
      ? [
          ...previous.history,
          { runNumber: progress.completedRuns, record: snapshot(run) },
        ].slice(-20)
      : previous.history;
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({
        completedRuns: progress.completedRuns,
        lastRun: snapshot(run),
        best,
        history,
      }),
    );
    localStorage.removeItem(DRAFT_KEY);
    return { progress, persisted: true };
  } catch {
    return { progress, persisted: false };
  }
}
export interface GameDraft {
  config: RunConfig;
  actions: PlayerAction[];
  reviewing: boolean;
}
export function readDraft(): GameDraft | null {
  try {
    const data = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
    if (
      !data ||
      !isRunConfig(data.config) ||
      !Array.isArray(data.actions) ||
      data.actions.length > 9 ||
      !data.actions.every(isPlayerAction) ||
      typeof data.reviewing !== "boolean"
    )
      return null;
    if (
      (data.reviewing && data.actions.length === 0) ||
      (!data.reviewing && data.actions.length === 9)
    )
      return null;
    data.actions.forEach((action: PlayerAction, index: number) =>
      resolveRound(data.config, index, action),
    );
    return {
      config: { ...data.config },
      actions: data.actions.map((action: PlayerAction) => ({ ...action })),
      reviewing: data.reviewing,
    };
  } catch {
    return null;
  }
}
export function saveDraft(draft: GameDraft): boolean {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    return true;
  } catch {
    return false;
  }
}
export function clearProgress(): boolean {
  try {
    for (const key of [KEY, LEGACY_KEY, DRAFT_KEY, ONBOARDING_KEY])
      localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}
