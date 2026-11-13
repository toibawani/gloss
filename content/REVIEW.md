# Reviewing Gloss content

Every paragraph ships as `draft`. Only a human subject expert can change that. Gloss the app,
and Gloss the author, never set `expert_reviewed`.

## What the expert checks

Open the paragraph in your own copy of the book and work through this list.

1. **Fact** Every statement in `meaning`, `hook`, `exam_note`, `trap` and `why` is correct for
   the syllabus. A catchy mnemonic that teaches something false is a defect, not a shortcut.
2. **Page and line** The paragraph opens with `Ch 8, section 8.2 Cell Theory` and no page
   number. Set `ref_page` and `ref_lines` from your printing, then run `npm run content:verify`
   with the PDF in `reference/`. The script must find `key_phrase` on that printed page.
3. **Phrase** `key_phrase` is a short phrase that appears on that page, not a sentence.
4. **Answers** Each recall question has exactly one defensible answer, and every distractor is
   a real misconception rather than filler. Read the `why`: it must say why the right answer is
   right and why the main wrong option is wrong.
5. **Exam lens** `exam_note` describes patterns only. If it names a specific paper or year,
   `exam_source` must carry a verifiable link. Years without a source are a lint error.
6. **Hindi** Any `hi` field is a draft Devanagari term. A Hindi-medium reviewer checks it
   separately; `lang="hi"` is applied by the app, not stored in the text.
7. **Diagram** The SVG teaches the exact point of confusion named in `trap`, reads at 360px, and
   `visual_alt` describes the idea rather than the shapes.

## Recording a review

In the paragraph, set:

```json
"review_status": "expert_reviewed",
"reviewed_by": "Initials or name",
"reviewed_on": "2026-11-30",
"ref_verified": true,
"ncert_edition": "NCERT Class XI Biology, 2023-24 reprint",
"ref_page": 128,
"ref_lines": "lines 4-9"
```

Then remove `review_note` or leave it as a note about what changed. Add one line to
`content/REVIEW-LOG.md` under the date, naming the chapter, the reviewer and the paragraphs
cleared. The schema rejects `expert_reviewed` without a reviewer and a date.

## Editions

Chapter numbering and page numbers differ between printings and between the pre-2023 and
current editions. Tell the maintainer which edition and printing you own before reviewing. The
value goes in `ncert_edition` on the chapter and on every verified paragraph.

## Reference PDFs

Put PDFs in `reference/`, which is gitignored and must never be committed. Create
`reference/editions.json`:

```json
{ "bio-11-ch8": { "pdf": "class11-biology.pdf", "page_offset": 18 } }
```

`page_offset` is the PDF page number minus the printed page number, measured once per file.
Run `npm run content:verify`. Without a PDF the script reports SKIPPED and every paragraph
stays draft; that is expected, not a pass.
