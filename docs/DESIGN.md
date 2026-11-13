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
   progress and diagram accents. Rust is reserved for actions and the brand mark. No color does
   two jobs.
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

## Color

One tonal system per subject, one paper.

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--paper` | `#f4eee0` | `#15120d` | page background |
| `--panel` | `#fbf7ec` | `#1d1912` | tonal band, sheet background |
| `--ink` | `#1f1a14` | `#f2e9d6` | text |
| `--muted` | `#5c5142` | `#c3b49a` | secondary text, 5.1:1 minimum |
| `--rule` | `#d6c9ae` | `#3f372a` | hairlines |
| `--accent` | `#8a3b1e` | `#f0b58d` | actions, brand mark, focus |
| `--bio` | `#2e4a34` | `#8fbb96` | biology |
| `--phy` | `#26405f` | `#94b6dd` | physics |
| `--chem` | `#8a3b24` | `#e7a184` | chemistry |
| `--hist` | `#7a5a1e` | `#d8b979` | history, geography |

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
| Chapter row | ruled row, numeral, title, meta, progress hairline | hover band, focus ring |
| Margin note | label + content, hairline above, no box | collapsible on phone |
| Sheet | native `<dialog>`, panel background, 3px top corners only | open, closing, offline |
| Toast | bottom band, ink background, one line, one action | auto-dismiss 6s |
| Empty state | drawn 64px mark + one sentence + one action | static |
| Skeleton | bars shaped like the real content, pulsing 1.4s | reduced motion: static |

Focus is always visible: 3px accent outline, 2px offset. Touch targets are 44px.

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
