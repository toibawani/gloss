#!/usr/bin/env node
// Generates src/generated/content-index.json and search-index.json from src/content/*.json.
// Fails on any schema or lint error. No bundler involved, so content can grow to thousands
// of paragraphs while the initial JS stays flat.
import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { gzipSync } from 'node:zlib'
import { Chapter } from '../src/schema.ts'
import { lintContent, summarize } from '../src/lint.ts'

const ROOT = new URL('..', import.meta.url).pathname
const CONTENT = join(ROOT, 'src/content')
const OUT = join(ROOT, 'src/generated')
const CHECK = process.argv.includes('--check')

const files = readdirSync(CONTENT).filter((f) => f.endsWith('.json')).sort()
const chapters = []
const errors = []

for (const file of files) {
  let raw
  try {
    raw = JSON.parse(readFileSync(join(CONTENT, file), 'utf8'))
  } catch (e) {
    errors.push(`${file}: not valid JSON (${e.message})`)
    continue
  }
  const parsed = Chapter.safeParse(raw)
  if (!parsed.success) {
    for (const i of parsed.error.issues) {
      errors.push(`${file}: ${i.path.join('.') || '(root)'}: ${i.message}`)
    }
    continue
  }
  chapters.push({ file, chapter: parsed.data })
}

if (errors.length) {
  console.error(`content build failed: ${errors.length} schema error(s)`)
  for (const e of errors) console.error('  ' + e)
  process.exit(1)
}

const issues = lintContent(chapters.map((c) => c.chapter))
const { errors: lintErrors, warnings } = summarize(issues)
for (const i of issues) {
  const line = `${i.level === 'error' ? 'error' : 'warn '} ${i.code} ${i.where}: ${i.message}`
  if (i.level === 'error') console.error('  ' + line)
}
if (warnings) console.warn(`${warnings} content warning(s)`)
if (lintErrors) {
  console.error(`content build failed: ${lintErrors} lint error(s)`)
  process.exit(1)
}

chapters.sort(
  (a, b) =>
    a.chapter.class - b.chapter.class ||
    a.chapter.subject.localeCompare(b.chapter.subject) ||
    a.chapter.id.localeCompare(b.chapter.id),
)

const index = {
  version: 1,
  chapters: chapters.map(({ file, chapter }) => ({
    id: chapter.id,
    file,
    subject: chapter.subject,
    class: chapter.class,
    title: chapter.title,
    book: chapter.book ?? null,
    paragraphs: chapter.paragraphs.length,
    words: chapter.paragraphs.reduce((n, p) => n + p.words.length, 0),
    first: chapter.paragraphs[0]?.id ?? null,
  })),
}

// Search text is capped per paragraph so the index stays a few bytes per word, not a copy
// of the content. Full text is only fetched when a chapter is opened.
const search = {
  version: 1,
  entries: chapters.flatMap(({ chapter }) =>
    chapter.paragraphs.map((p) => ({
      c: chapter.id,
      p: p.id,
      t: chapter.title,
      k: p.key_phrase,
      w: p.words.map((x) => x.term),
      s: p.meaning.slice(0, 140),
    })),
  ),
}

mkdirSync(OUT, { recursive: true })
const write = (name, data) => {
  const json = JSON.stringify(data)
  const path = join(OUT, name)
  if (CHECK) {
    if (!existsSync(path)) {
      console.error(`content build stale: ${name} is missing. Run npm run content:build`)
      process.exit(1)
    }
    if (readFileSync(path, 'utf8') !== json + '\n') {
      console.error(`content build stale: ${name} does not match src/content. Run npm run content:build`)
      process.exit(1)
    }
    return json
  }
  writeFileSync(path, json + '\n')
  return json
}

const indexJson = write('content-index.json', index)
const searchJson = write('search-index.json', search)

const kb = (s) => (gzipSync(s).length / 1024).toFixed(1)
console.log(
  `content ${CHECK ? 'up to date' : 'built'}: ${index.chapters.length} chapters, ` +
    `${search.entries.length} paragraphs, ${index.chapters.reduce((n, c) => n + c.words, 0)} words`,
)
console.log(`  content-index.json ${(indexJson.length / 1024).toFixed(1)} kB raw, ${kb(indexJson)} kB gzip`)
console.log(`  search-index.json  ${(searchJson.length / 1024).toFixed(1)} kB raw, ${kb(searchJson)} kB gzip (lazy)`)

// Budgets guard the "initial JS stays small" promise. The search index is fetched on demand.
if (Number(kb(searchJson)) > 120) {
  console.error('search index over 120 kB gzip; trim snippets or split it per subject')
  process.exit(1)
}
