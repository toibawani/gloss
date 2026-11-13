# Gloss

**Margin notes for every NCERT paragraph.**

Gloss explains NCERT textbooks line by line for students preparing for NEET, JEE and UPSC. You read the book. Gloss sits beside it and tells you what the paragraph means, which words will trip you, how to remember it and how the exam asks about it. Then it quizzes you until it sticks.

NCERT is the base for all three exams, but the language is dense, it is easy to get lost, and it is easy to forget. Video lectures are not tied to the exact line you are stuck on. Gloss is.

## What you get for every paragraph

| Part | What it does |
| --- | --- |
| Reference | The NCERT section, page and line, plus a short key phrase so you find the spot in your book in seconds. |
| Plain meaning | Two or three sentences in simple English that reads naturally to a Hinglish-speaking student. It explains the idea instead of rewording the textbook. |
| Tricky words | Tap an underlined word for its simple meaning, where it comes from (endo = inside, plasmic = fluid) and where students usually trip. |
| Visual | One hand-built SVG diagram that shows the idea. No stock images, no decoration. |
| Never-forget hook | A mnemonic, analogy or tiny story made for that exact concept. |
| Exam lens | How the concept shows up in NEET, JEE or UPSC, plus one classic trap. |
| Recall check | Two questions with explanations, scheduled again after 1, 3, 7 and 21 days. |

## Ground rules

- **It sits beside the book.** Gloss never reproduces NCERT text. It stores a reference and a short key phrase (80 characters at most). Every explanation is original writing.
- **It is honest about quality.** Every paragraph is marked `draft` until a subject expert has checked it. Only `expert_reviewed` paragraphs show the "Reviewed by expert" mark.
- **It is private by default.** No accounts, no names, no emails, no trackers. Progress lives in your browser on your device.
- **It is built for cheap phones and bad networks.** Installable PWA, built for offline use after the first load, and only three runtime dependencies.

## Screens

- **Home:** subjects, chapters and how much of each you have read.
- **Reader:** one paragraph card at a time. Swipe, tap the buttons or use the arrow keys. A progress bar shows where you are.
- **Word bank:** every tricky word you have opened, searchable.
- **Revision:** the recall questions that are due today.
- **Terms of Service and Privacy Policy:** plain-language drafts, linked in the footer.

Light and dark themes follow your device setting. The design is an annotated book page: paper tones, serif reading text, pencil-style underlines for tricky words, handwritten hooks, solid colors and borders instead of shadows and gradients.

## Quick start

You need Node 20 or newer.

```bash
git clone https://github.com/toibawani/gloss.git
cd gloss
npm install
npm run dev
```

Open http://localhost:5173. To try it on your phone on the same wifi, run `npm run dev -- --host` and open the network URL it prints.

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server. |
| `npm test` | Run the Vitest tests for the content schema, the review scheduler and saved progress. |
| `npm run typecheck` | TypeScript check with no output files. |
| `npm run build` | Typecheck, then build to `dist/`. |
| `npm run preview` | Serve the production build at http://localhost:4173. |

The service worker only runs in a production build. To test offline, run `npm run build` and `npm run preview`, load the page once, turn off your network and reload.

## How spaced repetition works

Answer a recall question and it gets scheduled. Each correct answer moves it to the next gap. A wrong answer sends it back to one day.

| Correct answers in a row | Comes back after |
| --- | --- |
| 1 | 1 day |
| 2 | 3 days |
| 3 | 7 days |
| 4 or more | 21 days |

Everything is stored locally. Due questions show up on the Revision screen.

## Content format

Content is plain JSON, one file per chapter, in `src/content/`. Each file is checked with Zod when the app loads. A file that fails is skipped and the Home screen shows a short, generic notice. Details stay out of the UI.

```text
chapter
  id, subject, class, title, paragraphs[]

paragraph
  id, ncert_ref, key_phrase (80 characters max), meaning
  words[]         term, meaning, breakdown, trap
  visual_svg, visual_alt
  hook
  exam_tags[]     NEET | JEE | UPSC
  exam_note, trap
  recall[]        exactly 2: q, options[], answer (index), why
  review_status   draft | expert_reviewed
  review_note     optional
```

SVG is never injected as raw HTML. It is parsed and rebuilt from an allow-list of basic shapes, paths and text, and anything else is dropped. Use `currentColor` so diagrams follow the theme.

## Add a chapter

1. Copy `src/content/bio-11-ch8.json` to a new file in `src/content/`.
2. Change `id`, `subject`, `class` and `title`, then write your paragraphs.
3. Keep `review_status` as `draft`. Put anything you are unsure about in `review_note`.
4. Run `npm test`, then `npm run dev` and read your chapter on a phone-sized window.

No code changes are needed. Any subject, class or chapter works.

## Expert review

A paragraph can be marked `expert_reviewed` only after a subject expert has checked:

- every fact in the meaning, hook, exam note and trap
- the page and line reference against the current NCERT edition
- each recall answer and its explanation

Record who reviewed it and when in the pull request. Until then it stays `draft` and the app shows it as a draft.

## Project structure

```text
src/
  App.tsx        screens and routing
  content.ts     loads and validates chapters
  content/       one JSON file per chapter
  schema.ts      Zod schema for chapters and paragraphs
  srs.ts         review scheduler
  store.ts       localStorage with validation on read
  Visual.tsx     safe SVG renderer
  Legal.tsx      Terms and Privacy pages
public/
  sw.js          service worker
  _headers       security headers for the host
  manifest.webmanifest
```

Stack: React, Vite, TypeScript, Zod, Vitest. Routing and the service worker are hand-written to keep dependencies small.

## Deploying

`npm run build` writes a static site to `dist/`. It is built with relative paths, so it works from a subfolder.

Security headers live in `public/_headers`: Content Security Policy, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS and `frame-ancestors`. Netlify and Cloudflare Pages read this file. GitHub Pages cannot set response headers, so use one of those two or put a proxy in front.

The CSP does not allow inline scripts or inline styles. Do not add them.

## Status

Early. Content is draft until an expert reviews it, and NCERT page and line references need checking against the printed book.

Planned next:

- more chapters and subjects
- scripts that verify references against your own copy of the book
- end-to-end tests and Lighthouse checks in CI
- optional progress sync, only after legal review, because many students are under 18 and India's Digital Personal Data Protection Act 2023 needs verifiable parental consent for children's data

## Contributing

Found a wrong fact or a confusing explanation? Open an issue at github.com/toibawani/gloss/issues and name the paragraph id.

For code and content changes, branch as `feature/<name>` or `bugfix/<name>`, keep commits small, and write them as `type(scope): imperative description`, lowercase, under 72 characters. Types are feat, fix, refactor, style, docs, chore, test and perf. Open a pull request using the template: Summary, Key changes, How to test.

## Disclaimer

Gloss is not affiliated with or endorsed by NCERT. NCERT text belongs to NCERT. Gloss points to it with short references and explains it in original words. Use Gloss as a study aid and check facts against your textbook before an exam.
