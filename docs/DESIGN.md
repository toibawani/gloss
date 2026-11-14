# Design

Gloss is an annotated book page. The reading experience is the product; everything else is
furniture that should get out of its way. The rules below are decisions, not options.

## Principles

1. **The page is the interface.** Reading text sits on paper, not in a box. Structure comes from
   space, hairlines and tonal bands. A border means "you can touch this".
2. **The margin is the product.** From 768px up, a paragraph and its notes share a baseline grid.
   The notes explain the line they sit beside. On a phone they collapse into markers that open a
   sheet, never a stack of cards under the paragraph.
3. **Hierarchy by scale, not by decoration.** One thing is big on every screen. Labels are small,
   rare and lowercase, not a uniform uppercase ribbon above every page.
4. **Color carries meaning.** Each subject owns one solid ink color, used for its covers, numerals,
   progress and diagram accents. Deep blue is reserved for actions and the brand mark. No color
   does two jobs. The page itself is a cool paper, not cream: cream reads as age, and this is a
   working notebook, not an antique.
5. **Density changes on purpose.** Reading is airy, lists are compact, settings are tight.
6. **Motion explains a change.** A paragraph slides in the direction you moved. A sheet rises. An
   answer reveals. Nothing fades in because it scrolled into view.

## Type

Self-hosted. No Inter, Geist or Space Grotesk.

| Role | Family | Size | Notes |
| --- | --- | --- | --- |
| Display, chapter titles | Newsreader 600 | `clamp(2rem, 7vw, 3.5rem)`, 1.05 | tracking `-0.03em` |
| Reading text | Newsreader 400 | 1.1875rem, 1.62 | max 34rem, optical size on |
| Margin text | Public Sans 400 | 0.8125rem, 1.55 | never below 13px |
| Labels | Public Sans 600 | 0.6875rem, tracking 0.09em | lowercase, only where a group needs a name |
| Numerals | Newsreader 600 | 2.5rem, tabular | subject color, chapter numbers |
| Hooks, student notes | Caveat 600 | 1.5rem | never for data |
| Hindi | Hind 400 | inherits | 1.95 line height, `lang="hi"` |

Modular scale: 11, 13, 15, 19, 24, 32, 44, 60. No size outside the scale.

## Motion

Motion answers a question the reader already has: where did the page go, and did my action
register. Durations are tokens, `--fast` 140ms for state and `--med` 280ms for a screen change,
with one easing curve, `cubic-bezier(0.22, 0.61, 0.36, 1)`. Everything below is cancelled under
`prefers-reduced-motion: reduce`.

| Movement | Job |
| --- | --- |
| Route change | hash navigation runs inside `document.startViewTransition`; the new screen cross-fades over 180ms and starts 4px lower, so the eye lands on the new title |
| Progress meter | the filled bar animates width on mount, so a saved count reads as an amount, not a number |
| Tab bar | a 2px accent bar slides under the active label, which is the only thing that moves in the shell |
| Chapter row hover | the cover plate lifts 2px and the numeral takes the subject ink; a ruled row, not a card |
| Answer reveal | the explanation opens with a 120ms height and opacity change, matching the click |
| Sheet | the native dialog rises 8px and fades, once |

Nothing animates on scroll. No parallax, no counters that tick for decoration, no looping motion
outside the 1.4s skeleton pulse.

## Color

One tonal system per subject, one paper.

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--paper` | `#f4f5f2` | `#0f1216` | page background |
| `--panel` | `#fbfcfa` | `#161a1f` | tonal band, sheet background |
| `--band` | `#e8ebe5` | `#1d232a` | quiet fill, cover plate |
| `--ink` | `#12161a` | `#e9edf1` | text |
| `--muted` | `#525c66` | `#a6b1bc` | secondary text, 5:1 minimum |
| `--rule` | `#d5dad3` | `#2c343d` | hairlines |
| `--accent` | `#0f4c81` | `#82b4e4` | actions, brand mark, focus |
| `--bio` | `#1f6a4d` | `#79c6a6` | biology |
| `--phy` | `#3a3f7a` | `#a3abee` | physics |
| `--chem` | `#9a3038` | `#e6a0a6` | chemistry |
| `--hist` | `#7a5a1e` | `#d9b978` | history, geography |

`scripts/check-contrast.mjs` checks every pairing in both themes and fails below AA. It runs in CI.

Subject color is always set on a container as `--subject`, and children use `var(--subject)`. It is
never used for body text on paper below 4.5:1.

## Space and grid

Space scale: 4, 8, 12, 16, 24, 32, 48, 72. Every margin and padding comes from it.

- Phone: 20px gutters, one column.
- Tablet from 768px: 32px gutters, reading column 34rem, margin column 16rem, gap 3rem.
- Desktop from 1120px: 72rem shell, same reading measure. The margin is aligned to the reading
  baseline, not to a card edge.

## Radius

One value: 3px, and only on things you can press (buttons, inputs, sheets). Text, images, rules and
diagram plates are square. Nothing else is rounded.

## Components

| Component | Shape | States |
| --- | --- | --- |
| Button primary | ink fill, paper text, 3px | hover deepens, focus ring 3px accent, disabled 45% |
| Button secondary | 1px rule, transparent | hover rule becomes ink |
| Text action | underlined, accent | hover underline thickness 2px |
| Field | underline only, 1px rule | focus ink underline 2px, error rule + message |
| Segmented control | rule under the group, selected is a 2px ink bar under the label | hover, focus, selected |
| Progress | 2px track, subject-filled bar, tabular count beside | any value, including 0 |
| Chapter row | ruled row, right aligned numeral, title, meta, progress hairline | hover band, focus ring |
| Subject index row | numeral, cover 56px, name, counts, progress, chevron | hover band, focus ring |
| Masthead | kicker, display title, four figure band, one note | static |
| Margin note | label + content, hairline above, no box | collapsible on phone |
| Sheet | native `<dialog>`, panel background, 3px top corners only | open, closing, offline |
| Toast | bottom band, ink background, one line, one action | auto-dismiss 6s |
| Empty state | drawn 64px mark + one sentence + one action | static |
| Skeleton | bars shaped like the real content, pulsing 1.4s | reduced motion: static |

Focus is always visible: 3px accent outline, 2px offset. Touch targets are 44px.

## Shell

Three layouts, one code path. The rail renders at every width but is hidden below 1000px, so
sections never appear twice.

| Width | Navigation | Content |
| --- | --- | --- |
| below 760px | top bar with brand and tools, fixed 5 item tab bar at the bottom | one column, 20px gutters |
| 760 to 999px | top bar with labelled sections | one column, 32px gutters |
| 1000px and up | fixed 15rem rail: brand, sections, subject counts, search, settings, version | body is offset by the rail, content centred in the remaining width |

The rail is a list of links, not a panel of widgets: no avatars, no counters that animate, no
collapse control. The active section carries a 2px accent bar on its left edge, the same mark the
phone tab bar uses underneath.

Home opens with a masthead: a lowercase kicker, the promise at display size, then four figures on
a shared baseline divided by hairlines. Below it the subject index is a ruled table, one row per
subject, with its drawn cover at 56px, chapter and paragraph counts, and progress. A three-tile
band was tried first and removed: three equal cards in a row is the shape every generated page
reaches for, and ruled rows say "index" more clearly.

Home is an overview, not the library. It shows the subjects, then at most three chapters in
progress and three that were written last, and stops. Every chapter lives on its subject page, and
the Library lists all of them. Chapter numerals are always the real position inside the subject, so
a partial list never labels chapter nine as one.

Every dead end gets a door. A chapter ends with the next chapter in the same subject, or the
subject index if it was the last. A subject page ends with the next subject, and the library ends
with what has not been written yet. Nothing asks the reader to go back to the top bar to continue.

Every chapter screen opens with a 2px rule in the subject's ink, then the back link, the title and
the count. The margin rail begins on the same baseline as the reading text.

## Diagrams

Content SVG is parsed and rebuilt from an allow-list. Classes are limited to semantic names; the
renderer maps them, so content can never name a raw or external style.

| Class | Meaning |
| --- | --- |
| `d-line` | structure stroke, 1.5 units, `currentColor` |
| `d-fill` | solid fill, subject color at 12% |
| `d-accent` | the one thing being pointed at, subject color |
| `d-label` | 9 unit label text, muted |
| `d-muted` | secondary structure, 1 unit, 45% ink |
| `d-guide` | leader line, 1 unit, dashed 3 2 |

Rules: one line weight per diagram, labels horizontal, no gradients, no shadows, no arrows except
one direction arrow per diagram, alt text that describes the relationship rather than the shapes.
Diagrams are drawn on a 320x200 grid and capped at 24rem so labels match body text.

## Copy

Sentence case. Verbs first. No "seamless", "unlock", "supercharge", "elevate". Errors say what
happened and the next action. Empty states name the thing that will appear. One call to action per
state. Never two buttons that mean the same thing.

## Bans

Gradients, pure white, shadows, glass, blur, glow, dot grids, Inter/Geist/Space Grotesk, italic
serif accents, emoji, three-card rows, bento, pill badges, pricing tiers, checkmark lists, colored
left-border stripes, fake UI, invented statistics, uniform soft corners, animation without a job.
