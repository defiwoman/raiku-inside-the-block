# Publish the existing application on Netlify

The application is at the **Git repository root**. The cloud checkout is `/workspace/raiku-inside-the-block`, but that enclosing directory is not a subfolder inside the repository. Do not set the Netlify base directory to `raiku-inside-the-block`.

## Exact settings

| Setting                                  | Value                                                           |
| ---------------------------------------- | --------------------------------------------------------------- |
| Repository                               | `https://github.com/defiwoman/raiku-inside-the-block`           |
| Branch to deploy                         | `work`                                                          |
| Base directory                           | `.` (repository root; leaving the UI field blank is equivalent) |
| Package directory                        | Leave unset                                                     |
| Build command                            | `npm run build`                                                 |
| Publish directory                        | `dist`                                                          |
| Node.js version                          | `24` (configured in `netlify.toml`)                             |
| Required environment variables / secrets | None                                                            |

`package-lock.json` is committed; use npm. `netlify.toml` is committed at the repository root and defines the build settings and the `/*` → `/index.html` rewrite with HTTP 200. It does not force rewrites over existing assets, so Vite's generated JS, CSS, and fonts continue to work.

## Connect and publish

1. Sign in to Netlify and import an existing project from GitHub.
2. Select `defiwoman/raiku-inside-the-block`, grant access if Netlify requests it, and explicitly choose branch `work`.
3. Use the settings above. If the site is already connected, check its branch, base directory, build command, and publish directory against this table, then trigger a new deploy.
4. Wait for Netlify to finish building. Open the real site URL reported by Netlify's successful deploy. Do not use a local Vite address as a public link.
5. Check the homepage, use **Enter the Block**, try Act or Pass, and refresh `/tutorial`. Also open `/about`, `/game`, and `/results` directly and refresh them. An empty Results screen before completing a game is expected.

The SPA rewrite is needed because React handles these routes in the browser. A static host that looks for a physical `/tutorial` file without the fallback will return 404 on refresh even though client navigation works.

## What is complete, and what awaits Prompt 3?

Prompts 1 and 2 include the React/TypeScript/Vite foundation, five screens, responsive landing page, numbered block illustration, guest play, optional local display name, reset, glossary, and complete self-paced Act/Pass tutorial with explanatory replay. The existing three-mission prototype also produces local results and SVG share cards.

The three-mission Game and Results screens are **development prototypes awaiting further gameplay work in Prompt 3**. Full market replay, variable block schedules, and animated event-by-event Results replay are not implemented. Their current timings, market rules, and learning scores are invented. Finality and trading profit are not modeled. There is no live Raiku integration, wallet, backend, or real trading.

## Validation and limits

Run `npm ci`, `npm run build`, and `npm test`. The production output is `dist/`. Browser checks use `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/usr/bin/chromium npm run test:e2e` when Chromium is installed at that path.

Successful local builds and browser tests do not mean the site is deployed. A GitHub push only makes the source available for Netlify to build. Netlify account access and an actual successful deployment are still needed to obtain a public site URL.
