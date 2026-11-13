# Contributing

## Setup

```bash
npm ci
npm ci --prefix tools/lint   # only needed for `npm run lint`
npx playwright install chromium
```

Node 24 or newer. The app is pinned to exact versions; do not widen a range in a feature PR.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server on 5173 |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | unit tests (schema, scheduler, store, lint rules) |
| `npm run test:e2e` | Playwright against a production build |
| `npm run lint` | ESLint, including jsx-a11y and react-hooks |
| `npm run content:check` | rebuild generated indexes and lint content |
| `npm run build` | content check, typecheck, bundle into `dist/` |
| `npm run screenshots` | capture review shots at 360/390/768/1280 |
| `npm run lighthouse` | Lighthouse CI against a preview build |

`npm run lint` uses the toolchain in `tools/lint` because typescript-eslint does not support the
TypeScript 7 compiler the app uses. Do not "fix" this by downgrading the app's TypeScript.

## Branches and commits

Short-lived branches off `main`, one logical change per branch and per pull request. Commit
messages follow Conventional Commits (`feat:`, `fix:`, `perf:`, `docs:`, `test:`, `chore:`), with
the area in the scope when it helps: `fix(sw): keep the shell cached by absolute URL`.

A pull request should say what changed, why, and how it was verified. Paste the real command
output for the checks you ran. Never write "tested" without saying what you ran.

## Content rules

These are not style preferences; they protect students and the project.

- Never paste NCERT text. A short key phrase (80 characters or less) may be quoted as an anchor.
- Every new paragraph starts as `review_status: "draft"` with a `review_note`. Only a subject
  expert may change that, and the pull request must record who checked it and against which
  edition.
- Do not invent page numbers, line numbers or exam years. If you cannot verify a reference,
  leave it out and say so in the review note.
- Run `npm run content:check` before opening the pull request. See `content/REVIEW.md` for the
  review checklist.
