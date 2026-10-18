import {
  DEFAULT_CONFIG,
  model,
  roundSpecs,
  SCENARIO_VERSION,
} from "./scenarios";
import { scoreDecision } from "./scoring";
import type {
  DecisionView,
  Ledger,
  PathView,
  PlayerAction,
  ReplayEvent,
  RoundResult,
  RunConfig,
  RunResult,
  Scenario,
} from "./simulation-types";
export type * from "./simulation-types";
export { missions, DEFAULT_CONFIG, SCENARIO_VERSION } from "./scenarios";
export { simulateTutorial, tutorialScenario } from "./tutorial";
export type { TutorialChoice } from "./tutorial";

export function isRunConfig(value: unknown): value is RunConfig {
  if (!value || typeof value !== "object") return false;
  const data = value as Record<string, unknown>;
  return (
    data.version === SCENARIO_VERSION &&
    Number.isInteger(data.seed) &&
    (data.seed as number) >= 0 &&
    (data.seed as number) <= 0xffffffff
  );
}
export function isPlayerAction(value: unknown): value is PlayerAction {
  if (!value || typeof value !== "object") return false;
  const data = value as Record<string, unknown>;
  return data.kind === "pass"
    ? data.pathId === undefined
    : data.kind === "act" &&
        (data.pathId === "public" || data.pathId === "raiku");
}
export function comparisonKey(config: RunConfig): string {
  return `${config.version}/seed-${config.seed}`;
}
export function canCompare(a: RunConfig, b: RunConfig): boolean {
  return a.version === b.version && a.seed === b.seed;
}

// FNV-1a with explicit 32-bit multiplication; no clock, Math.random, or mutable PRNG state.
function hash(text: string): number {
  let value = 2166136261;
  for (const character of text)
    value = Math.imul(value ^ character.charCodeAt(0), 16777619) >>> 0;
  return value;
}
function scenarioFor(config: RunConfig, index: number): Scenario {
  if (!isRunConfig(config))
    throw new Error("Unsupported scenario version or invalid uint32 seed.");
  if (!Number.isInteger(index) || index < 0 || index >= roundSpecs.length)
    throw new Error("Round index must be between 0 and 8.");
  const spec = roundSpecs[index];
  const jitter =
    model.grossOffsets[
      hash(`${comparisonKey(config)}:${spec.id}:gross`) %
        model.grossOffsets.length
    ];
  const gross = spec.gross + jitter;
  const events = [
    {
      tick: 0,
      gross,
      description:
        "An already-executed swap changed the simulated market and created this snapshot.",
    },
  ];
  for (const [changeIndex, change] of spec.changes.entries()) {
    const alternative =
      change.alternativeGross !== undefined &&
      hash(`${comparisonKey(config)}:${spec.id}:change-${changeIndex}`) % 2 ===
        1;
    events.push({
      tick: change.tick,
      gross: alternative ? change.alternativeGross! : change.gross,
      description: alternative
        ? (change.alternativeDescription ?? change.description)
        : change.description,
    });
  }
  const schedule = model.blockTicks.map((tick, slot) => ({
    id: `B${index + 1}-${slot + 1}`,
    tick,
    producer:
      slot % 2 === 0
        ? spec.targetProducer
        : spec.targetProducer === "Raiku"
          ? ("Other" as const)
          : ("Raiku" as const),
  }));
  return { ...spec, gross, events, schedule };
}
export function isRaikuPathEligible(input: {
  eligible: boolean;
  producer: string;
  arrivalTick: number;
  targetTick: number;
  expiresAt: number;
}): boolean {
  return (
    input.eligible &&
    input.producer === "Raiku" &&
    input.arrivalTick <= input.targetTick &&
    input.targetTick <= input.expiresAt
  );
}
function pathsFor(scenario: Scenario): PathView[] {
  return (["public", "raiku"] as const)
    .filter((id) => id === "public" || scenario.mission === "LAND")
    .map((id) => {
      const arrivalTick =
        scenario.observedAt +
        (id === "public" ? scenario.publicDelay : model.raikuArrivalDelay);
      const target = scenario.schedule[0];
      const enabled =
        id === "public" ||
        isRaikuPathEligible({
          eligible: scenario.eligible,
          producer: target.producer,
          arrivalTick,
          targetTick: target.tick,
          expiresAt: scenario.expiresAt,
        });
      const block =
        id === "raiku"
          ? enabled
            ? target
            : undefined
          : scenario.schedule.find(
              (slot) =>
                slot.tick >= arrivalTick && slot.tick <= scenario.expiresAt,
            );
      const operatingCost = model.operatingCosts[id];
      return {
        id,
        label:
          id === "raiku"
            ? "Raiku co-location example"
            : "Generic submission example",
        enabled,
        unavailableReason: enabled
          ? null
          : "Unavailable: this example requires an eligible opportunity arriving before its Raiku-produced target block, within transaction lifetime.",
        arrivalTick,
        expectedBlockTick: block?.tick ?? null,
        operatingCost,
        executionFee: model.executionFee,
        tradingCost: model.tradingCost,
        estimatedNet: block
          ? scenario.gross -
            operatingCost -
            model.executionFee -
            model.tradingCost
          : -operatingCost,
      };
    });
}
/** Future market events and outcomes never enter the pre-decision projection. */
export function getDecisionView(
  config: RunConfig = DEFAULT_CONFIG,
  roundIndex = 0,
): DecisionView {
  const scenario = scenarioFor(config, roundIndex);
  return {
    roundIndex,
    roundId: scenario.id,
    mission: scenario.mission,
    title: scenario.title,
    lesson: scenario.lesson,
    executedEvent: { tick: 0, description: scenario.events[0].description },
    observationTick: scenario.observedAt,
    signalAge: scenario.observedAt,
    maxSignalAge: scenario.maxSignalAge,
    estimatedGross: scenario.gross,
    minNet: scenario.minNet,
    executionFloor: scenario.executionFloor,
    expiresAt: scenario.expiresAt,
    uncertain: scenario.uncertain,
    eligible: scenario.eligible,
    paths: pathsFor(scenario),
    schedule: scenario.schedule.map((slot) => ({ ...slot })),
  };
}
const zeroLedger = (): Ledger => ({
  grossBenefit: 0,
  executionFee: 0,
  tradingCost: 0,
  operatingCost: 0,
  tradePnL: 0,
  netResult: 0,
  forgoneOpportunity: 0,
});
function resolveTrade(scenario: Scenario, path: PathView) {
  const inclusionTick = path.expectedBlockTick;
  const included = inclusionTick !== null;
  const grossAtExecution = scenario.events
    .filter((event) => event.tick <= (inclusionTick ?? scenario.expiresAt))
    .at(-1)!.gross;
  const executed = included && grossAtExecution >= scenario.executionFloor;
  const ledger: Ledger = {
    grossBenefit: executed ? grossAtExecution : 0,
    executionFee: included ? path.executionFee : 0,
    tradingCost: executed ? path.tradingCost : 0,
    operatingCost: path.operatingCost,
    tradePnL: 0,
    netResult: 0,
    forgoneOpportunity: 0,
  };
  ledger.tradePnL =
    ledger.grossBenefit - ledger.executionFee - ledger.tradingCost;
  ledger.netResult = ledger.tradePnL - ledger.operatingCost;
  return {
    inclusionTick,
    included,
    executed,
    ledger,
    endTick: inclusionTick ?? Math.max(path.arrivalTick, scenario.expiresAt),
  };
}
export function resolveRound(
  config: RunConfig,
  roundIndex: number,
  action: PlayerAction,
): RoundResult {
  if (!isPlayerAction(action))
    throw new Error("Choose Act with an available path, or Pass.");
  const scenario = scenarioFor(config, roundIndex);
  const decision = getDecisionView(config, roundIndex);
  const selected =
    action.kind === "act"
      ? decision.paths.find((path) => path.id === action.pathId && path.enabled)
      : null;
  if (action.kind === "act" && !selected)
    throw new Error(
      "Execution path is unavailable for this opportunity and target block.",
    );
  const trade = selected ? resolveTrade(scenario, selected) : null;
  const alternatives = !selected
    ? decision.paths
        .filter((path) => path.enabled)
        .map((path) => resolveTrade(scenario, path))
    : [];
  const ledger = trade?.ledger ?? zeroLedger();
  if (!trade)
    ledger.forgoneOpportunity = Math.max(
      0,
      ...alternatives.map((result) => result.ledger.netResult),
    );
  for (const value of Object.values(ledger))
    if (!Number.isSafeInteger(value))
      throw new Error("Ledger exceeded safe integer units.");
  const status = !trade
    ? "passed"
    : !trade.included
      ? "dropped"
      : !trade.executed
        ? "failed"
        : "executed";
  const endTick =
    trade?.endTick ??
    Math.max(
      decision.observationTick,
      ...alternatives.map((result) => result.endTick),
    );
  const events: ReplayEvent[] = scenario.events
    .filter((event) => event.tick <= endTick)
    .map((event, index) => ({
      tick: event.tick,
      kind: index === 0 ? "executed" : "market-change",
      title:
        index === 0
          ? "Executed event creates a market change"
          : "Another executed event changes the market",
      detail: `${event.description} Gross snapshot: ${event.gross} credits.`,
    }));
  events.push({
    tick: decision.observationTick,
    kind: "observation",
    title: "The strategy observes the earlier event",
    detail: `Snapshot gross ${decision.estimatedGross}; signal age ${decision.signalAge} illustrative ticks. This is not pending-flow access.`,
  });
  events.push({
    tick: decision.observationTick,
    kind: "decision",
    title: "Player commits; paused simulation resumes",
    detail: `Decision: ${action.kind === "pass" ? "Pass" : `Act via ${selected!.label}`}. Reading and decision time consumed zero simulation ticks.`,
  });
  if (trade && selected) {
    events.push({
      tick: selected.arrivalTick,
      kind: "arrival",
      title: "Transaction arrives",
      detail: `Arrival at tick ${selected.arrivalTick}. Arrival alone is not inclusion.`,
    });
    if (trade.included) {
      events.push({
        tick: trade.inclusionTick!,
        kind: "inclusion",
        title: "Transaction included in a synthetic block",
        detail: `${scenario.schedule.find((slot) => slot.tick === trade.inclusionTick)!.producer}-produced illustrative block. Inclusion is not finality or a profit guarantee.`,
      });
      events.push({
        tick: trade.inclusionTick!,
        kind: "execution",
        title: trade.executed
          ? "Execution conditions satisfied"
          : "Included execution fails its gross guard",
        detail: trade.executed
          ? `Realised gross ${ledger.grossBenefit} credits; the guard required at least ${scenario.executionFloor}. Net can still be negative after costs.`
          : `The realised gross was below the ${scenario.executionFloor}-credit guard. This authored model charges ${ledger.executionFee} credits for the included attempt; no trading cost is charged.`,
      });
    } else
      events.push({
        tick: trade.endTick,
        kind: "drop",
        title: "Dropped without inclusion",
        detail:
          "No available block within transaction lifetime. Network execution fee: 0; trading cost: 0. Only the disclosed operating cost is charged.",
      });
  } else
    events.push({
      tick: decision.observationTick,
      kind: "pass",
      title: "Pass: no transaction submitted",
      detail:
        "Trade P&L, fees, and operating cost are all zero. Any forgone opportunity is a separate, uncharged authored counterfactual.",
    });
  events.push({
    tick: endTick,
    kind: "accounting",
    title: "Simulated ledger settled",
    detail: `${ledger.grossBenefit} gross − ${ledger.executionFee} execution fee − ${ledger.tradingCost} trading cost = ${ledger.tradePnL} trade P&L; − ${ledger.operatingCost} operating cost = ${ledger.netResult} net credits. Finality is not simulated.`,
  });
  const priority: Record<ReplayEvent["kind"], number> = {
    executed: 0,
    "market-change": 1,
    observation: 2,
    decision: 3,
    arrival: 4,
    inclusion: 5,
    execution: 6,
    drop: 7,
    pass: 8,
    accounting: 9,
  };
  events.sort((a, b) => a.tick - b.tick || priority[a.kind] - priority[b.kind]);
  const explanation =
    status === "passed"
      ? `You passed: zero trade P&L and zero actual costs. The best eligible authored counterfactual offered ${ledger.forgoneOpportunity} net credits; this is not deducted or scored.`
      : status === "dropped"
        ? "The transaction never entered a block. No execution fee was charged; operating work still cost credits."
        : status === "failed"
          ? "The transaction was included, but its gross execution condition failed. The disclosed included-attempt fee applies; the later market event did not change your decision score."
          : `Execution succeeded with ${ledger.netResult} net credits after all simulated costs. Execution success does not imply profit or finality.`;
  return {
    roundIndex,
    roundId: scenario.id,
    mission: scenario.mission,
    action: { ...action },
    decision,
    arrivalTick: selected?.arrivalTick ?? null,
    inclusionTick: trade?.inclusionTick ?? null,
    included: trade?.included ?? false,
    executed: trade?.executed ?? false,
    status,
    ledger,
    score: scoreDecision(decision, action),
    events,
    explanation,
  };
}
export function simulateRun(
  config: RunConfig,
  actions: readonly PlayerAction[],
): RunResult {
  if (actions.length !== roundSpecs.length)
    throw new Error("A complete run requires exactly nine decisions.");
  const rounds = actions.map((action, index) =>
    resolveRound(config, index, action),
  );
  const ledger = zeroLedger();
  for (const round of rounds)
    for (const field of Object.keys(ledger) as (keyof Ledger)[])
      ledger[field] += round.ledger[field];
  return {
    config: { ...config },
    actions: actions.map((action) => ({ ...action })),
    rounds,
    score: rounds.reduce((sum, round) => sum + round.score.total, 0),
    maxScore: 90,
    ledger,
  };
}
export function readRun(value: unknown): RunResult | null {
  try {
    if (!value || typeof value !== "object") return null;
    const data = value as Record<string, unknown>;
    if (
      !isRunConfig(data.config) ||
      !Array.isArray(data.actions) ||
      !data.actions.every(isPlayerAction)
    )
      return null;
    return simulateRun(data.config, data.actions);
  } catch {
    return null;
  }
}
