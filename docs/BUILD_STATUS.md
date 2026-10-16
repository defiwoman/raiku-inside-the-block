# Build status

## Completed

- React 19 + TypeScript + Vite project, exact dependency versions, and npm lockfile.
- Shared responsive layout, navigation, not-found screen, page titles, route focus handling, skip link, visible keyboard focus, and the required community disclaimer.
- Home: requested “Inside the Block” title, community eyebrow, strategy headline, supporting copy, “Enter the Block” and “How it works” CTAs. A compact SEE/ACT/LAND introduction uses the requested questions.
- Large responsive dark-green SVG block illustration: nine numbered transaction tiles, an explicitly executed #07 event, and a delayed observation marker. Static labels remain readable while optional decorative animation runs. Pause/resume and system reduced-motion support; clearly labeled as an illustration, not a live feed.
- Beginner onboarding: no registration; immediate guest play; optional display name limited to 24 characters. No wallet, email, or X account collected. Name and tutorial state remain in localStorage on this device, separately from the existing game record.
- Interactive tutorial: an executed transaction at tick 0 is observed at tick 120; the player chooses Act or Pass. A four-moment self-paced replay explains the event, delayed observation, decision, and outcome. In the fixed Act example, inclusion at tick 240 occurs after the invented price window closes at tick 200, so execution is rejected. Passing submits no transaction. Neither path invents profit or finality results.
- Short expandable tooltips for block, validator, signal age, inclusion, and net result on Home and Tutorial. Definitions work with keyboard, touch, and click; Escape closes them. Instructions and decisions are never behind hover or timed animation.
- Game: three interactive missions with selectable paths, back/restart controls, and disabled continuation until a choice is made.
- Framework-independent deterministic simulation engine. All eight possible choice combinations work. Its arbitrary ticks and market rules are invented educational examples.
- Results: choice timeline, inclusion/execution distinction, learning score, replay, and downloadable standalone SVG share card with disclaimer.
- Personal progress only in localStorage; corrupt/unavailable storage handled without blocking guest play. Name, tutorial choice, and replay position survive reloads. Reset in Tutorial and clear-progress in About both clear name, tutorial, and game records. Existing saved game progress is preserved when onboarding is added.
- About: explanations of executed transactions, eligible orders in Raiku-produced blocks, inclusion, execution, finality, profit, privacy, and official reference links.
- Locally bundled Geist and Geist Mono fonts, CSS design tokens, reduced-motion support, and SVG navigation arrows independent of font glyph coverage.
- Project requirements preserved in `CLAUDE.md` and development/deployment instructions in `README.md`.

## Verification

- `npm run build`: passed (TypeScript checking + production bundle).
- `npm test`: 17 tests passed. Covers both beginner outcomes, all eight mission combinations, invalid choices, name limits and Unicode normalization, tutorial persistence/corruption, preservation of old game progress, combined reset, and unavailable storage.
- `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e`: 21 tests passed across desktop Chromium (1440px), mobile Chromium (390px), and narrow touch Chromium (360px). Covers both tutorial choices and replay focus, optional name/save/reload/reset, guest navigation, complete gameplay, SVG download, existing results persistence, clear progress, all direct routes, keyboard/Space/Enter/Escape controls, term tooltips, reduced motion, pause/resume, and blocked storage in tutorial and gameplay. No browser errors in the complete normal flow.
- Browser checks verify at least 44px height and width for landing/onboarding interactive controls, plus actual text/control bounds and no horizontal page overflow at 360px. These checks do not rely on clipping to hide oversized content.
- Desktop and mobile landing/onboarding screenshots inspected. SVG arrows and CSS playback marks avoid missing icon glyphs. Diagram captions repeat event and observation details as readable HTML on narrow screens.
- SVG download verified through the browser download event; output is a local file, not a remote share service.
- Dependency audit: production dependencies have no reported vulnerabilities after updating React Router to 7.18.4. Vite 7.3.7 and Vitest 4.1.12 include current fixes within the selected stable major versions. Full audit reports one low-severity transitive esbuild advisory for its development server on Windows; this Linux workflow does not use that server, and esbuild is not shipped in the browser bundle. No forced incompatible overrides were applied.
- Mobile tests emulate an iPhone viewport using Chromium; real-device Safari testing remains future validation.

## Blocked official assets

The environment network proxy returned HTTP 403 for `raiku.com`, its brand-assets page, the supplied co-location article, and both official SVG URLs. Those pages were not reviewed. `public/brand/README.md` records the missing assets. Plain-text branding is used; no replacement Raiku logo was invented.

Playwright's browser download CDN was also blocked, but the existing `/usr/bin/chromium` provided a working browser for all checks. Browser testing is not blocked.

## Next steps / deliberate development placeholders

- Obtain the official SVGs and inspect official usage guidance when network access permits; preserve asset proportions.
- The beginner tutorial now has a complete four-moment replay. Expand the separate three-mission Results into a richer event-by-event replay, variable block schedules, and additional teaching scenarios. Current Results provide a static timeline of all choices, and replay starts a fresh game run.
- Finality, fees, price formation, and profit are not modeled. Do not represent existing rules as real Raiku performance or eligibility conditions.
- Download currently exports SVG; optional PNG export can be added later.
- Perform broader assistive-technology and real-device checks before public release. Automated checks are not a complete accessibility audit.
- Production deployment is not included. Configure static hosting to serve `index.html` for all application routes.
