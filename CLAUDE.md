# Raiku: Inside the Block — project requirements

Preserve these requirements in future stages. This is a community-built educational strategy game for crypto community members, curious traders, and beginners.

## Product and architecture

- Flow: Home → brief Tutorial → Game with SEE, ACT, LAND missions → Results and replay → downloadable share card. Keep About accessible.
- React, TypeScript, Vite. Keep dependencies compatible and stable, and commit `package-lock.json`. Use `npm ci`.
- Keep simulation rules in `src/lib/simulation.ts`, independent of React and browser APIs. Timing values are arbitrary teaching ticks, never measured latency.
- Use localStorage only for personal progress. Gracefully handle unavailable or corrupt storage. No wallet, real trades, tokens, payments, rewards, or backend in this stage.
- Use lightweight CSS/SVG animation, responsive layouts, visible keyboard focus, semantic controls, and reduced-motion support.
- Mark unfinished gameplay explicitly as development placeholders. Maintain `docs/BUILD_STATUS.md` with completed work and remaining scope.
- Landing title: “Inside the Block”; eyebrow: “A community experience exploring Raiku”; headline: “You spotted the opportunity. Can your strategy act in time?”; supporting copy: “Explore how information, decisions, and execution shape a trade—in a short interactive simulation.” Primary CTA “Enter the Block”, secondary “How it works”.
- Guest play must work without registration. An optional display name is limited to 24 characters and stored only on this device as personal progress, alongside tutorial choice/replay position. Do not collect a wallet, email, or X account. Reset must clear name, tutorial, and game progress.
- Beginner tutorial: executed event → later observation → Act or Pass → self-paced explanatory replay. Keep this model independent of React. Never use animation or a countdown to gate decisions or reading.
- Explain block, validator, signal age, inclusion, and net result using short explanations available by keyboard and tap/click, never hover alone. Interactive targets must be at least 44px, and layouts must fit a 360px viewport.

## Simulation stage requirements

- Three missions, three rounds each; target roughly 3–5 minutes without a time gate. Simulation ticks pause indefinitely during decisions and are illustrative, never real Solana milliseconds.
- Preserve the pure deterministic TypeScript engine: the same scenario version, uint32 seed, and actions must reproduce identical results. Financial calculations use integer credits.
- Separate scenario data, engine logic, decision-time scoring, and presentation. Animations only present recorded engine events. Never put future market events in the normal pre-decision view; published synthetic leader schedules are planning metadata.
- SEE teaches fresh/outdated signals and a reasonable Pass. ACT teaches estimates after costs, minimum acceptable net, and unknown later market changes. LAND teaches eligible Raiku-produced block coverage, inclusion without profit, and an unavailable Raiku example in an Other-produced block.
- Enforce path availability in the engine and UI. No named competing providers or pending-flow access. Do not force a Raiku-labelled outcome to be profitable.
- A dropped, never-included transaction pays no network execution fee. Explain the disclosed fee for included failures. Keep operating costs and forgone opportunity separate; passing has zero trade P&L and actual costs.
- Scoring uses only what could be known when choosing, with no hindsight penalty. Show exact category points after each round. Compare only matching scenario versions and seeds. Preserve `docs/SIMULATION_RULES.md`; bump the scenario version when data, rules, seed mapping, event ordering, or scoring changes.

## Brand and accessibility

- Paper `#EFEEE9`, ink `#223D0E`, deep ink `#0F1D06`. Keep shared design tokens in CSS variables.
- Geist for headings/body; Geist Mono for numbers/system labels. Generous readable type, thin borders, restrained halftone detail, dark-green simulation panels.
- Official assets, when accessible, belong in `public/brand`, preserving their proportions: `https://raiku.com/brand/raiku-logo-full.svg` and `https://raiku.com/brand/raiku-intersect.svg`.
- If downloads are unavailable, use a plain-text title, report missing assets, and never invent a substitute logo. The cube and mission diagrams are educational illustrations, not logos.
- Official references: https://raiku.com/ ; https://raiku.com/brand-assets ; https://raiku.com/news/what-is-co-location-on-solana . Do not imply their contents were reviewed if inaccessible.

## Content boundaries — required

- This is an illustrative community simulation, not a live Raiku integration or performance benchmark.
- Blackline reacts to **already-executed transactions**. Never depict access to pending transactions or front-running.
- Relevant inclusion claims concern **eligible orders in Raiku-produced blocks**. Do not generalize them into universal guarantees or assert invented eligibility rules.
- Transaction inclusion, successful execution, network finality, and trading profit are different concepts. The missions model invented inclusion, execution, costs, and net P&L in integer credits. They do not model network finality or real trading profit.
- Never invent APIs, partner relationships, live statistics, endorsements, rewards, or performance guarantees.
- Include this exact footer throughout: “Community-built educational simulation. Not affiliated with or endorsed by Raiku.” Include the disclaimer on share cards too.

## Development

Use the existing checkout; cloud tasks are already isolated. Do not create a worktree unless explicitly requested.

```sh
npm ci
npm run dev
npm run test
npm run build
npm run test:e2e
```

If the cloud machine cannot write its default npm cache, use `npm --cache /workspace/.npm-cache ci`. Playwright requires Chromium (`npx playwright install chromium`). Production hosting must fall back to `index.html` for client routes. No environment variables or secrets are required.
