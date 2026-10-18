import type { RoundResult } from "./simulation-types";
export const credits = (value: number): string =>
  `${value < 0 ? "−" : ""}${new Intl.NumberFormat("en-US").format(Math.abs(value))} cr`;
export const signedCredits = (value: number): string =>
  `${value > 0 ? "+" : ""}${credits(value)}`;
export const statusLabel = (round: RoundResult): string =>
  ({
    passed: "Passed · no trade",
    dropped: "Dropped · not included",
    failed: "Included · execution failed",
    executed: "Included · execution succeeded",
  })[round.status];
