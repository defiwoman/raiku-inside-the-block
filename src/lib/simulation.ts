// Invented teaching model. These values do not describe a real network or product.
export const missions = [
  {
    id: "SEE",
    title: "Find your signal.",
    description:
      "Information has a journey. See what changes when an executed transaction reaches you sooner.",
    question:
      "An executed swap has changed the simulated market. Which feed will you observe?",
    options: [
      {
        title: "Standard observation",
        detail:
          "Receive the already-executed transaction after 180 illustrative ticks.",
        value: "standard",
      },
      {
        title: "Earlier observation",
        detail:
          "Receive the same already-executed transaction after 40 illustrative ticks.",
        value: "earlier",
      },
    ],
  },
  {
    id: "ACT",
    title: "Make your move.",
    description:
      "A fast signal is only a starting point. Choose what to do with the information you have.",
    question:
      "You have observed the executed swap. How will you respond to the opportunity?",
    options: [
      {
        title: "Check, then submit",
        detail:
          "Spend 60 illustrative ticks checking the simulated price and execution limit.",
        value: "check",
      },
      {
        title: "Submit immediately",
        detail:
          "Spend 10 illustrative ticks acting, with an execution limit too tight for this scenario.",
        value: "rush",
      },
    ],
  },
  {
    id: "LAND",
    title: "Get into the block.",
    description:
      "Submission is not inclusion. Explore why the path into a block matters, too.",
    question:
      "Your order is ready. Choose its simulated path into the next block.",
    options: [
      {
        title: "Open submission queue",
        detail:
          "A busy queue adds 240 illustrative ticks. Inclusion is uncertain.",
        value: "queue",
      },
      {
        title: "Eligible reserved path",
        detail:
          "This invented scenario assigns 80 ticks in a Raiku-produced block. No live integration.",
        value: "eligible",
      },
    ],
  },
] as const;

export type MissionIndex = 0 | 1 | 2;
export type Choices = [string, string, string];
export interface RunResult {
  choices: Choices;
  observation: number;
  decision: number;
  inclusion: number;
  total: number;
  included: boolean;
  executed: boolean;
  score: number;
}

export function isChoices(value: unknown): value is Choices {
  return (
    Array.isArray(value) &&
    value.length === 3 &&
    value.every((choice, index) =>
      missions[index].options.some((option) => option.value === choice),
    )
  );
}

export function simulate(choices: Choices): RunResult {
  if (!isChoices(choices))
    throw new Error("Choose one valid option for each mission.");
  const observation = choices[0] === "earlier" ? 40 : 180;
  const decision = choices[1] === "check" ? 60 : 10;
  const inclusion = choices[2] === "eligible" ? 80 : 240;
  const total = observation + decision + inclusion;
  const included = total <= 400;
  const executed = included && choices[1] === "check";
  // Learning score rewards understanding, not profit or a real performance estimate.
  const score =
    (choices[0] === "earlier" ? 30 : 10) +
    (choices[1] === "check" ? 40 : 10) +
    (included ? 30 : 0);
  return {
    choices: [...choices],
    observation,
    decision,
    inclusion,
    total,
    included,
    executed,
    score,
  };
}
