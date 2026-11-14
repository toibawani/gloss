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

**Physics and chemistry added (`feature/physics-chemistry-content`, PR #13):** Class 11 Physics 1
(Units and Measurements) and Chemistry 1 (Some Basic Concepts of Chemistry), six draft paragraphs
each, with diagrams. Content is now 4 chapters, 46 paragraphs, 135 words.

**Subject covers and shell (`feature/subject-covers`):** drawn subject covers tinted with the
subject ink, a Library screen, a shared chapter row component, `#/s/<subject>`, and a five item
bottom tab bar on phones with labels. Fixed: SVG shapes defaulted to black fill, so every new
diagram rendered as a blob until the base rule set `fill: none`.

**Next:** `feature/app-shell-landing`: public landing with the live
paragraph demo, bottom tab bar on phones and a left rail on desktop, Today and Library screens,
drawn subject covers, then the reader redesign with the margin sheet.

**Palette and motion, content expansion (this session).** The cream and rust palette was rejected
as looking dated, so the tokens are now a cool paper `#f4f5f2` with ink `#12161a` and deep blue
`#0f4c81` for actions, plus subject inks in green, indigo, oxide red and ochre. Motion was added
with a job: hash routes cross-fade inside `document.startViewTransition`, the progress meter
animates on mount, the tab bar slides its underline, chapter rows lift their plate on hover, and
answers reveal on open. Reduced motion cancels all of it. Four chapters were added, each four draft
paragraphs with a diagram: Physics 2 (Motion in a Straight Line), Physics 4 (Laws of Motion),
Chemistry 2 (Structure of Atom), plus Chemical Bonding and Class 11 Biology Cell Cycle and Cell
Division. Content is now 9 chapters, 66 paragraphs, 195 words, all `draft`.

Verified this session: lint 0, 49 unit tests, build 0, 23 e2e, contrast script passes both themes,
`node scripts/build-content.mjs` 13 warnings 0 errors, initial JS 111.69 kB gzip. Screenshots
regenerated and reviewed at 360 and 1280. Not verified: any page or line reference, because no
NCERT edition or PDF has been supplied, and the accounts work, which is still blocked on a
Supabase project.

## 2026-11-14

**Ten more chapters, written to the same standard.** Physics 3 (Motion in a Plane), 5 (Work, Energy
and Power), 6 (System of Particles and Rotational Motion) and 7 (Gravitation); Chemistry 5
(Thermodynamics), 6 (Equilibrium) and 7 (Redox Reactions); Biology 1 (The Living World), 2
(Biological Classification) and 7 (Structural Organisation in Animals). Each has four draft
paragraphs with a diagram, three tricky words with a trap, an exam note and two recall questions.
Content is now 19 chapters, 106 paragraphs, 315 words across three subjects. All draft, all with a
review note, none claiming a page or line.

**Shell rebuilt for desktop.** A fixed 15rem rail now holds the brand, sections, subject counts and
settings on screens of 1000px and up; the top bar and tab bar stay for phones and tablets. Home
opens with a masthead: kicker, promise, and a four figure band on shared hairlines. The three tile
band was removed in favour of a ruled subject index, and chapter numerals are right aligned so
every row starts on the same axis. The reader opens with a 2px rule in the subject's ink.

Verified: content build 19 chapters, 0 errors; typecheck 0; lint 0; 49 unit tests; 23 e2e; build 0,
initial JS 112.51 kB gzip; 104 screenshots regenerated and reviewed at 360 and 1280 in both themes.
Not verified: page and line references, expert review, accounts.

**Home became an overview, and every screen gained a way onward.** Home was printing the whole
library under the subject index, so it read like one endless page. It now shows the masthead, the
subject index, at most three chapters in progress and three recent ones. All chapters live on their
subject page. Chapter numerals are the real position inside the subject, so a three row list cannot
relabel chapter nine as chapter one. A chapter now ends with the next chapter in its subject (or the
subject index), a subject page ends with the next subject, and the Library ends with what has not
been written yet.

**Five chapters added, numbered against the rationalised NCERT sequence.** Physics 8 (Mechanical
Properties of Solids) and 9 (Mechanical Properties of Fluids), Chemistry 3 (Classification of
Elements and Periodicity), Biology 3 (Plant Kingdom) and 4 (Animal Kingdom). The chapter numbers
and ordering were checked against the NCERT rationalised content list for Class 11, which is why
Physics Part I runs 1 to 7 and Part II 8 to 14. Content is now 24 chapters, 126 paragraphs and 375
words, still all draft and still without page or line claims.

Verified: content build 24 chapters, 0 errors; typecheck 0; lint 0; 49 unit tests; 23 e2e; build 0,
initial JS 113.06 kB gzip; 104 screenshots regenerated and reviewed at 360 and 1280.
