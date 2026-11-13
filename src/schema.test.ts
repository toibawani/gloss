import { describe, expect, it } from 'vitest'
import ch8 from './content/bio-11-ch8.json'
import { Chapter } from './schema'

const clone = () => structuredClone(ch8) as any

describe('schema', () => {
  it('accepts the sample chapter', () => {
    expect(Chapter.safeParse(ch8).success).toBe(true)
  })
  it('rejects an answer index outside the options', () => {
    const c = clone()
    c.paragraphs[0].recall[0].answer = 9
    expect(Chapter.safeParse(c).success).toBe(false)
  })
  it('rejects an unknown exam tag', () => {
    const c = clone()
    c.paragraphs[0].exam_tags = ['SAT']
    expect(Chapter.safeParse(c).success).toBe(false)
  })
  it('rejects a long key phrase so full NCERT text cannot be stored', () => {
    const c = clone()
    c.paragraphs[0].key_phrase = 'x'.repeat(81)
    expect(Chapter.safeParse(c).success).toBe(false)
  })
  it('rejects a paragraph without two recall questions', () => {
    const c = clone()
    c.paragraphs[0].recall.pop()
    expect(Chapter.safeParse(c).success).toBe(false)
  })
  it('keeps every sample paragraph as draft until an expert signs off', () => {
    expect(ch8.paragraphs.every((p) => p.review_status === 'draft')).toBe(true)
  })
})
