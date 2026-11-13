# Audit, 0.2.0

What was measured on 13 November 2026, on this machine, from a production build. Numbers are from
the commands shown; nothing here is estimated.

## Verification run

| Check | Command | Result |
| --- | --- | --- |
| Types | `npm run typecheck` | 0 errors |
| Unit tests | `npm test` | 47 passed |
| End to end | `npm run test:e2e` | 23 passed (Chromium) |
| Content | `npm run content:check` | 34 paragraphs, 0 errors, 0 warnings |
| Build | `npm run build` | 0 errors |
| Lint | `npm run lint` | 0 problems |
| Runtime deps | `npm audit --omit=dev` | 0 vulnerabilities |
| Lighthouse | `npm run lighthouse` | see below |
| Contrast | `node scripts/check-contrast.mjs` | every pair passes |

## Bundle

| Asset | Raw | Gzip |
| --- | --- | --- |
| Initial JS (`index-*.js`) | 354,252 B | 106,598 B |
| CSS | 20,952 B | 4,598 B |
| Chapter 8 chunk | 54,847 B | 15,616 B |
| Chapter 9 chunk | 53,555 B | 14,607 B |
| Search index chunk | 9,258 B | 3,357 B |

The budget was 200 kB gzip for initial JavaScript. Both chapters load on demand.

## Lighthouse, mobile emulation, 4x CPU throttle

| Route | Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Home | 100 | 100 | 100 | 91 | 0.76 s | 0.000 | 0–107 ms |
| Chapter 8 | 96–97 | 100 | 100 | 91 | 2.57–2.71 s | 0.000 | 3 ms |

Two fixes came out of this run: the loading skeleton now reserves the card's height (CLS fell
from 0.158 to 0.000) and Newsreader ships as a 58 kB Latin subset instead of 132 kB.

## Accessibility

- axe-core runs on nine routes in light mode and on Home and a chapter in dark mode, at WCAG 2.1
  A and AA, asserting zero critical or serious violations.
- A keyboard test confirms Tab order reaches the recall options with a visible focus ring.
- Contrast was computed for every foreground/background pair in `scripts/check-contrast.mjs`:
  light body text 14.35:1, dark body text 15.49:1, both well past 4.5:1.
- Not done: a screen reader pass on iOS VoiceOver, Android TalkBack or NVDA. Automated tools do
  not catch everything, so treat this as "no detected violations", not "accessible".

## Findings

### High

None found in shipped code.

### Medium

1. **All content is unverified.** 34 paragraphs, zero reviewed, zero page or line references.
   Mitigated by an explicit draft mark in the rail and a "verify page and line" note. This is a
   product risk, not a code defect; see `docs/SCIENCE-REVIEW.md`.
2. **Chapter route misses the LCP budget.** 2.57–2.71 s against 2.5 s. The largest element is the
   paragraph itself, which cannot paint until the chapter chunk has arrived and React has run.
   The performance score stays at 96–97. Tracked as a Lighthouse warning rather than silenced.

### Low

3. **Nine advisories in the dev dependency tree.** All come through `@lhci/cli` →
   `lighthouse` → `puppeteer-core`. `npm audit --omit=dev` is clean and none of it is in `dist/`.
   `npm audit fix` wants a breaking major bump; deferred and tracked by Dependabot.
4. **Search engines see one page.** Hash routing means chapters are not separately crawlable,
   which is where the SEO score of 91 comes from. Accepted for an offline-first reader; changing
   it would mean path routing plus prerendering.
5. **Service worker version is manual.** Forgetting to bump `VERSION` in `public/sw.js` leaves
   returning students on stale assets until the worker updates. Noted in the release runbook.
6. **Two TypeScript toolchains.** The app uses TypeScript 7; lint uses TypeScript 6 inside
   `tools/lint` because typescript-eslint refuses TS 7. Extra install step, documented.

## Reproducing

```bash
npm ci && npm ci --prefix tools/lint
npm run lint && npm test && npm run build
npm run test:e2e
npm run lighthouse      # requires Chrome
node scripts/check-contrast.mjs
```
