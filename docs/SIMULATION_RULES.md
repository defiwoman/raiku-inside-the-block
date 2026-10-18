# Simulation rules — scenario 3.0.0

This is an authored community teaching simulation, not measured Raiku performance, a live integration, or a trading benchmark. No real money, wallet, tokens, orders, backend, or named competing provider is involved. Blackline reacts to already-executed transactions; the interface never depicts access to pending transactions.

## A run

A run contains nine rounds: SEE 1–3, ACT 1–3, and LAND 1–3. The intended reading/decision/review pace is about 3–5 minutes, not an enforced timer. Every round uses a local tick axis starting at 0. A tick is an illustrative integer unit, **not a real Solana millisecond**.

The source market transaction executes at tick 0. Its snapshot is delivered at the observation tick. Simulation time is then paused indefinitely: reading, choosing a path, changing that selection, or leaving the browser idle consumes zero ticks. Act submits at the observation tick; Pass submits nothing. Outcome events are computed only on commitment and displayed in a self-paced review. A saved partial run resumes the same decision or review after reload. The separate beginner tutorial retains its original 40-tick check example; it is not a scored mission.

## Determinism and architecture

- Configuration: scenario version `3.0.0` and an integer seed in `[0, 4294967295]`; the default seed is `42`.
- `src/lib/scenarios.ts`: authored round data and mission metadata.
- `src/lib/simulation-types.ts`: engine contracts, safe decision projection, events, and ledgers.
- `src/lib/simulation.ts`: pure scenario generation, path eligibility, resolution, replay, aggregation, and input validation.
- `src/lib/scoring.ts`: decision-time rubric; accepts a decision projection and action, never realised outcomes or hidden events.
- `src/lib/presentation.ts`, React pages, and `RoundReview`: formatting and presentation of engine outputs. CSS replay fades display existing events and never determine outcomes.
- `src/lib/tutorial.ts`: preserved unscored beginner example.

The generator uses 32-bit FNV-1a with `Math.imul`, keyed by version, seed, round ID, and variation name. Initial gross is shifted by one of `−4, −2, 0, 2, 4` integer credits. The uncertain ACT round chooses one of two authored later market changes using a separate hash. There is no wall clock, random API, network data, or mutable random-number state in the engine.

Identical version, seed, and ordered player actions produce identical events, ledgers, and scores. Each action is either `{kind: 'pass'}` or `{kind: 'act', pathId: 'public' | 'raiku'}`. Unsupported versions, invalid seeds, out-of-range round indices, unavailable paths, and incomplete completed-run records are rejected. A change to authored data, economic rules, scoring, event ordering, or the seed algorithm requires a new scenario version.

## What the strategy may know

Before commitment, React receives only `getDecisionView`: the source executed event, its observed gross snapshot, arrival time of the observation, signal age, freshness limit, net minimum, gross guard, expiry, disclosed uncertainty, eligible paths, costs, and the **published synthetic leader schedule**. This schedule is knowable planning metadata, not a preview of future market events or inclusion results.

Later executed market changes, realised gross, successful/failed execution, ledgers, counterfactuals, and replay events do not appear in the decision view. A snapshot can be outdated even when a later market event already occurred but its information has not reached the strategy. Actual later events become visible only after the decision. This is a client-side educational model, not an adversarial secrecy system; it does not promise to conceal bundled scenario code from developer tools.

## Integer-credit accounting

Credits are invented indivisible units, not SOL, dollars, or redeemable tokens. All financial inputs, deductions, and totals use safe integers, with no fractional currency or floating-point rounding.

| Item                         | Rule                                                                                                                   |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| Gross benefit                | Latest authored market gross at the inclusion tick, credited only if execution succeeds                                |
| Generic path operating cost  | 4 credits per Act attempt, even if dropped or failed                                                                   |
| Raiku example operating cost | 8 credits per Act attempt; authored teaching cost, not real product pricing                                            |
| Network execution fee        | 6 credits only if included; also charged for an included failed execution                                              |
| Trading cost                 | 8 credits only on successful execution; an illustrative aggregate of trade-related costs                               |
| Pass                         | Zero gross, network fee, trading cost, operating cost, trade P&L, and net result                                       |
| Forgone opportunity          | Best positive hypothetical net among enabled paths in that authored round; shown after a Pass, never charged or scored |

`Trade P&L = realised gross − network execution fee − trading cost`.

`Net result = trade P&L − operating cost`.

An included failed attempt has no realised gross or trading cost, but pays the disclosed 6-credit network execution fee and its operating cost. A dropped transaction pays **no network execution fee**, even if it arrived somewhere before being dropped; only operating cost remains. A pass may miss a possible opportunity, but this counterfactual is never subtracted from actual net result. It uses the same seed and enabled paths, not real alternative market histories.

The minimum acceptable net is a **20-credit decision policy**, not an enforced order condition. The actual order guard checks **gross**: at least 0 credits in most rounds, at least 20 in ACT 3. This deliberately permits an included, successful execution to lose credits after costs. No network finality is simulated. Inclusion, successful execution, finality, and profit remain separate concepts.

## Paths and synthetic block schedule

Each round publishes blocks at ticks 40, 80, and 120. Producer labels alternate between `Raiku` and generic `Other`; there are no named competing providers. No capacity, congestion, real validator behaviour, or real provider performance is inferred.

The generic path arrives after the disclosed round-specific delay, usually 12 ticks after the observation. It selects the first scheduled block at or after arrival and no later than transaction expiry. If none exists, it is dropped. Its pre-decision estimated net is then just `−operating cost` because the published schedule already establishes that no block fits. Otherwise, the net estimate assumes success at the observed gross and subtracts all applicable costs.

The co-location example appears only in LAND. It is enabled only if all conditions hold: the opportunity is authored eligible, the target block is Raiku-produced, arrival is no later than that block, and the block is within transaction lifetime. The example arrives 5 illustrative ticks after observation and targets the first published block. An unavailable path is disabled in the UI **and rejected by the engine**. These are illustrative coverage conditions, not invented claims about Raiku's production eligibility rules. Real relevant inclusion claims concern eligible orders in Raiku-produced blocks only.

## Nine authored rounds

Gross values below are before the seeded ±4-credit variation. Later changes remain hidden before commitment.

| Round  | Observation / gross | Teaching case and resolution structure                                                                                                                                                                                |
| ------ | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| SEE 1  | Tick 6 / 100 cr     | Fresh, useful snapshot; generic path can arrive and execute at tick 40                                                                                                                                                |
| SEE 2  | Tick 70 / 100 cr    | Signal exceeds the 30-tick freshness limit; another executed event removed the opportunity at tick 30, unknown through the old snapshot; a submitted transaction misses its tick-80 lifetime                          |
| SEE 3  | Tick 25 / 12 cr     | Costs exceed the observed benefit; waiting or passing is supported, with disclosed uncertainty                                                                                                                        |
| ACT 1  | Tick 8 / 90 cr      | Positive cost-adjusted estimate above the minimum acceptable net                                                                                                                                                      |
| ACT 2  | Tick 6 / 14 cr      | All seeded gross estimates are erased by the 18-credit total generic cost; passing is supported                                                                                                                       |
| ACT 3  | Tick 8 / 95 cr      | Good estimate with disclosed uncertainty; an unknown tick-24 executed event changes gross to 12 or 130. Inclusion at tick 40 may fail the gross guard or succeed; neither changes the decision-time rubric            |
| LAND 1 | Tick 8 / 110 cr     | Eligible Raiku-produced tick-40 target; co-location example executes positively. Generic arrival at tick 46 misses the target, and tick 80 is beyond expiry 60, so the generic attempt drops without an execution fee |
| LAND 2 | Tick 8 / 14 cr      | Eligible Raiku-produced block; inclusion and the gross guard can succeed on either path without profit after costs. The Raiku label never forces a positive result                                                    |
| LAND 3 | Tick 8 / 75 cr      | Target block is Other-produced. The Raiku example is unavailable; the generic path can execute                                                                                                                        |

## Exact scoring rubric

Each round contributes up to **10 points**; a completed run is **out of 90**. Points are wholly independent of realised net P&L. The interface shows these categories and their exact contributions after every round.

A path is **viable at decision time** when it is enabled, has a scheduled block before expiry, and its net estimate is at least the disclosed minimum. A **supported pass** means the observation is stale, no viable path exists, or market uncertainty is disclosed.

| Category                   | Act                                                                                                                  | Pass                                                                             |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Information discipline (3) | 3 if signal age is within the disclosed limit; otherwise 0                                                           | 3; an old signal is not acted on                                                 |
| Net-cost discipline (4)    | 4 if the chosen path's net estimate meets the minimum; otherwise 0                                                   | 4 for a supported pass; otherwise 1 for caution despite a clear, viable estimate |
| Context and coverage (3)   | 3 if not stale, net estimate meets the minimum, and the chosen path has a scheduled block before expiry; otherwise 0 | 3 for a supported pass; otherwise 1                                              |

A fresh, viable Act earns 10 even if an unknowable later market change causes failure or a loss. A cautious Pass in the disclosed-uncertainty case also earns 10. There are no profit bonuses or hindsight deductions. A pass on a clear viable opportunity is allowed and costs no credits, but earns 5 learning points because the task is to apply the visible decision rubric. The selected path matters for Act; hidden results never do.

## Versioned personal records and comparison

Only compare learning scores when **both scenario version and seed match**. Results and SVG share cards identify both. Best records are keyed by `${version}/seed-${seed}` and reconstructed from stored actions; no cross-seed leaderboard or aggregate best is shown. The saved-run count is informational, not a comparison.

Old prototype progress remains under its original storage key and is explicitly not imported into these scores. It may be removed with Reset. In-progress rounds, the optional name/tutorial record, the last completed run, and compatible best action records stay on this device only. A blocked or corrupt localStorage cannot prevent play. Reset clears all generations of personal progress.
