import { describe, expect, it } from "vitest";
import {
  DEFAULT_CONFIG,
  canCompare,
  comparisonKey,
  getDecisionView,
  isRaikuPathEligible,
  readRun,
  resolveRound,
  simulateRun,
  simulateTutorial,
} from "./simulation";
import { roundSpecs } from "./scenarios";
import { scoreDecision } from "./scoring";
import type { PlayerAction } from "./simulation";

import { sensibleActions } from "./test-fixtures";
const act = { kind: "act", pathId: "public" } as const;

describe("versioned deterministic simulation", () => {
  it("contains exactly three rounds for each mission", () => {
    expect(roundSpecs.map((round) => round.mission)).toEqual([
      "SEE",
      "SEE",
      "SEE",
      "ACT",
      "ACT",
      "ACT",
      "LAND",
      "LAND",
      "LAND",
    ]);
  });
  it("replays identical version/seed/actions exactly and does not mutate inputs or share mutable results", () => {
    const config = { ...DEFAULT_CONFIG };
    const actions = sensibleActions(config);
    const before = JSON.stringify({ config, actions });
    const run = simulateRun(config, actions);
    expect(run.ledger.netResult).toBe(
      run.rounds.reduce((sum, round) => sum + round.ledger.netResult, 0),
    );
    expect(run.ledger.netResult).toBe(
      run.ledger.grossBenefit -
        run.ledger.executionFee -
        run.ledger.tradingCost -
        run.ledger.operatingCost,
    );
    expect(JSON.parse(JSON.stringify(run))).toEqual(
      simulateRun(config, actions),
    );
    expect(JSON.stringify({ config, actions })).toBe(before);
    run.rounds[0].events[0].detail = "changed";
    expect(simulateRun(config, actions).rounds[0].events[0].detail).not.toBe(
      "changed",
    );
  });
  it("makes seed differences explicit and only compares matching configurations", () => {
    const changed = { ...DEFAULT_CONFIG, seed: 43 };
    expect(simulateRun(DEFAULT_CONFIG, sensibleActions())).not.toEqual(
      simulateRun(changed, sensibleActions(changed)),
    );
    expect(canCompare(DEFAULT_CONFIG, changed)).toBe(false);
    expect(
      canCompare(DEFAULT_CONFIG, { ...DEFAULT_CONFIG, version: "2.0.0" }),
    ).toBe(false);
    expect(comparisonKey(DEFAULT_CONFIG)).not.toBe(comparisonKey(changed));
  });
  it("rejects invalid configurations, indices, incomplete runs, actions, and stored inputs", () => {
    for (const seed of [-1, 1.5, NaN, 4294967296])
      expect(() => getDecisionView({ ...DEFAULT_CONFIG, seed }, 0)).toThrow();
    expect(() =>
      getDecisionView({ version: "unknown", seed: 42 }, 0),
    ).toThrow();
    expect(() => getDecisionView(DEFAULT_CONFIG, 9)).toThrow();
    expect(() => simulateRun(DEFAULT_CONFIG, [])).toThrow();
    expect(() =>
      resolveRound(DEFAULT_CONFIG, 0, {
        kind: "act",
        pathId: "invented",
      } as unknown as PlayerAction),
    ).toThrow();
    expect(
      readRun({ config: DEFAULT_CONFIG, actions: [{ kind: "pass" }] }),
    ).toBeNull();
  });
  it("keeps future market events out of the observation projection", () => {
    const view = getDecisionView(DEFAULT_CONFIG, 5);
    expect(Object.keys(view).sort()).toEqual(
      [
        "roundIndex",
        "roundId",
        "mission",
        "title",
        "lesson",
        "executedEvent",
        "observationTick",
        "signalAge",
        "maxSignalAge",
        "estimatedGross",
        "minNet",
        "executionFloor",
        "expiresAt",
        "uncertain",
        "eligible",
        "paths",
        "schedule",
      ].sort(),
    );
    expect(JSON.stringify(view)).not.toContain("laterGross");
    expect(JSON.stringify(view)).not.toContain("unknown at decision time");
    expect(
      resolveRound(DEFAULT_CONFIG, 5, act).events.some(
        (event) => event.kind === "market-change",
      ),
    ).toBe(true);
  });
  it("records execution, observation, arrival, inclusion, execution, and accounting in stable tick order", () => {
    const round = resolveRound(DEFAULT_CONFIG, 0, act);
    expect(round.events.map((event) => event.kind)).toEqual([
      "executed",
      "observation",
      "decision",
      "arrival",
      "inclusion",
      "execution",
      "accounting",
    ]);
    expect(round.events.map((event) => event.tick)).toEqual([
      0, 6, 6, 18, 40, 40, 40,
    ]);
  });
  it("uses only integer financial units and reconciles every ledger across seeds and paths", () => {
    for (let seed = 0; seed < 24; seed++)
      for (let i = 0; i < 9; i++) {
        const config = { ...DEFAULT_CONFIG, seed };
        const actions: PlayerAction[] = [
          { kind: "pass" },
          ...getDecisionView(config, i)
            .paths.filter((path) => path.enabled)
            .map((path) => ({ kind: "act" as const, pathId: path.id })),
        ];
        for (const action of actions) {
          const round = resolveRound(config, i, action);
          const ledger = round.ledger;
          expect(Object.values(ledger).every(Number.isSafeInteger)).toBe(true);
          expect(ledger.tradePnL).toBe(
            ledger.grossBenefit - ledger.executionFee - ledger.tradingCost,
          );
          expect(ledger.netResult).toBe(ledger.tradePnL - ledger.operatingCost);
        }
      }
  });
  it("charges no execution or trading fee for dropped transactions", () => {
    const round = resolveRound(DEFAULT_CONFIG, 6, act);
    expect(round).toMatchObject({
      status: "dropped",
      included: false,
      executed: false,
      inclusionTick: null,
    });
    expect(round.ledger).toMatchObject({
      grossBenefit: 0,
      executionFee: 0,
      tradingCost: 0,
      operatingCost: 4,
      tradePnL: 0,
      netResult: -4,
    });
    expect(
      round.events.find((event) => event.kind === "drop")?.detail,
    ).toContain("Network execution fee: 0");
  });
  it("charges the disclosed included-attempt fee on a failed execution but no trading cost", () => {
    const failed = Array.from({ length: 20 }, (_, seed) =>
      resolveRound({ ...DEFAULT_CONFIG, seed }, 5, act),
    ).find((round) => round.status === "failed")!;
    expect(failed).toBeDefined();
    expect(failed.ledger).toMatchObject({
      grossBenefit: 0,
      executionFee: 6,
      tradingCost: 0,
      operatingCost: 4,
      tradePnL: -6,
      netResult: -10,
    });
    expect(
      failed.events.find((event) => event.kind === "execution")?.detail,
    ).toContain("6 credits for the included attempt");
  });
  it("gates the Raiku example on opportunity eligibility, producer, arrival, and expiry", () => {
    const eligible = {
      eligible: true,
      producer: "Raiku",
      arrivalTick: 13,
      targetTick: 40,
      expiresAt: 90,
    };
    expect(isRaikuPathEligible(eligible)).toBe(true);
    for (const override of [
      { eligible: false },
      { producer: "Other" },
      { arrivalTick: 41 },
      { expiresAt: 39 },
    ])
      expect(isRaikuPathEligible({ ...eligible, ...override })).toBe(false);
    expect(
      getDecisionView(DEFAULT_CONFIG, 8).paths.find(
        (path) => path.id === "raiku",
      )?.enabled,
    ).toBe(false);
    expect(() =>
      resolveRound(DEFAULT_CONFIG, 8, { kind: "act", pathId: "raiku" }),
    ).toThrow("unavailable");
    expect(() =>
      resolveRound(DEFAULT_CONFIG, 0, { kind: "act", pathId: "raiku" }),
    ).toThrow("unavailable");
  });
  it("does not force the Raiku-labelled path to produce a profit", () => {
    for (let seed = 0; seed < 20; seed++) {
      const config = { ...DEFAULT_CONFIG, seed };
      const positive = resolveRound(config, 6, {
        kind: "act",
        pathId: "raiku",
      });
      expect(positive.included && positive.executed).toBe(true);
      expect(positive.ledger.netResult).toBeGreaterThan(0);
      const unprofitable = resolveRound(config, 7, {
        kind: "act",
        pathId: "raiku",
      });
      expect(unprofitable.included && unprofitable.executed).toBe(true);
      expect(unprofitable.ledger.netResult).toBeLessThanOrEqual(0);
    }
  });
  it("passing has no trade P&L or actual costs, and opportunity cost is separate", () => {
    const result = resolveRound(DEFAULT_CONFIG, 0, { kind: "pass" });
    expect(result).toMatchObject({
      status: "passed",
      included: false,
      executed: false,
      arrivalTick: null,
    });
    expect(result.ledger).toMatchObject({
      grossBenefit: 0,
      executionFee: 0,
      tradingCost: 0,
      operatingCost: 0,
      tradePnL: 0,
      netResult: 0,
    });
    expect(result.ledger.forgoneOpportunity).toBeGreaterThan(0);
    expect(
      result.events.some((event) =>
        ["arrival", "inclusion", "execution"].includes(event.kind),
      ),
    ).toBe(false);
  });
  it("computes transparent points exclusively from decision-time facts", () => {
    const view = getDecisionView(DEFAULT_CONFIG, 5);
    expect(
      scoreDecision(view, act).contributions.map((item) => item.points),
    ).toEqual([3, 4, 3]);
    expect(scoreDecision(view, { kind: "pass" }).total).toBe(10);
    const outcomes = Array.from({ length: 20 }, (_, seed) =>
      resolveRound({ ...DEFAULT_CONFIG, seed }, 5, act),
    );
    expect(new Set(outcomes.map((round) => round.status))).toEqual(
      new Set(["executed", "failed"]),
    );
    expect(outcomes.every((round) => round.score.total === 10)).toBe(true);
  });
  it("rewards freshness and net-cost discipline without tying the score to profits", () => {
    expect(resolveRound(DEFAULT_CONFIG, 1, { kind: "pass" }).score.total).toBe(
      10,
    );
    expect(resolveRound(DEFAULT_CONFIG, 4, { kind: "pass" }).score.total).toBe(
      10,
    );
    expect(
      resolveRound(DEFAULT_CONFIG, 4, act).ledger.netResult,
    ).toBeLessThanOrEqual(0);
    expect(simulateRun(DEFAULT_CONFIG, sensibleActions()).score).toBe(90);
    const allPass = simulateRun(
      DEFAULT_CONFIG,
      roundSpecs.map(() => ({ kind: "pass" })),
    );
    expect(allPass.ledger.netResult).toBe(0);
    expect(allPass.score).toBeLessThan(90);
  });
  it("preserves the self-paced beginner tutorial", () => {
    expect(simulateTutorial("act")).toMatchObject({
      included: true,
      executed: false,
      arrivedAt: 240,
    });
    expect(simulateTutorial("pass")).toMatchObject({
      included: false,
      executed: false,
      arrivedAt: null,
    });
  });
});
