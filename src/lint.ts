import type { ChapterT, ParagraphT } from './schema'

export type Issue = {
  level: 'error' | 'warn'
  code: string
  where: string
  message: string
}

/** Keep this in sync with src/Visual.tsx. Anything outside it is dropped at render. */
export const SVG_TAGS = new Set([
  'svg', 'g', 'path', 'circle', 'ellipse', 'rect', 'line', 'polyline', 'polygon', 'text', 'tspan',
])
export const SVG_ATTRS = new Set([
  'viewBox', 'd', 'cx', 'cy', 'r', 'rx', 'ry', 'x', 'y', 'x1', 'y1', 'x2', 'y2', 'width', 'height', 'points',
  'transform', 'fill', 'stroke', 'stroke-width', 'stroke-dasharray', 'stroke-linecap', 'stroke-linejoin',
  'text-anchor', 'font-size', 'opacity',
])

const BUZZWORDS = [
  'revolutionize', 'revolutionise', 'supercharge', 'seamless', 'seamlessly', 'game-changer',
  'game changer', 'unlock the', 'unleash', 'delve', 'tapestry', 'effortless', 'cutting-edge',
  'next-generation', 'empower', 'elevate your', 'dive into',
]
const EMOJI = /\p{Extended_Pictographic}/u
const EM_DASH = '\u2014'
const HEX_COLOUR = /#[0-9a-f]{3,8}\b/i
const NAMED_COLOUR =
  /\b(fill|stroke)\s*=\s*['"](?!none['"]|currentColor['"])([a-z]+|rgb\([^)]*\)|hsl\([^)]*\))/gi

/** Authorable prose fields. Schemas and ids are checked separately. */
export function proseFields(p: ParagraphT): [string, string][] {
  const out: [string, string][] = [
    ['key_phrase', p.key_phrase],
    ['meaning', p.meaning],
    ['hook', p.hook],
    ['exam_note', p.exam_note],
    ['trap', p.trap],
    ['visual_alt', p.visual_alt],
    ['review_note', p.review_note ?? ''],
  ]
  p.words.forEach((w, i) => {
    out.push([`words[${i}].term`, w.term], [`words[${i}].meaning`, w.meaning])
    out.push([`words[${i}].breakdown`, w.breakdown], [`words[${i}].trap`, w.trap])
    if (w.hi) out.push([`words[${i}].hi`, w.hi])
  })
  p.recall.forEach((r, i) => {
    out.push([`recall[${i}].q`, r.q], [`recall[${i}].why`, r.why])
    r.options.forEach((o, k) => out.push([`recall[${i}].options[${k}]`, o]))
  })
  return out
}

export function sentenceCount(text: string): number {
  const parts = text
    .replace(/([.!?])\s+/g, '$1\u0000')
    .split('\u0000')
    .map((s) => s.trim())
    .filter(Boolean)
  return parts.length
}

export function words(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean)
}

export function averageSentenceLength(text: string): number {
  const n = sentenceCount(text)
  if (n === 0) return 0
  return words(text).length / n
}

/** Every (tag, attribute) pair used by an SVG string, in document order. */
export function svgParts(svg: string): { tags: string[]; attrs: string[] } {
  const tags: string[] = []
  const attrs: string[] = []
  // Only look inside tags. Text nodes may contain words like "stack = granum".
  for (const m of svg.matchAll(/<\s*\/?\s*([a-zA-Z][\w:-]*)([^>]*)>/g)) {
    tags.push(m[1])
    for (const a of m[2].matchAll(/\s([a-zA-Z][\w:-]*)\s*=/g)) attrs.push(a[1])
  }
  return { tags, attrs }
}

export function lintSvg(svg: string): Issue[] {
  const out: Issue[] = []
  const add = (code: string, message: string) => out.push({ level: 'error', code, where: 'visual_svg', message })
  if (!svg.trim()) return [{ level: 'error', code: 'svg-empty', where: 'visual_svg', message: 'no diagram' }]
  if (/<\s*script/i.test(svg)) add('svg-script', 'script tag is never allowed')
  if (/<\s*foreignObject/i.test(svg)) add('svg-foreign-object', 'foreignObject is never allowed')
  if (/\son[a-z]+\s*=/i.test(svg)) add('svg-event-attr', 'event handler attribute found')
  if (/\s(href|xlink:href|src)\s*=/i.test(svg)) add('svg-link', 'href or src is never allowed')
  if (/url\s*\(/i.test(svg)) add('svg-url', 'url() reference found')
  if (/javascript:|data:/i.test(svg)) add('svg-scheme', 'javascript: or data: found')
  if (/\sstyle\s*=/i.test(svg)) add('svg-style', 'inline style is never allowed')
  const { tags, attrs } = svgParts(svg)
  for (const t of tags) if (!SVG_TAGS.has(t)) add('svg-tag', `tag <${t}> is outside the allow-list`)
  for (const a of attrs) if (!SVG_ATTRS.has(a)) add('svg-attr', `attribute ${a} is outside the allow-list`)
  if (!/viewBox\s*=\s*['"]0 0 \d+ \d+['"]/.test(svg)) add('svg-viewbox', 'viewBox must start at 0 0')
  if (!/currentColor/.test(svg)) add('svg-colour', 'diagram never uses currentColor')
  if (HEX_COLOUR.test(svg)) add('svg-hex', 'hard-coded hex colour found')
  for (const m of svg.matchAll(NAMED_COLOUR)) {
    add('svg-named-colour', `fixed colour ${m[1]}="${m[2]}" found; use currentColor or none`)
  }
  const sizes = Array.from(svg.matchAll(/font-size\s*=\s*['"](\d+(?:\.\d+)?)/g)).map((m) => Number(m[1]))
  const tooSmall = sizes.filter((s) => s < 10)
  if (tooSmall.length) add('svg-font-size', `text below 10px: ${tooSmall.join(', ')}`)
  return out
}

export function lintParagraph(p: ParagraphT, where = p.id): Issue[] {
  const out: Issue[] = []
  const add = (level: Issue['level'], code: string, message: string, field?: string) =>
    out.push({ level, code, where: field ? `${where}:${field}` : where, message })

  if (p.key_phrase.length > 80) add('error', 'phrase-long', `${p.key_phrase.length} characters, limit 80`, 'key_phrase')
  if (words(p.key_phrase).length > 12) add('warn', 'phrase-words', 'key_phrase is long enough to be a quotation', 'key_phrase')

  for (const [field, text] of proseFields(p)) {
    if (text.includes(EM_DASH)) add('error', 'em-dash', 'em dash in copy', field)
    if (EMOJI.test(text)) add('error', 'emoji', 'emoji in copy', field)
    for (const b of BUZZWORDS) {
      if (text.toLowerCase().includes(b)) add('error', 'buzzword', `"${b}" is on the banned list`, field)
    }
    if (/it['\u2019]s not .{1,60}, it['\u2019]s /i.test(text)) {
      add('error', 'not-x-but-y', 'banned "not X, it is Y" construction', field)
    }
  }

  const sentences = sentenceCount(p.meaning)
  if (sentences < 2 || sentences > 3) {
    add('error', 'meaning-length', `${sentences} sentences; meaning must be 2 or 3`, 'meaning')
  }
  const avg = averageSentenceLength(p.meaning)
  if (avg > 22) add('warn', 'reading-level', `average sentence ${avg.toFixed(1)} words; aim for 22 or fewer`, 'meaning')
  if (/\b(e\.g\.|i\.e\.|etc\.|vs\.)/i.test(p.meaning)) {
    add('warn', 'abbreviation', 'abbreviation confuses the sentence counter; spell it out', 'meaning')
  }
  if (words(p.meaning).length > 110) add('warn', 'meaning-words', 'meaning is getting long', 'meaning')

  const seenTerms = new Set<string>()
  p.words.forEach((w) => {
    const key = w.term.trim().toLowerCase()
    if (seenTerms.has(key)) add('error', 'duplicate-word', `"${w.term}" appears twice`, `words`)
    seenTerms.add(key)
    if (!w.breakdown.trim() || !w.trap.trim()) add('error', 'word-incomplete', `"${w.term}" needs breakdown and trap`, 'words')
  })

  p.recall.forEach((r, i) => {
    const opts = r.options.map((o) => o.trim().toLowerCase().replace(/\s+/g, ' '))
    if (new Set(opts).size !== opts.length) add('error', 'duplicate-option', 'two identical options', `recall[${i}]`)
    if (r.answer < 0 || r.answer >= r.options.length) add('error', 'answer-range', 'answer outside options', `recall[${i}]`)
    if (!r.why.trim()) add('error', 'no-why', 'why is empty', `recall[${i}]`)
    if (r.why.length <= 40) add('warn', 'why-short', 'why should explain the right and the main wrong option', `recall[${i}]`)
    if (/\b(all of the above|none of the above)\b/i.test(r.options.join(' '))) {
      add('warn', 'meta-option', 'all/none of the above tests test-taking, not understanding', `recall[${i}]`)
    }
  })

  out.push(...lintSvg(p.visual_svg))

  if (!p.review_note && p.review_status === 'draft') {
    add('error', 'no-review-note', 'a draft must say what the expert has to check', 'review_note')
  }
  if (p.review_status === 'draft' && p.reviewed_by) {
    add('warn', 'draft-with-reviewer', 'reviewed_by is set while still draft', 'reviewed_by')
  }
  if (!p.ref_verified) {
    const note = (p.review_note ?? '').toLowerCase()
    if (!note.includes('verify page and line')) {
      add('error', 'ref-note', 'unverified page and line must be named in review_note using the words "verify page and line"')
    }
  }
  if (p.ref_verified && !(p.ncert_edition && p.ref_page && p.ref_lines)) {
    add('error', 'ref-incomplete', 'verified reference needs edition, page and line')
  }
  if (p.exam_source && !/19|20\d{2}/.test(p.exam_note)) {
    add('warn', 'source-unused', 'exam_source set but exam_note names no year', 'exam_source')
  }
  if (/\b(19|20)\d{2}\b/.test(p.exam_note) && !p.exam_source) {
    add('error', 'invented-paper', 'a year in exam_note needs a verifiable exam_source', 'exam_note')
  }
  return out
}

export function lintContent(chapters: ChapterT[]): Issue[] {
  const out: Issue[] = []
  const chapterIds = new Set<string>()
  const paragraphIds = new Set<string>()
  for (const ch of chapters) {
    if (chapterIds.has(ch.id)) {
      out.push({ level: 'error', code: 'duplicate-chapter', where: ch.id, message: 'chapter id repeated' })
    }
    chapterIds.add(ch.id)
    for (const p of ch.paragraphs) {
      if (paragraphIds.has(p.id)) {
        out.push({ level: 'error', code: 'duplicate-paragraph', where: p.id, message: 'paragraph id used in two chapters' })
      }
      paragraphIds.add(p.id)
      out.push(...lintParagraph(p, `${ch.id}/${p.id}`))
    }
  }
  return out
}

export function summarize(issues: Issue[]) {
  return {
    errors: issues.filter((i) => i.level === 'error').length,
    warnings: issues.filter((i) => i.level === 'warn').length,
  }
}
