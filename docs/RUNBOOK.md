# Runbook

## Requirements

Node 24 or newer (developed on 26), npm 11. The app has three runtime dependencies: React,
React DOM and Zod.

## First run

```bash
npm ci
npm ci --prefix tools/lint
npx playwright install chromium
npm run dev
```

`tools/lint` is a second, tiny install. ESLint runs through typescript-eslint, which refuses to
load against the TypeScript 7 compiler the app uses, so lint has its own pinned TypeScript 6.
Everything else (typecheck, build, tests) uses TypeScript 7. If you add a lint dependency, add it
to `tools/lint/package.json` when the plugin needs its own TypeScript.

## Everyday commands

```bash
npm run typecheck
npm test                 # 47 unit tests
npm run test:e2e         # 23 Playwright tests, builds and serves dist on 4173
npm run lint
npm run build            # content check -> typecheck -> bundle
npm run preview          # serve dist on 4173
```

## Content pipeline

1. Edit or add a chapter in `src/content/`. Never edit `src/generated/` by hand.
2. `npm run content:build` regenerates the chapter index, search index and word counts.
   `--check` fails instead of writing, which is what `npm run build` uses.
3. `npm run content:lint` applies the editorial rules (no pasted NCERT text over the key phrase
   limit, draft status, required recall answers, review note).
4. `npm run content:verify` compares `ncert_ref` values against `reference/editions.json` and the
   PDFs. Without either it prints SKIPPED and exits 0. That is expected in a fresh clone.
5. Run the app, read every paragraph, then run `npm run content:check` again.

The build fails if a chapter does not match the Zod schema, so a broken chapter can never ship.

## Service worker

`public/sw.js` is hand-written and precaches the shell plus the assets the page actually
requested. It caches entries by URL and reads them with `ignoreVary`, because compressed assets
carry `Vary: Accept-Encoding`.

When you change caching behaviour, bump `VERSION` in `public/sw.js`. The old cache is deleted on
activate, and the update bar tells the student a new version is ready. Never auto-reload on
`controllerchange`: a first install fires it too, and reloading then is a visible flash for no
reason.

To test offline by hand: open a chapter, wait for the service worker, switch the network off in
DevTools, reload. The chapter you opened must render; an unopened one must say it is not saved.

## Releasing

```bash
npm version minor --no-git-tag-version
# update CHANGELOG.md
npm run build && npm test && npm run test:e2e
git tag -a v0.2.0 -m "Gloss 0.2.0"
```

`__APP_VERSION__` is injected from `package.json` at build time and shown in Settings.

## Deploying

The build is a static folder. `dist/` is the whole site.

1. `npm run build`.
2. Upload `dist/` to any static host that serves `_headers` (Netlify, Cloudflare Pages) or set the
   same headers yourself.
3. Serve over HTTPS. The service worker only registers on HTTPS or `localhost`.
4. Do not use GitHub Pages: it cannot set response headers, so the CSP would be missing. If you
   must, put a proxy in front that adds them.

Headers live in `public/_headers` and are copied into `dist/`. The CSP has no `unsafe-inline`, so
a future inline script or `style` attribute will be blocked; use the bundled CSS instead.

Rollback is uploading the previous `dist/`, then bumping `VERSION` in `public/sw.js` so clients
pick it up on next visit. Do not rely on a killed cache: the old worker will keep serving what it
already cached.

## Performance checks

```bash
npm run build
npm run lighthouse       # needs Chrome installed
npm run screenshots      # 360/390/768/1280 in light and dark
```

Lighthouse uses mobile emulation with 4x CPU throttling. The LCP budget on the chapter route is
tracked as a warning, not an error, because it currently lands at about 2.6 s.

## Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| `typescript-eslint does not support TS 7.0` | lint ran without `tools/lint` | `npm ci --prefix tools/lint` |
| Playwright cannot launch | browser not installed | `npx playwright install chromium` |
| Offline reload shows a blank page | cache miss after a rebuild | bump `VERSION` in `public/sw.js` |
| `content:verify` prints SKIPPED | no PDFs or edition map | expected; supply `reference/` |
| Build fails on a chapter | schema or lint rule | read the message, it names the field |
