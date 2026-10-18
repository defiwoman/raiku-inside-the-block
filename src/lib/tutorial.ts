// A fixed beginner scenario; arbitrary teaching ticks, never network measurements.
export type TutorialChoice = "act" | "pass";
export const tutorialScenario = {
  executedAt: 0,
  observedAt: 120,
  checkTicks: 40,
  pathTicks: 80,
  priceWindowClosesAt: 200,
} as const;

export function simulateTutorial(choice: TutorialChoice) {
  if (choice !== "act" && choice !== "pass")
    throw new Error("Choose Act or Pass.");
  const { executedAt, observedAt, checkTicks, pathTicks, priceWindowClosesAt } =
    tutorialScenario;
  const submitted = choice === "act";
  const decidedAt = observedAt + (submitted ? checkTicks : 0);
  const arrivedAt = submitted ? decidedAt + pathTicks : null;
  return {
    choice,
    submitted,
    included: submitted,
    executed: arrivedAt !== null && arrivedAt <= priceWindowClosesAt,
    signalAge: observedAt - executedAt,
    arrivedAt,
    steps: [
      {
        label: "The event executes",
        tick: executedAt,
        title: "Transaction #07 changes the market.",
        description:
          "The transaction has already executed. A new opportunity fits your invented price rule at this moment. You have not observed it yet.",
      },
      {
        label: "You receive the observation",
        tick: observedAt,
        title: "Your signal is already 120 ticks old.",
        description:
          "You now see the executed event, not a pending transaction. The price rule will stop being met at tick 200. The market does not wait for your observation.",
      },
      {
        label: submitted ? "You act" : "You pass",
        tick: decidedAt,
        title: submitted
          ? "A check, then a submission."
          : "Waiting is a strategy, too.",
        description: submitted
          ? "Your check takes 40 ticks. At tick 160 you submit the transaction. This scenario assigns another 80 ticks before it reaches a block."
          : "You choose not to submit a transaction. No order enters a block, and no execution is attempted.",
      },
      {
        label: "The outcome",
        tick: arrivedAt ?? observedAt,
        title: submitted
          ? "Included. But not executed successfully."
          : "No transaction. No execution attempt.",
        description: submitted
          ? "Your transaction is included at tick 240, after the price window closes at tick 200. Its price condition is no longer met, so execution is rejected. Inclusion alone was not enough."
          : "You passed on this old signal. Nothing was submitted or included. That avoids an execution attempt, but does not establish a profit or mean every pass is the best choice.",
      },
    ],
  };
}
