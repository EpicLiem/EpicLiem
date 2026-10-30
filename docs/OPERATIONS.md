# Daily Leonardo profile

The GitHub profile README contains only the quote image, linked to https://profile.epicliem.com. The website is an ordinary Next.js app in `website/`, hosted on Vercel (`leonardo-profile`, root directory `website`). It uses a dedicated Neon free-plan Postgres database. No OpenAI hosting, runtime, authentication, or API is used.

## Local work

- Root: `npm ci && npm test` validates all 54 image renders and pixel-identical lossless WebP encoding.
- Website: `npm ci --prefix website`, then copy `website/.env.example` to `website/.env.local` and supply DATABASE_URL and a random VOTER_SECRET (at least 32 characters).
- `cd website && npm run db:migrate` creates only the two named Leonardo tables and their index, idempotently.
- `npm run dev --prefix website` serves port 3127.
- `npm test --prefix website` checks New York date/DST boundaries, candidate rotation, and ties.
- `npm run build --prefix website` runs a production build and TypeScript checks.
- `node tests/browser.mjs` tests the running local server with Chrome. It writes test-voter IDs and screenshots to ignored `outputs/qa/`; use a test database or remove only those test rows afterward.

## Selection

Every day offers three passages, cycling through the 54-entry collection in groups. Adjacent days are disjoint; passages recur after 18 days. Votes select within each group; the first listed quote wins ties and days without votes. October 29, 2026 starts with the requested section 847 passage.

The day boundary is midnight in America/New_York, including DST. Votes and settlement share a PostgreSQL transaction advisory lock per target day. The SQL write checks the deadline after acquiring that lock. A day's winner is inserted once and remains fixed. The first request after midnight settles the result; the hourly GitHub workflow normally makes that request at 00:07.

Voting uses a signed, HttpOnly, SameSite=Lax browser cookie. A vote can be replaced by that browser, not accumulated. Ten browsers per network per target day are allowed, using a date-scoped HMAC of Vercel's trusted IP header. The raw address is not stored. This deters casual flooding; it is not identity verification, and shared networks may hit the cap. Only aggregate counts are public.

## Automation

`.github/workflows/daily-quote.yml` checks hourly at minute 7. It fetches the current winner, validates the day and quote against the source-controlled collection, converts the exact Terminess font to SVG paths and renders a PNG export plus lossless WebP for the README, then commits README.md, quote.png, images/ and current-quote.json only when changed. Content-hashed image filenames bypass stale GitHub image caches; old published images remain available for cached READMEs. Scheduled runs may be delayed by GitHub; they are not an exact-midnight guarantee. Workflow failures preserve the previous image and are visible in Actions. Public-repo schedules may be disabled after 60 days of repository inactivity; daily successful quote commits keep this repository active.

Run manually with `gh workflow run daily-quote.yml -R EpicLiem/EpicLiem`. The default branch must allow the GitHub Actions token to push. Website-only changes deploy through Vercel's Git integration; image-only commits skip website builds using `ignoreCommand`.

## Sources and maintenance

`data/quotes.json` is the profile validator's collection; `website/lib/quotes.json` must stay identical. See `data/SOURCES.md` for primary-source anchors and translation details. The quoted text is historical, not a claim of modern scientific accuracy. Font license lives in `assets/terminess-LICENSE.txt` and website/public/fonts.

To add passages, update both collections and test rotation; the corpus length must be a multiple of three to retain the stated 18-day group behavior (cycle length changes with collection size). Existing persisted editions refer to stable IDs: don't remove published IDs.

## Crisp README artwork

The README now links to a content-addressed SVG. Lettering uses embedded, reusable glyph outlines from the same font with `shape-rendering="crispEdges"`; rounded background corners retain normal antialiasing and transparency. There are no external fonts, images, scripts or foreign objects. This avoids browser downsampling of a large raster image and does not depend on custom README CSS, which GitHub strips. The browser still decides how to apply the crisp-edge rendering hint. A 2× PNG export remains at quote.png; existing WebP/PNG assets remain available for cached older READMEs. The earlier WebP performance measurements describe that previous version, not the SVG's transfer size.
