# Design audit, 0.2.0

Taken from `docs/screens/` at 360, 390, 768 and 1280 in light and dark. Every claim below points at
a file I opened, not at code I read.

## The verdict

The app reads as a form with boxes. It has a good palette and a good idea (margin notes beside a
paragraph) and then flattens both with uniform rectangles, one label style and one accent color.
Most of the "AI look" comes from four decisions repeated everywhere: 1.5px borders, a 3px radius,
an uppercase eyebrow with a 24px rule, and a 1rem gap.

## What is actually wrong

| # | Tell | Where I saw it |
| --- | --- | --- |
| 1 | Every list item is a bordered box of identical weight: chapter rows, saved words, search results, review questions, the sample card | `home-360-light.png`, `words-360-light.png`, `search-390-dark.png` |
| 2 | The same uppercase eyebrow sits above every page, always with the same rust rule: CLASS 11 BIOLOGY, WORD BANK, REVISION, SEARCH, SETTINGS | `home-360-light.png`, `words-360-light.png`, `revise-360-light.png`, `search-390-dark.png` |
| 3 | One narrow left column with even gaps and no scale contrast. At 1280 the hero is two 42px lines and the right half of the page is empty | `home-1280-light.png` |
| 4 | The progress bar is a full-width rule that looks like a text underline and is invisible at 0 percent | `home-360-light.png` |
| 5 | Empty states are a bordered box with a sentence and a generic "Open a chapter" button, identical on two different screens | `words-360-light.png`, `revise-360-light.png` |
| 6 | Search is one boxed input on an otherwise empty page, with a floating instruction underneath | `search-390-dark.png` |
| 7 | The 404 is a small box pinned to the top left with 60 percent empty paper below it | `notfound-360-light.png` |
| 8 | Navigation is five unlabeled icons at 360; the active state is a thin box; the settings glyph reads as a plus in a box | `home-360-light.png`, `settings-768-light.png` |
| 9 | One rust accent does every job: links, brand dot, progress, hooks, underlines, focus. No subject has an identity | every screenshot |
| 10 | The brand is the word "Gloss" plus a 6px dot. There is no mark and the favicon is unrelated | `home-360-light.png` |
| 11 | Settings is a stack of full-width black-filled segmented boxes that look like a form in a dashboard | `settings-768-light.png` |
| 12 | The type scale is timid: 42px h1, 20px h2, 15px body. Little contrast between levels, so nothing leads | `home-1280-light.png` |
| 13 | Diagrams sit inside a bordered panel inset in the card, so a drawing reads as a text box | `reader-1280-light.png` |
| 14 | The footer repeats a legal sentence on every screen and takes 120px at 360 | `words-360-light.png`, `revise-360-light.png` |
| 15 | Copy is pleasant but generic and repeated: "Make the page yours", "Find a line", "Open a chapter" twice | `settings-768-light.png`, `words-360-light.png` |

## What is worth keeping

- The paper and ink palette, and the warm dark mode. Both were measured for contrast and pass.
- Newsreader. It has the character the product needs; it was simply used too small and too evenly.
- The margin rail itself. Placing reference, words and hook beside the paragraph is the product's
  one real idea; it needs to stop looking like a sidebar of boxes.
- Hairline rules, tabular numerals, the handwriting hook, the tiny visual language of the diagrams.
- The service worker and the reading flow. Nothing here is a design problem.

## Fixes, in the order they will land

1. Type and color first: a real display scale, subject ink colors, hairline rules instead of borders,
   and one reserved accent for actions only.
2. Structure: lists become ruled rows and tonal bands, not cards. Reading text sits on the page.
   The margin rail becomes a true margin with a baseline, opened as a sheet on phones.
3. Identity: a drawn wordmark and app mark, subject covers from hand-built SVG, chapter numerals in
   subject color.
4. Components: underline inputs, custom segmented control, custom progress, native dialog sheets,
   toasts, and empty states drawn rather than boxed.
5. Density: airy reading, compact lists, tight settings. Deliberate differences, not one gap.
6. Then the screenshots again, twice, and this file gets a second pass with what still bothers me.

## After the first pass

Second look at the same 88 screenshots.

Fixed:

- Boxes are gone from lists, settings and empty states. Chapter rows are ruled rows with a
  48px subject-colored numeral, progress is a 2px subject bar, and the count sits beside it.
- The uppercase ribbon is gone from Words, Revision, Search and Settings. Only the subject line on
  Home still carries a rule, and it carries the subject color.
- Display type is now `clamp(2rem, 7vw, 3.75rem)`. The Home h1 is the biggest thing on the page at
  every width, which it was not before.
- Empty states are drawn marks (`empty-art`), one sentence, one action, and the action differs by
  screen instead of saying "Open a chapter" twice.
- The pager buttons were solid black blocks; they are quiet outline buttons now.
- Settings controls are underline tabs, not black-filled dashboard boxes.
- The wordmark and mark are drawn SVG; the settings glyph no longer reads as a plus.
- Diagram classes exist and are themed (`d-line`, `d-fill`, `d-accent`, `d-label`, `d-muted`,
  `d-guide`), so a diagram can point at one thing in the subject color.

Still bothers me, and is scheduled for the next branches:

1. Home is still one column at 1280. The hero leaves the right half empty. The landing and shell
   branch should put the working demo in that space.
2. Navigation is still a top row of icons on a phone. The brief asks for a bottom tab bar and a
   desktop rail; that is shell work, not a token change.
3. The reader's progress is a 1px rule that reads as a divider. A segmented tick bar would carry
   the position better.
4. Settings at 1280 is a 36rem column with 60 percent empty paper. Two columns would suit it.
5. The styleguide's first swatch (paper) is invisible against the page, which makes the row look
   broken even though it is correct.
6. Chapter rows have no chapter identity beyond the numeral. A drawn subject cover belongs on the
   Library screen.

## Honest limits of this audit

Screenshots were taken with `prefers-reduced-motion` and no hover or focus state. I did not review
the app on a real phone, with a screen reader, or at 200 percent browser zoom. Those are still open.
