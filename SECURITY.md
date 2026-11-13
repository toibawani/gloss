# Security

Gloss has no server, no accounts and no telemetry. Everything a student does stays in
`localStorage` on their device. That removes most of the usual attack surface, and it also means
there is nothing to breach on our side.

## Reporting a problem

Open a private security advisory on GitHub: <https://github.com/toibawani/gloss/security/advisories/new>.
Please do not open a public issue for a vulnerability. Include the browser, the URL and the steps
to reproduce. We aim to answer within seven days.

## What is in scope

- The built site in `dist/`: routing, service worker, content rendering, import/export.
- The content files in `src/content/`: a malformed or malicious chapter must not execute script.
- The build and dependency chain for the runtime bundle.

## What is out of scope

- Anything requiring a modified browser, a compromised device or local administrator access.
- The development server (`npm run dev`) which is not a production artefact.
- Findings that only reproduce with `@lhci/cli` or Playwright installed, since they are dev-only
  dependencies and never shipped.

## Current posture

Verified against the code on this branch, not asserted in general:

- Content Security Policy with no `unsafe-inline`, no `unsafe-eval`, `object-src 'none'`,
  `frame-ancestors 'none'`, `base-uri 'none'`, `form-action 'none'` (`public/_headers`).
- No `dangerouslySetInnerHTML` anywhere. Chapter SVGs are allow-listed by tag and attribute and
  rendered as React elements, so content cannot inject markup or script.
- Imported backup files are schema-validated and size-capped before they touch storage.
- Service worker caches same-origin GET responses only and never caches opaque or error responses.
- `npm audit --omit=dev` reports zero vulnerabilities. The dev dependency tree has advisories from
  `@lhci/cli` (see `docs/AUDIT.md`); none of that code is deployed.

This list is what we checked, not a claim that the app is unbreakable. See `docs/PENTEST.md` for
the manual checks and what was not tested.
