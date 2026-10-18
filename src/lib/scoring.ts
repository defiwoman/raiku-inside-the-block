import type {
  DecisionView,
  PlayerAction,
  RoundScore,
} from "./simulation-types";

/** This rubric intentionally accepts no realised outcome or hidden scenario data. */
export function scoreDecision(
  view: DecisionView,
  action: PlayerAction,
): RoundScore {
  const stale = view.signalAge > view.maxSignalAge;
  const viable = view.paths.filter(
    (path) =>
      path.enabled &&
      path.expectedBlockTick !== null &&
      path.estimatedNet >= view.minNet,
  );
  const selected =
    action.kind === "act"
      ? view.paths.find((path) => path.id === action.pathId && path.enabled)
      : null;
  const sensiblePass = stale || viable.length === 0 || view.uncertain;
  const netFits =
    selected !== null &&
    selected !== undefined &&
    selected.estimatedNet >= view.minNet;
  const contextFits =
    action.kind === "pass"
      ? sensiblePass
      : !stale && netFits && selected?.expectedBlockTick !== null;
  const contributions = [
    {
      label: "Information discipline",
      points: stale && action.kind === "act" ? 0 : 3,
      max: 3,
      reason: stale
        ? action.kind === "pass"
          ? "You passed on a signal older than the disclosed freshness limit."
          : "The visible signal age exceeded the freshness limit."
        : "The observation met the disclosed freshness limit.",
    },
    {
      label: "Net-cost discipline",
      points: action.kind === "act" ? (netFits ? 4 : 0) : sensiblePass ? 4 : 1,
      max: 4,
      reason:
        action.kind === "act"
          ? netFits
            ? "Your chosen path's estimate met the minimum acceptable net."
            : "Your chosen path's estimate was below the minimum acceptable net."
          : sensiblePass
            ? "Passing was supported by age, costs, coverage, or disclosed uncertainty."
            : "Passing is allowed, but the fresh, clear estimate supported acting.",
    },
    {
      label: "Context and coverage",
      points: contextFits ? 3 : action.kind === "pass" ? 1 : 0,
      max: 3,
      reason: contextFits
        ? "Your decision fit the information and path coverage available when choosing."
        : action.kind === "pass"
          ? "A cautious pass earned partial credit on a clear, viable observation."
          : "The visible freshness, costs, or block coverage did not support this action.",
    },
  ];
  return {
    total: contributions.reduce((sum, item) => sum + item.points, 0),
    max: 10,
    contributions,
  };
}
