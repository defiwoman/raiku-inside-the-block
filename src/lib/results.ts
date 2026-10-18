import type {
  Mission,
  ReplayEvent,
  RoundResult,
  RunResult,
} from "./simulation-types";
import { credits, signedCredits, statusLabel } from "./presentation";

export function missionBreakdown(run: RunResult) {
  return (["SEE", "ACT", "LAND"] as const).map((id) => {
    const rounds = run.rounds.filter((round) => round.mission === id);
    return {
      id,
      score: rounds.reduce((sum, round) => sum + round.score.total, 0),
      max: rounds.reduce((sum, round) => sum + round.score.max, 0),
      net: rounds.reduce((sum, round) => sum + round.ledger.netResult, 0),
    };
  });
}
export interface RoundNarrative {
  knew: string;
  chose: string;
  happened: string;
  next: string;
}
export function roundNarrative(round: RoundResult): RoundNarrative {
  const view = round.decision;
  const pathId = round.action.kind === "act" ? round.action.pathId : null;
  const path = view.paths.find((item) => item.id === pathId);
  let next: string;
  if (round.action.kind === "act" && view.signalAge > view.maxSignalAge)
    next =
      "Check signal age first. The observation was older than the freshness limit, even though its earlier gross estimate looked useful.";
  else if (path && path.expectedBlockTick === null)
    next =
      "Check arrival, block coverage, and expiry together. This path had no published block within the transaction lifetime; a faster-looking signal could not fix that.";
  else if (path && path.estimatedNet < view.minNet)
    next =
      "Subtract every applicable cost before acting. The selected path’s estimate was below your minimum acceptable net; a gross execution guard does not protect your net result.";
  else if (round.status === "failed" && round.score.total === round.score.max)
    next =
      "Keep decision quality separate from luck. Your choice fit the information available; the unknown later market change did not reduce your learning points.";
  else if (round.action.kind === "pass" && round.score.total < round.score.max)
    next =
      "Passing is allowed and costs nothing. In this clear, fresh case, the visible cost-adjusted estimate supported acting; consider that estimate alongside your caution next time.";
  else if (view.uncertain)
    next =
      "Treat the estimate as a decision aid, not a promise. Disclosed uncertainty supported a cautious Pass or a viable Act; only later events reveal the realised result.";
  else if (round.action.kind === "pass")
    next =
      "A signal is an invitation to inspect, not an obligation to trade. Keep using freshness, costs, and coverage to decide whether a Pass is supported.";
  else
    next =
      "Repeat the same checks: freshness, net after costs, and path coverage. Successful execution is separate from profit and network finality.";
  return {
    knew: `At tick ${view.observationTick}, you received a snapshot of an already-executed event at tick ${view.executedEvent.tick}. Signal age: ${view.signalAge} ticks; freshness limit: ${view.maxSignalAge}. Observed gross: ${credits(view.estimatedGross)}. ${
      path
        ? `Selected-path net estimate: ${credits(path.estimatedNet)}; minimum acceptable net: ${credits(view.minNet)}.`
        : `Available net estimates: ${view.paths
            .filter((item) => item.enabled)
            .map((item) => `${item.label}: ${credits(item.estimatedNet)}`)
            .join(
              "; ",
            )}. The minimum acceptable net was ${credits(view.minNet)}.`
    } ${view.uncertain ? "Market uncertainty was disclosed." : "No additional market uncertainty warning was disclosed."} Later market changes were unknown.`,
    chose: path
      ? `You chose Act via ${path.label}. Its disclosed arrival was tick ${path.arrivalTick}; ${path.expectedBlockTick === null ? "there was no published block before expiry" : `the planned block was tick ${path.expectedBlockTick}`}.`
      : "You chose Pass. No transaction was submitted and no execution was attempted.",
    happened: `${statusLabel(round)}. ${round.explanation} Actual simulated net: ${signedCredits(round.ledger.netResult)}.`,
    next,
  };
}
export function runLesson(run: RunResult): {
  title: string;
  body: string;
  roundIndex: number;
  mission: Mission;
} {
  const chosen = [...run.rounds].sort(
    (a, b) => a.score.total - b.score.total || a.roundIndex - b.roundIndex,
  )[0];
  const surprise = run.rounds.find(
    (round) =>
      round.status === "failed" && round.score.total === round.score.max,
  );
  const round =
    chosen.score.total === chosen.score.max && surprise ? surprise : chosen;
  const title =
    round.score.total < round.score.max
      ? "One decision to take into your next run."
      : "Keep the process, even when the outcome changes.";
  return {
    title,
    body: `${round.mission} round ${(round.roundIndex % 3) + 1}: ${roundNarrative(round).next}`,
    roundIndex: round.roundIndex,
    mission: round.mission,
  };
}

export interface ReplayStage {
  label: string;
  tick: number | null;
  eventIndex: number | null;
  detail: string;
}
/** Projection of actual recorded events, never an additional simulation. */
export function replayStages(round: RoundResult): ReplayStage[] {
  function stage(
    label: string,
    kind: ReplayEvent["kind"],
    absent: string,
  ): ReplayStage {
    const index = round.events.findIndex((event) => event.kind === kind);
    return {
      label,
      tick: index < 0 ? null : round.events[index].tick,
      eventIndex: index < 0 ? null : index,
      detail: index < 0 ? absent : round.events[index].title,
    };
  }
  const outcomeKind =
    round.status === "passed"
      ? "pass"
      : round.status === "dropped"
        ? "drop"
        : "execution";
  return [
    stage("Event executed", "executed", "No source event recorded."),
    stage("Strategy observed", "observation", "No observation recorded."),
    stage("Player decided", "decision", "No decision recorded."),
    stage(
      "Submission arrived",
      "arrival",
      "Not applicable: you passed; no submission.",
    ),
    stage("Inclusion/execution outcome", outcomeKind, "No outcome recorded."),
  ];
}
