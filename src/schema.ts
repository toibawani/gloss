import { z } from 'zod'

// Content is data, not code. Every file is parsed through these schemas before use,
// and unknown keys are rejected so a typo cannot silently ship a broken paragraph.

export const EXAM_TAGS = ['NEET', 'JEE', 'UPSC'] as const
export const ExamTag = z.enum(EXAM_TAGS)

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'use YYYY-MM-DD')

export const Word = z
  .object({
    term: z.string().min(1).max(60),
    meaning: z.string().min(1).max(240),
    breakdown: z.string().min(1).max(240),
    trap: z.string().min(1).max(300),
    /** Devanagari term. Draft until a Hindi-medium reviewer signs it off. */
    hi: z.string().min(1).max(60).optional(),
  })
  .strict()

export const Recall = z
  .object({
    q: z.string().min(1).max(240),
    options: z.array(z.string().min(1).max(160)).min(2).max(6),
    answer: z.number().int().min(0),
    why: z.string().min(1).max(600),
  })
  .strict()
  .refine((r) => r.answer < r.options.length, { message: 'answer index out of range', path: ['answer'] })

const slug = z.string().regex(/^[a-z0-9-]+$/, 'lowercase letters, digits and hyphens only')

export const Paragraph = z
  .object({
    id: slug,
    /** Chapter and section. Page and line live in ref_page and ref_lines. */
    ncert_ref: z.string().min(1).max(120),
    /** Which printing the reference was checked against, once a human confirms it. */
    ncert_edition: z.string().min(1).max(80).optional(),
    /** Printed page number, not the PDF page. */
    ref_page: z.number().int().positive().optional(),
    ref_lines: z.string().min(1).max(40).optional(),
    /** True only after verify-refs found the key phrase on that page. */
    ref_verified: z.boolean().default(false),
    // Short on purpose. Full NCERT text must never be stored.
    key_phrase: z.string().min(1).max(80),
    meaning: z.string().min(1).max(600),
    words: z.array(Word).max(8),
    visual_svg: z.string().max(8000),
    visual_alt: z.string().min(1).max(300),
    hook: z.string().min(1).max(320),
    exam_tags: z.array(ExamTag).min(1),
    exam_note: z.string().min(1).max(600),
    /** Only for a named past-year question. Never invent one. */
    exam_source: z
      .object({ label: z.string().min(1).max(80), url: z.string().url().max(300) })
      .strict()
      .optional(),
    trap: z.string().min(1).max(400),
    recall: z.array(Recall).length(2),
    review_status: z.enum(['draft', 'expert_reviewed']),
    review_note: z.string().max(600).optional(),
    /** Set by a human reviewer, never by the author of the paragraph. */
    reviewed_by: z.string().min(1).max(80).optional(),
    reviewed_on: date.optional(),
  })
  .strict()
  .superRefine((p, ctx) => {
    if (p.review_status === 'expert_reviewed' && (!p.reviewed_by || !p.reviewed_on)) {
      ctx.addIssue({
        code: 'custom',
        path: ['review_status'],
        message: 'expert_reviewed needs reviewed_by and reviewed_on',
      })
    }
    if (p.ref_verified && (p.ref_page === undefined || !p.ref_lines || !p.ncert_edition)) {
      ctx.addIssue({
        code: 'custom',
        path: ['ref_verified'],
        message: 'ref_verified needs ncert_edition, ref_page and ref_lines',
      })
    }
    if (p.exam_source && p.exam_tags.length === 0) {
      ctx.addIssue({ code: 'custom', path: ['exam_source'], message: 'exam_source needs an exam tag' })
    }
  })

export const Chapter = z
  .object({
    id: slug,
    subject: z.string().min(1).max(40),
    class: z.number().int().min(1).max(12),
    title: z.string().min(1).max(120),
    book: z.string().min(1).max(80).optional(),
    ncert_edition: z.string().min(1).max(80).optional(),
    paragraphs: z.array(Paragraph).min(1),
  })
  .strict()

export type ChapterT = z.infer<typeof Chapter>
export type ParagraphT = z.infer<typeof Paragraph>
export type RecallT = z.infer<typeof Recall>
export type WordT = z.infer<typeof Word>
