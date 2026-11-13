import { z } from 'zod'

export const Word = z.object({
  term: z.string().min(1),
  meaning: z.string().min(1),
  breakdown: z.string().min(1),
  trap: z.string().min(1),
})

export const Recall = z
  .object({
    q: z.string().min(1),
    options: z.array(z.string().min(1)).min(2).max(6),
    answer: z.number().int().min(0),
    why: z.string().min(1),
  })
  .refine((r) => r.answer < r.options.length, { message: 'answer out of range' })

const slug = z.string().regex(/^[a-z0-9-]+$/)

export const Paragraph = z.object({
  id: slug,
  ncert_ref: z.string().min(1).max(120),
  // Short on purpose. Full NCERT text must never be stored.
  key_phrase: z.string().min(1).max(80),
  meaning: z.string().min(1).max(600),
  words: z.array(Word),
  visual_svg: z.string().max(8000),
  visual_alt: z.string().min(1).max(300),
  hook: z.string().min(1),
  exam_tags: z.array(z.enum(['NEET', 'JEE', 'UPSC'])).min(1),
  exam_note: z.string().min(1),
  trap: z.string().min(1),
  recall: z.array(Recall).length(2),
  review_status: z.enum(['draft', 'expert_reviewed']),
  review_note: z.string().optional(),
})

export const Chapter = z.object({
  id: slug,
  subject: z.string().min(1),
  class: z.number().int().min(1).max(12),
  title: z.string().min(1),
  paragraphs: z.array(Paragraph).min(1),
})

export type ChapterT = z.infer<typeof Chapter>
export type ParagraphT = z.infer<typeof Paragraph>
export type RecallT = z.infer<typeof Recall>
