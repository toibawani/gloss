# Production-readiness audit, 14 November 2026

Scope: the Gloss repository at commit `16d3343`, a static React application with no server, no
database and no accounts. This is a point-in-time audit, not a security guarantee.

## Stack, in five lines

1. React 19 + Vite 8 + TypeScript 7, built to static files in `dist/`.
2. Zod 4 validates chapter JSON at build time and again when a chapter loads.
3. No backend, no database, no authentication provider, no telemetry.
4. All user state (progress, saved words, review dates, settings) lives in `localStorage`.
5. Hosting is undecided; `public/_headers` targets Netlify or Cloudflare Pages.

## Audit results

Status is one of: present and correct, present but flawed, missing, not applicable.

### Secrets and configuration

| Item | Status | Reason |
| --- | --- | --- |
| Hardcoded API keys or tokens | present and correct | `git grep` for `service_role`, `sk-` keys and private key blocks returns nothing. |
| Frontend-exposed private values | present and correct | The bundle has no secrets; the only client variables are Supabase public URL and anon key, and accounts are not built. |
| `.env` ignored | present and correct | `.gitignore` excludes `.env` and `.env.*`, with `!.env.example`. |
| `.env.example` | present but flawed | It did not exist. Added with placeholder values and a warning that any `VITE_` value is public. |
| Secret inventory and rotation | not applicable | No secrets exist in this build. When Supabase is added, the anon key stays public and the service-role key stays server-side. |

### Authentication, sessions, authorization

| Item | Status | Reason |
| --- | --- | --- |
| Server-side authentication | not applicable | There is no server and no protected resource. |
| Password hashing and sessions | not applicable | No accounts exist. Supabase Auth is the planned provider, never a custom implementation. |
| Row level security | missing | No database. Any future table must ship with RLS before the first query, not after. |
| IDOR and mass assignment | not applicable | No record identifiers cross a network boundary. |

### Input, output and browser protections

| Item | Status | Reason |
| --- | --- | --- |
| XSS through chapter content | present and correct | SVG is parsed and rebuilt from an allow-list; no `dangerouslySetInnerHTML`; React escapes text. |
| Untrusted backup import | present and correct | Imported JSON is validated with Zod and rejected when it fails. |
| SQL injection | not applicable | No SQL. |
| CSP | present but flawed | `public/_headers` was documented in the README but missing from the repo. Added: `default-src 'self'`, no `unsafe-inline`, `frame-ancestors 'none'`. |
| Other security headers | present but flawed | Same file now sets `nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`, `Permissions-Policy`, HSTS. |
| CORS | not applicable | No API and no cross-origin requests. |
| Rate limiting and brute force | not applicable | No login, signup or write endpoint. |
| Open redirects and SSRF | not applicable | No user-supplied URLs are fetched server-side. |

### Data protection and dependencies

| Item | Status | Reason |
| --- | --- | --- |
| Encryption in transit | present but flawed | Depends on the host serving HTTPS. HSTS is declared, but this cannot be enforced from the repository. |
| Encryption at rest | not applicable | The only data is local browser storage, outside this project's control. |
| Dependency audit, production | present and correct | `npm audit --omit=dev` reports 0 vulnerabilities. |
| Dependency audit, development | present but flawed | `npm audit` reports 9 high advisories, all inside the Lighthouse CI toolchain (`@lhci/cli` → `lighthouse` → `puppeteer-core` → `proxy-agent` → `basic-ftp`). None ship to users; the fix needs an upstream release or a major upgrade, so it is tracked rather than forced. |
| Lockfile committed | present and correct | `package-lock.json` is committed and installs use `npm ci`. |

### Reliability, performance, operations

| Item | Status | Reason |
| --- | --- | --- |
| Error boundaries | present and correct | `ErrorBoundary` wraps every route and resets on hash change. |
| User-facing error messages | present and correct | Missing, offline and failed chapters get distinct messages with a next action. |
| Loading states | present and correct | Skeletons shaped like the real content, plus the reader heading painted from the index. |
| Offline behaviour | present and correct | A hand-written service worker serves visited chapters; an unvisited chapter says so. |
| Retries and timeouts | not applicable | There are no outbound requests. |
| Observability | missing | No error reporting or analytics by design, so failures in the field are invisible. A privacy-respecting error sink is a deliberate future decision, not an oversight. |
| Performance budget | present and correct | Initial JS 114,602 B gzip against a 200 kB budget. |
| Lighthouse after the last change | missing | Last measured 13 November; the section pages have not been re-measured. |

### Engineering practice and UX

| Item | Status | Reason |
| --- | --- | --- |
| Conventional commits and atomic branches | present and correct | Every change is one branch and one squash-merged pull request. |
| Tests | present and correct | 49 unit tests and 23 Playwright tests pass. |
| Accessibility | present and correct | `jsx-a11y`, visible focus, 44px targets, AA contrast checked by script in both themes. |
| Legal pages in the footer | present and correct | Terms and Privacy are linked in the footer on every page. |
| Design bans | present and correct | No gradients, shadows, glass, emoji, three-card rows or pill badges; one 3px radius. |
| Stale theme colours | present but flawed | `index.html` still carried the old cream theme colours. Fixed to the current palette. |

## Issues found and what changed

1. `public/_headers` was promised by the README but absent, so no CSP or security headers were
   actually shipped. Added with a strict policy and the standard header set.
2. `.env.example` was missing even though `.gitignore` whitelisted it. Added with placeholders and a
   note that `VITE_` values are public.
3. `index.html` still declared the old cream theme colours, which tinted the browser chrome wrongly
   in both themes. Corrected.
4. The README described 34 paragraphs in two chapters and 47 tests. Corrected to 24 chapters, 126
   paragraphs, 49 unit tests and 23 e2e tests, with the page routes documented.
5. Home still stacked the whole product on one page. Split: Home is now a landing page with three
   ways in, the library carries the catalogue, and subject, section and chapter each have a page
   with breadcrumbs.
6. Dev-only dependency advisories remain, described above.

## Verification results

| Check | Result |
| --- | --- |
| `npm run typecheck` | passed, 0 errors |
| `npm run lint` | passed, 0 errors |
| `npm test` | passed, 49 tests |
| `npm run build` | passed, 114,602 B gzip initial JS |
| `npm run test:e2e` | passed, 23 tests |
| `npm run content:check` | passed, 24 chapters, 0 errors, warnings only |
| `node scripts/check-contrast.mjs` | passed, both themes |
| `npm audit --omit=dev` | 0 vulnerabilities |
| `npm audit` | 9 high, dev-only Lighthouse toolchain |
| `npm run lighthouse` | not run in this audit |

## Remaining issues

- Accounts, sync and any server-side authorization do not exist, so RLS, session handling and rate
  limiting are untested rather than done.
- Content is draft. No page or line reference is claimed, and no subject expert has reviewed it.
- Dev-only advisories in the Lighthouse toolchain are open.
- Lighthouse has not been re-run since the section pages landed.

## Manual verification required

- Host choice. `public/_headers` only takes effect on Netlify or Cloudflare Pages; GitHub Pages
  ignores it. Confirm the deployed response headers with `curl -I`.
- HTTPS and HSTS at the host, including the redirect from HTTP.
- If accounts are added: Supabase project settings, redirect URLs, RLS policies, and two-account
  isolation tests.
- Fonts and service worker scope under the real domain, not only localhost.

## Recommended next steps

1. Rewrite the remaining chapters in the concrete voice used in Laws of Motion and Structure of
   Atom.
2. Decide hosting and verify the security headers in production.
3. Re-run Lighthouse on Home, a section page and a chapter, and record the numbers.
4. Upgrade or replace the Lighthouse CI toolchain when an upstream fix lands.
5. Only then build accounts, with RLS and server-side authorization from the first commit.
