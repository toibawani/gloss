#!/usr/bin/env node
// Verifies every page/line reference against a locally supplied NCERT PDF and checks that no
// authored field repeats eight words of source text. Reference PDFs are never committed.
//
//   reference/editions.json
//   { "bio-11-ch8": { "pdf": "class11-biology.pdf", "page_offset": 18 } }
//
// page_offset = PDF page number minus printed page number, found once per file.
//
// Usage: node scripts/verify-refs.mjs [--require]
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { Chapter } from '../src/schema.ts'

const ROOT = new URL('..', import.meta.url).pathname
const CONTENT = join(ROOT, 'src/content')
const REF = join(ROOT, 'reference')
const REQUIRE = process.argv.includes('--require')

const chapters = readdirSync(CONTENT)
  .filter((f) => f.endsWith('.json'))
  .map((f) => Chapter.safeParse(JSON.parse(readFileSync(join(CONTENT, f), 'utf8'))))
  .filter((r) => r.success)
  .map((r) => r.data)

const hasPdftotext = (() => {
  try {
    execFileSync('pdftotext', ['-v'], { stdio: 'ignore' })
    return true
  } catch {
    return false
  }
})()

const configPath = join(REF, 'editions.json')
const config = existsSync(configPath) ? JSON.parse(readFileSync(configPath, 'utf8')) : {}

if (!hasPdftotext || Object.keys(config).length === 0) {
  console.log('verify-refs: SKIPPED, no reference PDF toolchain configured')
  if (!hasPdftotext) console.log('  pdftotext is not installed (brew install poppler)')
  if (!Object.keys(config).length) console.log(`  ${configPath} is missing or empty`)
  console.log('  Paragraphs without ref_verified stay draft and must be checked by the subject expert.')
  if (REQUIRE) {
    console.error('verify-refs: --require was set, so this is a failure')
    process.exit(1)
  }
  process.exit(0)
}

const norm = (s) =>
  s
    .toLowerCase()
    .replace(/\u00ad/g, '')
    .replace(/-\s*\n\s*/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()

const pageText = (pdf, page) => {
  try {
    return execFileSync('pdftotext', ['-f', String(page), '-l', String(page), '-layout', pdf, '-'], {
      encoding: 'utf8',
    })
  } catch {
    return ''
  }
}

let failures = 0
const fail = (msg) => {
  failures++
  console.error('  FAIL ' + msg)
}

for (const ch of chapters) {
  const cfg = config[ch.id]
  if (!cfg) {
    console.log(`${ch.id}: no edition configured, ${ch.paragraphs.length} paragraphs stay draft`)
    continue
  }
  const pdf = join(REF, cfg.pdf)
  if (!existsSync(pdf)) {
    fail(`${ch.id}: reference PDF ${cfg.pdf} is missing`)
    continue
  }
  const offset = Number(cfg.page_offset ?? 0)
  let checked = 0
  for (const p of ch.paragraphs) {
    if (p.ref_page === undefined) {
      console.log(`  ${p.id}: no printed page recorded, cannot verify`)
      continue
    }
    const text = pageText(pdf, p.ref_page + offset)
    const lines = text.split('\n')
    const target = norm(p.key_phrase)
    const found = lines.findIndex((line) => norm(line).includes(target))
    if (found === -1) {
      fail(`${ch.id}/${p.id}: key phrase "${p.key_phrase}" not found on printed page ${p.ref_page}`)
    } else {
      checked++
      console.log(`  ${p.id}: page ${p.ref_page}, line ${found + 1}`)
    }
  }
  console.log(`${ch.id}: ${checked} of ${ch.paragraphs.length} references found in ${cfg.pdf}`)
}

// Originality: no eight-word run may appear in the source PDF. This is the copyright guard.
let overlapChecked = 0
for (const ch of chapters) {
  const cfg = config[ch.id]
  if (!cfg || !existsSync(join(REF, cfg.pdf))) continue
  let full = ''
  try {
    full = execFileSync('pdftotext', ['-layout', join(REF, cfg.pdf), '-'], { encoding: 'utf8' })
  } catch {
    continue
  }
  const source = ' ' + norm(full) + ' '
  const fields = (p) => [
    ['meaning', p.meaning],
    ['hook', p.hook],
    ['exam_note', p.exam_note],
    ['trap', p.trap],
    ...p.recall.map((r, i) => [`recall[${i}].why`, r.why]),
  ]
  for (const p of ch.paragraphs) {
    for (const [name, text] of fields(p)) {
      const w = norm(text).split(' ').filter(Boolean)
      for (let i = 0; i + 8 <= w.length; i++) {
        const run = w.slice(i, i + 8).join(' ')
        if (source.includes(' ' + run + ' ')) {
          fail(`${ch.id}/${p.id}:${name} repeats 8 words from the book: "${run}"`)
          break
        }
      }
      overlapChecked++
    }
  }
}
console.log(`overlap check: ${overlapChecked} fields compared against source text`)

if (failures) {
  console.error(`verify-refs: ${failures} failure(s)`)
  process.exit(1)
}
console.log('verify-refs: all configured references and overlap checks passed')
