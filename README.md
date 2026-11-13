# Gloss

Margin notes for every NCERT paragraph. Gloss explains NCERT textbooks line by line for NEET, JEE and UPSC students, tied to the exact paragraph in the book.

## Stack

React, Vite, TypeScript, Zod. Content is JSON validated at load time. Progress and spaced repetition live in localStorage. No backend, no accounts, no personal data. Hash routing and a small hand-written service worker for offline use.

## Quick start

```bash
npm install
npm run dev        # local dev server
npm test           # schema, scheduler and persistence tests
npm run build      # typecheck and production build into dist/
```

## Add a chapter

1. Copy `src/content/bio-11-ch8.json` to a new file in `src/content/`.
2. Change `id`, `subject`, `class`, `title` and fill `paragraphs`. Each paragraph needs 2 recall questions and a short `key_phrase` (80 characters max). Never paste NCERT text.
3. Keep SVGs simple. Only basic shapes, paths and text are rendered. Colours must use `currentColor`.
4. Set `review_status` to `draft`. Run `npm test` and `npm run dev`. Invalid files are skipped and the Home screen shows a generic notice.

## Expert review

A paragraph may be marked `expert_reviewed` only after a subject expert has checked every fact, the page and line reference against the current NCERT edition, and each recall answer. Record who reviewed it and when in the pull request. Until then keep `draft` and a `review_note`. The app shows the expert mark only for `expert_reviewed`.

## Security headers

`public/_headers` holds the CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS and `frame-ancestors`. Netlify and Cloudflare Pages read this file. GitHub Pages cannot set response headers, so use one of those hosts or a proxy. The CSP forbids inline scripts and styles, so do not add them.
