import type { RoundSpec } from "./simulation-types";

export const SCENARIO_VERSION = "3.0.0";
export const DEFAULT_SEED = 42;
export const DEFAULT_CONFIG = { version: SCENARIO_VERSION, seed: DEFAULT_SEED };
export const model = {
  grossOffsets: [-4, -2, 0, 2, 4],
  blockTicks: [40, 80, 120],
  operatingCosts: { public: 4, raiku: 8 },
  raikuArrivalDelay: 5,
  executionFee: 6,
  tradingCost: 8,
} as const;
export const missions = [
  {
    id: "SEE",
    title: "Learn what happened.",
    objective: "Read signal age before you trust an observation.",
  },
  {
    id: "ACT",
    title: "Decide after costs.",
    objective:
      "Compare the estimate with costs and your minimum acceptable net.",
  },
  {
    id: "LAND",
    title: "Understand execution.",
    objective:
      "Inspect eligibility, the leader schedule, and execution conditions.",
  },
] as const;

const common = {
  minNet: 20,
  executionFloor: 0,
  expiresAt: 90,
  uncertain: false,
  eligible: false,
  publicDelay: 12,
  targetProducer: "Other",
  changes: [],
  maxSignalAge: 30,
} as const;

/** Authored teaching data, not product eligibility rules, pricing, or latency measurements. */
export const roundSpecs: readonly RoundSpec[] = [
  {
    ...common,
    id: "see-1",
    mission: "SEE",
    title: "A recent observation",
    lesson:
      "Signal age measures time since the executed event, not how long you spend reading.",
    observedAt: 6,
    gross: 100,
  },
  {
    ...common,
    id: "see-2",
    mission: "SEE",
    title: "Information takes a journey",
    lesson:
      "A snapshot can be old by the time it reaches you. Your freshness limit is visible below.",
    observedAt: 70,
    gross: 100,
    expiresAt: 80,
    changes: [
      {
        tick: 30,
        gross: 0,
        description:
          "Another executed market event removed the earlier opportunity while its observation was travelling.",
      },
    ],
  },
  {
    ...common,
    id: "see-3",
    mission: "SEE",
    title: "You can wait for another signal",
    lesson:
      "An observation does not oblige you to trade. Passing can be a considered decision.",
    observedAt: 25,
    gross: 12,
    uncertain: true,
  },
  {
    ...common,
    id: "act-1",
    mission: "ACT",
    title: "Start with the net estimate",
    lesson: "Gross benefit is not what remains after simulated costs.",
    observedAt: 8,
    gross: 90,
  },
  {
    ...common,
    id: "act-2",
    mission: "ACT",
    title: "Account for every cost",
    lesson:
      "Compare the cost-adjusted estimate with the minimum acceptable net, not just zero.",
    observedAt: 6,
    gross: 14,
  },
  {
    ...common,
    id: "act-3",
    mission: "ACT",
    title: "An estimate is not a promise",
    lesson:
      "This opportunity has disclosed market uncertainty. Acting on a good estimate or cautiously passing can both be sensible.",
    observedAt: 8,
    gross: 95,
    executionFloor: 20,
    uncertain: true,
    changes: [
      {
        tick: 24,
        gross: 12,
        alternativeGross: 130,
        description:
          "A later executed event reduced the opportunity. This change was unknown at decision time.",
        alternativeDescription:
          "A later executed event increased the opportunity. This change was unknown at decision time.",
      },
    ],
  },
  {
    ...common,
    id: "land-1",
    mission: "LAND",
    title: "Check your coverage",
    lesson:
      "Inspect the published synthetic schedule and transaction expiry. Path eligibility is limited to the target block.",
    observedAt: 8,
    gross: 110,
    eligible: true,
    targetProducer: "Raiku",
    publicDelay: 38,
    expiresAt: 60,
  },
  {
    ...common,
    id: "land-2",
    mission: "LAND",
    title: "Inclusion is only one condition",
    lesson:
      "A gross execution guard does not protect your net result after costs. The named example has no profit guarantee.",
    observedAt: 8,
    gross: 14,
    eligible: true,
    targetProducer: "Raiku",
  },
  {
    ...common,
    id: "land-3",
    mission: "LAND",
    title: "A different block producer",
    lesson:
      "An illustrated Raiku path is unavailable outside its eligible Raiku-produced target block. The generic path remains available.",
    observedAt: 8,
    gross: 75,
    eligible: true,
    targetProducer: "Other",
  },
];
