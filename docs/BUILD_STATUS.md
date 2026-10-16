# Build status

## Completed

- React 19 + TypeScript + Vite project, exact dependency versions, and npm lockfile.
- Shared responsive layout, navigation, not-found screen, page titles, route focus handling, skip link, visible keyboard focus, and the required community disclaimer.
- Home: editorial paper/green design, dark-green SVG block illustration, subtle CSS animation, mission cards, and entry points.
- Tutorial: three navigable lessons explaining SEE, ACT, and LAND with the required content boundaries.
- Game: three interactive missions with selectable paths, back/restart controls, and disabled continuation until a choice is made.
- Framework-independent deterministic simulation engine. All eight possible choice combinations work. Its arbitrary ticks and market rules are invented educational examples.
- Results: choice timeline, inclusion/execution distinction, learning score, replay, and downloadable standalone SVG share card with disclaimer.
- Personal progress only in localStorage; corrupt/unavailable storage handled, with a clear-progress control in About.
- About: explanations of executed transactions, eligible orders in Raiku-produced blocks, inclusion, execution, finality, profit, privacy, and official reference links.
- Locally bundled Geist and Geist Mono fonts, CSS design tokens, reduced-motion support, and SVG navigation arrows independent of font glyph coverage.
- Project requirements preserved in `CLAUDE.md` and development/deployment instructions in `README.md`.

## Verification

- `npm run build`: passed (TypeScript checking + production bundle).
- `npm test`: 10 tests passed. Covers deterministic simulation outcomes, all eight combinations, invalid choices, storage persistence, corruption, stored-result validation, and blocked storage.
- `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e`: 6 tests passed across desktop Chromium (1440px) and mobile Chromium (390px). Covers tutorial, complete gameplay, SVG download, reload persistence, replay, clear progress, direct routes, not-found handling, no horizontal page overflow, skip navigation, reduced motion, and gameplay with blocked storage. No browser errors in the complete normal flow.
- Desktop and mobile landing screenshots inspected. The font's missing diagonal arrow glyphs were replaced with SVG icons.
- SVG download verified through the browser download event; output is a local file, not a remote share service.
- Dependency audit: production dependencies have no reported vulnerabilities after updating React Router to 7.18.4. Vite 7.3.7 and Vitest 4.1.12 include current fixes within the selected stable major versions. Full audit reports one low-severity transitive esbuild advisory for its development server on Windows; this Linux workflow does not use that server, and esbuild is not shipped in the browser bundle. No forced incompatible overrides were applied.
- Mobile tests emulate an iPhone viewport using Chromium; real-device Safari testing remains future validation.

## Blocked official assets

The environment network proxy returned HTTP 403 for `raiku.com`, its brand-assets page, the supplied co-location article, and both official SVG URLs. Those pages were not reviewed. `public/brand/README.md` records the missing assets. Plain-text branding is used; no replacement Raiku logo was invented.

Playwright's browser download CDN was also blocked, but the existing `/usr/bin/chromium` provided a working browser for all checks. Browser testing is not blocked.

## Next steps / deliberate development placeholders

- Obtain the official SVGs and inspect official usage guidance when network access permits; preserve asset proportions.
- Expand the clearly labeled prototype into a richer event-by-event replay, variable block schedules, and additional teaching scenarios. Current Results provide a static replay of all choices, and replay starts a fresh run.
- Finality, fees, price formation, and profit are not modeled. Do not represent existing rules as real Raiku performance or eligibility conditions.
- Download currently exports SVG; optional PNG export can be added later.
- Perform broader assistive-technology and real-device checks before public release. Automated checks are not a complete accessibility audit.
- Production deployment is not included. Configure static hosting to serve `index.html` for all application routes.
