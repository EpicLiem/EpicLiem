# Performance verification

Measured against https://profile.epicliem.com before and after deployment, October 29, 2026 (New York). Three fresh Chrome contexts per version; 390 × 844 viewport; cache disabled; 150 ms network latency; 200,000 bytes/sec download; 93,750 bytes/sec upload; 4× CPU slowdown. These are local synthetic results, not field Core Web Vitals or guarantees for all devices. Backend/server cache state was not forced cold. Before and after used the same quote and page layout.

| Metric (median of three runs) | Before | After |
| --- | ---: | ---: |
| Largest contentful paint | 1,896 ms | 620 ms |
| Initial transfer, including document | 1,499,712 bytes | 151,872 bytes |
| Cumulative layout shift | 0.8211 | 0.0306 |
| Main-thread long-task blocking observed | 57 ms | 58 ms |

The blocking metric did not meaningfully improve. The gains are network and rendering improvements, not a claim that React executes less JavaScript.

## Changes

- Replaced the website's full Nerd Font with a preloaded WOFF2 Latin/punctuation subset of the exact same font. Font file is 4,688 bytes; measured font transfer fell from 1,353,743 to 4,988 bytes. All 86 non-whitespace characters used by quotes and reader source retain identical glyph outlines and advance metrics. Original font and license remain in assets/; rebuild the subset with `uv run --with 'fonttools[woff]' scripts/subset-font.py` when adding character sets.
- Server-rendered today's quote and tomorrow's candidates in parallel. They are readable without JavaScript. The private browser vote loads separately after hydration. The page is explicitly dynamic, and individual votes are never included in a shared page cache. Daily refresh and error/retry behavior remain available.
- Consolidated ballot totals and the current browser's selection into one grouped SQL query instead of two requests. No cache added to votes or winner settlement; per-day locking and deadline checks are unchanged.
- README now uses content-addressed lossless WebP; PNG remains an export. Current image: 45,747-byte PNG to 9,530-byte WebP, 79.2% smaller. Across all 54 passages: 1,910,737 to 381,518 bytes, 80.0% smaller. Tests compare every decoded RGBA pixel, dimensions and text wrapping. Historical image filenames remain available to prevent broken cached README references.

## Evidence and commands

- `node tests/profile-site.mjs` (baseline), `PROFILE_LABEL=after node tests/profile-site.mjs` (deployed improvement). Raw browser timings are in ignored outputs/performance/; summarized samples are in performance-samples.json.
- `npm test`: all 54 lossless image comparisons passed.
- `npm test --prefix website`: DST, date rollover, disjoint choices and vote/tie selection passed.
- `npm run build --prefix website`: production compilation and TypeScript passed.
- `TEST_ORIGIN=https://profile.epicliem.com node tests/browser.mjs`: desktop/mobile; vote/save/change/reload; invalid choice/origin; sources disclosure; error/retry; no horizontal overflow or page errors. Test vote removed by its exact day and voter ID.
- JavaScript-disabled browser: current quote and three candidates present in initial HTML.
- Screenshots visually checked to preserve type, colors, spacing, line wrapping and voting controls.

The browser access host was unavailable earlier in this task, so browser checks use Playwright with the installed Chrome executable. `CHROME_PATH` overrides the executable for other machines.
