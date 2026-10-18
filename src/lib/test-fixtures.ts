import { DEFAULT_CONFIG, getDecisionView } from "./simulation";
import { roundSpecs } from "./scenarios";
import type { PlayerAction, RunConfig } from "./simulation";

export function sensibleActions(
  config: RunConfig = DEFAULT_CONFIG,
): PlayerAction[] {
  return roundSpecs.map((_, index) => {
    const view = getDecisionView(config, index);
    const path = view.paths.find(
      (path) =>
        path.enabled &&
        path.expectedBlockTick !== null &&
        path.estimatedNet >= view.minNet,
    );
    return view.signalAge > view.maxSignalAge || !path
      ? { kind: "pass" }
      : { kind: "act", pathId: path.id };
  });
}
