# Raiku: Inside the Block — project requirements

Preserve these requirements in future stages. This is a community-built educational strategy game for crypto community members, curious traders, and beginners.

## Product and architecture

- Flow: Home → brief Tutorial → Game with SEE, ACT, LAND missions → Results and replay → downloadable share card. Keep About accessible.
- React, TypeScript, Vite. Keep dependencies compatible and stable, and commit `package-lock.json`. Use `npm ci`.
- Keep simulation rules in `src/lib/simulation.ts`, independent of React and browser APIs. Timing values are arbitrary teaching ticks, never measured latency.
- Use localStorage only for personal progress. Gracefully handle unavailable or corrupt storage. No wallet, real trades, tokens, payments, rewards, or backend in this stage.
- Use lightweight CSS/SVG animation, responsive layouts, visible keyboard focus, semantic controls, and reduced-motion support.
- Mark unfinished gameplay explicitly as development placeholders. Maintain `docs/BUILD_STATUS.md` with completed work and remaining scope.

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
- Transaction inclusion, successful execution, network finality, and trading profit are different concepts. This prototype models invented inclusion/execution outcomes; it does not model finality or profit.
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
