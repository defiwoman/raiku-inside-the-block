export type Mission = "SEE" | "ACT" | "LAND";
export type PathId = "public" | "raiku";
export type PlayerAction = { kind: "pass" } | { kind: "act"; pathId: PathId };
export interface RunConfig {
  version: string;
  seed: number;
}
export interface BlockSlot {
  id: string;
  tick: number;
  producer: "Raiku" | "Other";
}
export interface MarketEvent {
  tick: number;
  gross: number;
  description: string;
}
export interface RoundSpec {
  id: string;
  mission: Mission;
  title: string;
  lesson: string;
  observedAt: number;
  maxSignalAge: number;
  gross: number;
  minNet: number;
  executionFloor: number;
  expiresAt: number;
  uncertain: boolean;
  eligible: boolean;
  publicDelay: number;
  targetProducer: "Raiku" | "Other";
  changes: readonly {
    tick: number;
    gross: number;
    alternativeGross?: number;
    description: string;
    alternativeDescription?: string;
  }[];
}
export interface Scenario extends RoundSpec {
  events: MarketEvent[];
  schedule: BlockSlot[];
}
export interface PathView {
  id: PathId;
  label: string;
  enabled: boolean;
  unavailableReason: string | null;
  arrivalTick: number;
  expectedBlockTick: number | null;
  operatingCost: number;
  executionFee: number;
  tradingCost: number;
  estimatedNet: number;
}
/** Only this projection may be presented before commitment. No future market events. */
export interface DecisionView {
  roundIndex: number;
  roundId: string;
  mission: Mission;
  title: string;
  lesson: string;
  executedEvent: { tick: number; description: string };
  observationTick: number;
  signalAge: number;
  maxSignalAge: number;
  estimatedGross: number;
  minNet: number;
  executionFloor: number;
  expiresAt: number;
  uncertain: boolean;
  eligible: boolean;
  paths: PathView[];
  schedule: BlockSlot[];
}
export interface ScoreContribution {
  label: string;
  points: number;
  max: number;
  reason: string;
}
export interface RoundScore {
  total: number;
  max: number;
  contributions: ScoreContribution[];
}
export type EventKind =
  | "executed"
  | "market-change"
  | "observation"
  | "decision"
  | "arrival"
  | "inclusion"
  | "execution"
  | "drop"
  | "pass"
  | "accounting";
export interface ReplayEvent {
  tick: number;
  kind: EventKind;
  title: string;
  detail: string;
}
export interface Ledger {
  grossBenefit: number;
  executionFee: number;
  tradingCost: number;
  operatingCost: number;
  tradePnL: number;
  netResult: number;
  /** Counterfactual information, never a cost deducted from netResult. */
  forgoneOpportunity: number;
}
export interface RoundResult {
  roundIndex: number;
  roundId: string;
  mission: Mission;
  action: PlayerAction;
  decision: DecisionView;
  arrivalTick: number | null;
  inclusionTick: number | null;
  included: boolean;
  executed: boolean;
  status: "passed" | "dropped" | "failed" | "executed";
  ledger: Ledger;
  score: RoundScore;
  events: ReplayEvent[];
  explanation: string;
}
export interface RunResult {
  config: RunConfig;
  actions: PlayerAction[];
  rounds: RoundResult[];
  score: number;
  maxScore: number;
  ledger: Ledger;
}
