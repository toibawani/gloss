# Changelog

All notable changes to Gloss. Dates are ISO. The app version is in `package.json` and is shown in
Settings.

## 0.2.0 - 2026-11-13

### Added

- Chapter reader with a margin rail: the meaning, tricky words, exam lens, a diagram and a memory
  hook sit beside the paragraph instead of below it, and stack on a phone.
- 34 draft paragraphs across Class 11 Biology chapters 8 (Cell: The Unit of Life) and 9
  (Biomolecules). Every paragraph is marked draft and carries a "verify page and line" note.
- Content pipeline: `content:build` writes the chapter index and search index, `content:lint`
  enforces the editorial rules, `content:verify` checks references when PDFs are supplied.
- Spaced repetition on a day boundary, with 1, 3, 7 and 21 day intervals and a revision screen
  that explains an empty day.
- Local search across paragraphs, tricky words and hooks.
- Export and import of all local data as a validated JSON file, with quota handling and a
  migration from the 0.1 storage format.
- Settings for theme, text size, line spacing and exam goal, applied before first paint.
- Self-hosted Newsreader, Public Sans, Caveat and Hind, with a Devanagari fallback for Hindi
  glosses.
- Hand-drawn icon set, hand-built service worker, offline shell and an update bar that only
  reloads when the student taps it.
- Playwright end-to-end suite (23 tests) covering reading, revision, transfer, offline and axe
  accessibility checks.
- ESLint with jsx-a11y and react-hooks, Lighthouse CI budgets, screenshots at four widths and a
  GitHub Actions pipeline with Dependabot.

### Changed

- Full visual rewrite against a paper and ink palette: no gradients, no shadows, no blur, one
  radius (3px), no emoji.
- Initial JavaScript is 106.6 kB gzip; chapters load as separate 16 kB chunks.

### Known gaps

- All content is draft. No paragraph has been checked by a subject expert.
- Page and line references are unverified until the matching NCERT edition is supplied.
- The chapter route reaches about 2.6 s largest contentful paint on throttled mobile, against a
  2.5 s budget.

## 0.1.0 - 2026-11-12

### Added

- Initial reader: chapter list, paragraph view, word saving, a simple revision queue and
  localStorage persistence.
