# Raiku: Inside the Block

A mobile-friendly community educational game about observation, decisions, and transaction inclusion. Built with React, TypeScript, and Vite. No wallet or backend.

```sh
npm ci
npm run dev
```

Node.js 22.12+ or 24 LTS is recommended. The development server listens on port 5173. Run `npm run build` for a type-checked production bundle in `dist/`, and `npm run preview` to serve it. Deploy `dist/` to a static host configured with an `index.html` fallback for `/tutorial`, `/game`, `/results`, and `/about`.

Netlify is configured in `netlify.toml`: repository root (`.`), branch `work`, build `npm run build`, publish `dist`, Node.js 24, and an SPA fallback. See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for the exact settings and publishing steps. A local build is not a public deployment.

`npm test` checks simulation outcomes and personal progress handling. `npx playwright install chromium` followed by `npm run test:e2e` runs desktop and mobile browser checks against the production build (build it first).

If Chromium is already installed, use `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e` instead of downloading a browser. In cloud environments with a read-only home directory, use `npm --cache /workspace/.npm-cache ci`.

See [CLAUDE.md](CLAUDE.md) for product/content requirements and [docs/BUILD_STATUS.md](docs/BUILD_STATUS.md) for implementation status. `src/lib/simulation.ts` is an invented, deterministic teaching model; ticks are not real latency measurements.

Community-built educational simulation. Not affiliated with or endorsed by Raiku.
