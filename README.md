# Gloss

Margin notes for NCERT paragraphs. Gloss explains a textbook paragraph line by line, in the margin
beside it, for students preparing for NEET, JEE and UPSC. It works offline and keeps everything on
the device it runs on.

![The reader on a phone: paragraph above, margin note below](public/screenshot-mobile.png)

![The margin rail beside the paragraph on a laptop](public/screenshot-wide.png)

## Status

Usable for reading and revision, with two honest limits:

- **All content is draft.** 34 paragraphs across Class 11 Biology chapters 8 and 9 have not been
  checked by a subject expert. The app says so on every card.
- **Page and line references are unverified.** They stay out until the exact NCERT edition is
  supplied. `npm run content:verify` reports SKIPPED until then.

There is no backend, no account and no telemetry. Chapter text never leaves the bundle; progress,
saved words and review dates live in `localStorage`.

## Features

- A reader built around one paragraph at a time: meaning, tricky words, exam lens, a diagram and a
  memory hook in the margin rail on tablet and desktop, stacked under the paragraph on a phone.
- 34 draft paragraphs in two chapters, loaded on demand as separate 15 kB chunks.
- Spaced repetition on a day boundary (1, 3, 7, 21 days) with a revision screen that explains an
  empty day.
- Local search across paragraphs, tricky words and hooks.
- Export and import of all local data as validated JSON, with a migration from the 0.1 format.
- Settings for theme, text size, line spacing and exam goal, applied before first paint.
- Installable PWA with a hand-written service worker: visited chapters reopen with no network, and
  the update bar waits for a tap before reloading.
- Self-hosted fonts, a hand-drawn icon set, and a paper-and-ink palette with one 3px radius.

## Stack

React 19, Vite 8, TypeScript 7, Zod 4. Content is JSON, validated against a schema in the build and
again when it loads. Hash routing, `localStorage`, an SVG allow-list renderer and a service worker
of about 100 lines. No UI framework, no CSS framework, no icon package.

## Quick start

```bash
npm ci
npm ci --prefix tools/lint   # lint has its own TypeScript 6 toolchain
npx playwright install chromium
npm run dev
```

| Command | What it does |
| --- | --- |
| `npm run dev` | dev server on 5173 |
| `npm test` | 47 unit tests |
| `npm run test:e2e` | 23 Playwright tests against a production build |
| `npm run lint` | ESLint with jsx-a11y and react-hooks |
| `npm run build` | content check, typecheck, bundle into `dist/` |
| `npm run content:check` | rebuild indexes and lint content |
| `npm run screenshots` | review shots at 360/390/768/1280, light and dark |
| `npm run lighthouse` | Lighthouse CI budgets (needs Chrome) |

## Measured, not claimed

From `npm run build` and `npm run lighthouse` on 13 November 2026:

- Initial JavaScript: 354,252 B raw, **106,598 B gzip**.
- Home: Lighthouse 100 performance, 100 accessibility, 100 best practices.
- Chapter route: 96–97 performance, 100 accessibility.
- Cumulative layout shift 0.000; total blocking time 3 ms on the chapter route.
- Largest contentful paint on the chapter route is 2.6 s against a 2.5 s budget. The full audit,
  including what was not tested, is in [`docs/AUDIT.md`](docs/AUDIT.md).

## Add a chapter

1. Copy `src/content/bio-11-ch8.json` to a new file in `src/content/`.
2. Change `id`, `subject`, `class`, `title` and fill `paragraphs`. Each paragraph needs two recall
   questions and a key phrase of 80 characters or less. Never paste NCERT text.
3. Keep SVGs to basic shapes, paths and text, coloured with `currentColor`. Only allow-listed tags
   and attributes are rendered.
4. Keep `review_status` as `draft` with a `review_note`. Run `npm run content:check` and
   `npm test`.

## Expert review

A paragraph becomes `expert_reviewed` only after a subject expert checks every fact, the page and
line reference against the current NCERT edition, and each recall answer. Record who reviewed it
and when in the pull request. Until then it stays draft. See
[`docs/SCIENCE-REVIEW.md`](docs/SCIENCE-REVIEW.md) and [`content/REVIEW.md`](content/REVIEW.md).

## Security

`public/_headers` carries the CSP, `X-Content-Type-Options`, `Referrer-Policy`,
`Permissions-Policy`, HSTS and `frame-ancestors`. Netlify and Cloudflare Pages read this file;
GitHub Pages cannot set response headers, so use one of those hosts or a proxy. The CSP has no
`unsafe-inline`, so do not add inline scripts or styles. Content SVG is rebuilt from an allow-list
and never injected as HTML. Report problems as described in [`SECURITY.md`](SECURITY.md).

## Docs

- [`docs/RUNBOOK.md`](docs/RUNBOOK.md): setup, content pipeline, releasing, deploying, problems.
- [`docs/AUDIT.md`](docs/AUDIT.md): performance, accessibility and dependency audit.
- [`docs/PENTEST.md`](docs/PENTEST.md): the manual security pass and what it did not cover.
- [`docs/SCIENCE-REVIEW.md`](docs/SCIENCE-REVIEW.md): what draft means and how review works.
- [`docs/BRANCHING.md`](docs/BRANCHING.md): branches, commits, pull requests, releases.
- [`CONTRIBUTING.md`](CONTRIBUTING.md) and [`CHANGELOG.md`](CHANGELOG.md).
