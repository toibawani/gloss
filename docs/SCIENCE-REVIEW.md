# Science review

Gloss explains textbook paragraphs to students preparing for exams. A confident sentence in the
margin can be worse than no sentence at all, so the content is treated as a draft until a person
qualified in the subject has checked it.

## What the app claims

- Nothing. Every paragraph ships with `review_status: "draft"` and a `review_note`.
- The margin rail shows a "Draft, not expert checked" mark and a line telling the student to check
  the page and line against their own edition.
- The mark changes only when `review_status` becomes `expert_reviewed`. There is no self-service
  approval in the UI.

## State of the content at 0.2.0

| Chapter | Paragraphs | Reviewed | References verified |
| --- | --- | --- | --- |
| Class 11 Biology 8, Cell: The Unit of Life | 17 | 0 | No |
| Class 11 Biology 9, Biomolecules | 17 | 0 | No |

References carry the chapter and section (`ncert_ref`) but not page or line numbers: those depend
on the edition, and inventing them would be worse than leaving them out. `npm run content:verify`
prints SKIPPED until PDFs and `reference/editions.json` are supplied.

## How a paragraph becomes reviewed

1. Supply the exact edition as a PDF in `reference/` (gitignored) and describe it in
   `reference/editions.json`.
2. Run `npm run content:verify`. Fix whatever it reports; unresolved entries stay draft.
3. A subject expert reads the meaning, every tricky word, both recall answers, the exam lens and
   the hook, against that edition.
4. Record the reviewer, the date and the edition in the pull request and in `review_note`.
5. Only then set `review_status` to `expert_reviewed`, and run `npm run content:check`.

## Editorial rules the linter enforces

- No pasted textbook prose; the key phrase is capped at 80 characters.
- Two recall questions per paragraph, each with one correct answer.
- A review note on every draft paragraph.
- Exam references may not name a year that has not been verified; the linter rejects invented
  years.
- Hindi glosses use the Devanagari fallback font, not transliteration alone.

See `content/REVIEW.md` for the paragraph-level checklist.
