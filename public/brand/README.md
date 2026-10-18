# Official assets pending

Both official SVG requests returned HTTP 403 from the environment network proxy during development:

- https://raiku.com/brand/raiku-logo-full.svg
- https://raiku.com/brand/raiku-intersect.svg

The official website, brand-assets page, and co-location article were blocked too. Their contents were not reviewed. The application uses a plain-text title and original educational block diagrams, not an invented Raiku logo. Download the official assets here when network access permits; preserve their proportions and inspect their licenses and usage guidance before use.

The official full-logo URL was retried during the PNG results stage and again returned HTTP 403. The PNG renderer therefore uses the plain-text application title. Once the original SVG is available locally, set `brand.officialLogoPath` in `src/lib/brand.ts` to its same-origin path; the renderer fits the original natural aspect ratio rather than stretching it. No external logo is fetched during export.
