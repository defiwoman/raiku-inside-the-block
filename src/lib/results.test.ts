import { describe, expect, it } from "vitest";
import { DEFAULT_CONFIG, resolveRound, simulateRun } from "./simulation";
import { sensibleActions } from "./test-fixtures";
import {
  missionBreakdown,
  replayStages,
  roundNarrative,
  runLesson,
} from "./results";

describe("results derived from engine records", () => {
  it("reconciles mission scores and net results with the actual run", () => {
    const run = simulateRun(DEFAULT_CONFIG, sensibleActions());
    const missions = missionBreakdown(run);
    expect(missions.map((mission) => mission.id)).toEqual([
      "SEE",
      "ACT",
      "LAND",
    ]);
    expect(missions.reduce((sum, mission) => sum + mission.score, 0)).toBe(
      run.score,
    );
    expect(missions.reduce((sum, mission) => sum + mission.net, 0)).toBe(
      run.ledger.netResult,
    );
    expect(missions.every((mission) => mission.max === 30)).toBe(true);
  });
  it("labels the actual executed, observed, decided, arrived, and outcome stages", () => {
    const round = resolveRound(DEFAULT_CONFIG, 0, {
      kind: "act",
      pathId: "public",
    });
    const stages = replayStages(round);
    expect(stages.map((stage) => stage.label)).toEqual([
      "Event executed",
      "Strategy observed",
      "Player decided",
      "Submission arrived",
      "Inclusion/execution outcome",
    ]);
    expect(stages.map((stage) => stage.tick)).toEqual([
      0,
      6,
      6,
      round.arrivalTick,
      round.inclusionTick,
    ]);
    for (const stage of stages)
      expect(round.events[stage.eventIndex!].tick).toBe(stage.tick);
  });
  it("does not invent arrival or inclusion for a Pass or inclusion for a drop", () => {
    const passed = resolveRound(DEFAULT_CONFIG, 0, { kind: "pass" });
    expect(replayStages(passed)[3]).toMatchObject({
      tick: null,
      eventIndex: null,
    });
    expect(passed.events[replayStages(passed)[4].eventIndex!].kind).toBe(
      "pass",
    );
    const dropped = resolveRound(DEFAULT_CONFIG, 6, {
      kind: "act",
      pathId: "public",
    });
    const stages = replayStages(dropped);
    expect(stages[3].tick).toBe(dropped.arrivalTick);
    expect(dropped.events[stages[4].eventIndex!].kind).toBe("drop");
    expect(dropped.events.some((event) => event.kind === "inclusion")).toBe(
      false,
    );
  });
  it("explains unknown later failures without criticising a sensible decision", () => {
    const config = Array.from({ length: 20 }, (_, seed) => ({
      ...DEFAULT_CONFIG,
      seed,
    })).find(
      (config) =>
        resolveRound(config, 5, { kind: "act", pathId: "public" }).status ===
        "failed",
    )!;
    const round = resolveRound(config, 5, { kind: "act", pathId: "public" });
    expect(roundNarrative(round).knew).toContain(
      `Signal age: ${round.decision.signalAge}`,
    );
    expect(roundNarrative(round).knew).not.toContain("gross was 12");
    expect(roundNarrative(round).next).toContain(
      "did not reduce your learning points",
    );
    const run = simulateRun(config, sensibleActions(config));
    expect(run.score).toBe(90);
    expect(runLesson(run).roundIndex).toBe(5);
  });
  it("selects one actionable lesson from a visible-cost mistake instead of a profit ranking", () => {
    const actions = sensibleActions();
    actions[7] = { kind: "act", pathId: "raiku" };
    const run = simulateRun(DEFAULT_CONFIG, actions);
    expect(runLesson(run)).toMatchObject({ roundIndex: 7, mission: "LAND" });
    expect(runLesson(run).body).toContain("Subtract every applicable cost");
    expect(roundNarrative(run.rounds[7]).chose).toContain(
      "Raiku co-location example",
    );
  });
});
