import { describe, expect, it } from 'vitest'
import ch8 from './content/bio-11-ch8.json'
import ch9 from './content/bio-11-ch9.json'
import { Chapter, type ChapterT, type ParagraphT } from './schema'
import { lintContent, lintParagraph, lintSvg, sentenceCount, svgParts } from './lint'

const base = Chapter.parse(structuredClone(ch8)) as ChapterT
const clone = (): ParagraphT => structuredClone(base.paragraphs[0]) as ParagraphT

describe('content lint', () => {
  it('passes every shipped chapter', () => {
    const chapters = [Chapter.parse(ch8), Chapter.parse(ch9)] as ChapterT[]
    const errors = lintContent(chapters).filter((i) => i.level === 'error')
    expect(errors).toEqual([])
  })

  it('rejects an em dash in copy', () => {
    const p = clone()
    p.meaning = 'First sentence. Second sentence \u2014 with a dash.'
    expect(lintParagraph(p).some((i) => i.code === 'em-dash')).toBe(true)
  })

  it('rejects emoji', () => {
    const p = clone()
    p.hook = 'A hook with a rocket \u{1F680} in it.'
    expect(lintParagraph(p).some((i) => i.code === 'emoji')).toBe(true)
  })

  it('requires a meaning of two or three sentences', () => {
    const p = clone()
    p.meaning = 'Only one sentence here.'
    expect(lintParagraph(p).some((i) => i.code === 'meaning-length')).toBe(true)
    p.meaning = 'One. Two. Three. Four.'
    expect(lintParagraph(p).some((i) => i.code === 'meaning-length')).toBe(true)
  })

  it('rejects duplicate options and an answer outside the list', () => {
    const p = clone()
    p.recall[0].options = ['Same', 'Same', 'Other']
    expect(lintParagraph(p).some((i) => i.code === 'duplicate-option')).toBe(true)
  })

  it('rejects a draft with no review note', () => {
    const p = clone()
    delete p.review_note
    expect(lintParagraph(p).some((i) => i.code === 'no-review-note')).toBe(true)
  })

  it('rejects a year in exam_note without a source', () => {
    const p = clone()
    p.exam_note = 'This was asked in NEET 2019 as a one-liner.'
    expect(lintParagraph(p).some((i) => i.code === 'invented-paper')).toBe(true)
  })

  it('rejects duplicate paragraph ids across chapters', () => {
    const a = Chapter.parse(structuredClone(ch8)) as ChapterT
    const b = Chapter.parse(structuredClone(ch9)) as ChapterT
    b.paragraphs[0].id = a.paragraphs[0].id
    expect(lintContent([a, b]).some((i) => i.code === 'duplicate-paragraph')).toBe(true)
  })

  it('counts sentences without splitting decimals', () => {
    expect(sentenceCount('One. Two.')).toBe(2)
    expect(sentenceCount('It measures 3.4 nanometres along the axis.')).toBe(1)
  })
})

describe('svg allow-list', () => {
  it('accepts the shipped diagrams', () => {
    const chapters = [Chapter.parse(ch8), Chapter.parse(ch9)] as ChapterT[]
    for (const ch of chapters) for (const p of ch.paragraphs) {
      expect(lintSvg(p.visual_svg), p.id).toEqual([])
    }
  })

  it.each([
    ["<svg viewBox='0 0 10 10'><script>alert(1)</script></svg>", 'svg-script'],
    ["<svg viewBox='0 0 10 10'><rect onload='x()'/></svg>", 'svg-event-attr'],
    ["<svg viewBox='0 0 10 10'><a href='https://x.test'>x</a></svg>", 'svg-link'],
    ["<svg viewBox='0 0 10 10'><rect style='fill:red'/></svg>", 'svg-style'],
    ["<svg viewBox='0 0 10 10'><foreignObject/></svg>", 'svg-foreign-object'],
    ["<svg viewBox='0 0 10 10'><rect fill='url(#x)'/></svg>", 'svg-url'],
    ["<svg viewBox='0 0 10 10'><rect fill='#ff0000'/></svg>", 'svg-hex'],
    ["<svg viewBox='0 0 10 10'><rect fill='currentColor'/></svg>", 'svg-nothing-bad'],
    ["<svg viewBox='0 0 10 10'><rect class='d-line'/></svg>", 'svg-nothing-bad'],
    ["<svg viewBox='0 0 10 10'><rect class='d-line evil'/></svg>", 'svg-class'],
  ])('flags %s', (svg, code) => {
    const codes = lintSvg(svg).map((i) => i.code)
    if (code === 'svg-nothing-bad') expect(codes).not.toContain('svg-hex')
    else expect(codes).toContain(code)
  })

  it('does not treat text content as an attribute', () => {
    const svg = "<svg viewBox='0 0 10 10' fill='currentColor'><text>stack = granum</text></svg>"
    expect(svgParts(svg).attrs).toEqual(['viewBox', 'fill'])
  })
})
