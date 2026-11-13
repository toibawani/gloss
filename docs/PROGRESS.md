# Progress log

Newest entry first. One dated line per working session: what was done, what is next. If a session
dies, the next one resumes from this file alone.

## 2026-11-13

**Round 1 closed.** PR #3 (reader design) and PR #4 (tooling, e2e, performance, docs) are merged
into `main`; `v0.2.0` is tagged and pushed. 47 unit tests, 23 e2e tests, Lighthouse 96-100.

**Round 2 started** on `feature/design-system`. Order of work is fixed by the brief:

1. `feature/design-system` - design audit, DESIGN.md, tokens, wordmark, icons, custom components,
   styleguide route, diagram renderer classes. **in progress**
2. `feature/app-shell-landing` - public site, live demo landing, shell navigation, Library, Today.
3. `feature/reader-redesign` - margin column, chapter openers, diagram redraws, notes, bookmarks.
4. `feature/accounts-sync` - Supabase migrations, RLS, auth screens, age gate, consent flag,
   Edge Functions, sync, export and delete.
5. `feature/content-expansion` - edition and PDFs, TOCs, new chapters, schema extensions.
6. `feature/qa-release` - full pass, docs, tag `v0.3.0`.

**Blocked on the maintainer:** which NCERT edition and printing to verify against, and the PDFs
for `reference/`. Without them every reference stays unverified and no new chapter can claim a
page or line number.

**Design system done on `feature/design-system`:** 88 screenshots reviewed, `docs/DESIGN-AUDIT.md`
written, `docs/DESIGN.md` added, tokens and type scale rebuilt, wordmark and app mark drawn, icon
set extended, semantic diagram classes added, empty states drawn, Home restyled, unlinked
`#/styleguide` route added. Verified: lint 0, 47 unit, 23 e2e, build 0 errors, initial JS 110.0 kB
gzip, contrast script passes in both themes.

**Bug found and fixed here:** Vitest was collecting the Playwright specs (5 failing files hidden by
a `| tail` check). `vite.config.ts` now includes only `src/**/*.test.ts`.

**Next:** merge this branch, then `feature/app-shell-landing`: public landing with the live
paragraph demo, bottom tab bar on phones and a left rail on desktop, Today and Library screens,
drawn subject covers, then the reader redesign with the margin sheet.
