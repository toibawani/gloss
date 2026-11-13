#!/usr/bin/env node
// CLI wrapper around src/lint.ts. The rules live there so unit tests can call them directly.
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { Chapter } from '../src/schema.ts'
import { lintContent, summarize } from '../src/lint.ts'

const CONTENT = join(new URL('..', import.meta.url).pathname, 'src/content')
const chapters = []
let schemaErrors = 0

for (const file of readdirSync(CONTENT).filter((f) => f.endsWith('.json')).sort()) {
  const parsed = Chapter.safeParse(JSON.parse(readFileSync(join(CONTENT, file), 'utf8')))
  if (!parsed.success) {
    schemaErrors++
    for (const i of parsed.error.issues) {
      console.error(`error schema ${file}: ${i.path.join('.') || '(root)'}: ${i.message}`)
    }
  } else {
    chapters.push(parsed.data)
  }
}

const issues = lintContent(chapters)
for (const i of issues) {
  const line = `${i.level} ${i.code} ${i.where}: ${i.message}`
  if (i.level === 'error') console.error(line)
  else console.warn(line)
}
const { errors, warnings } = summarize(issues)
const paragraphs = chapters.reduce((n, c) => n + c.paragraphs.length, 0)
console.log(
  `content lint: ${chapters.length} chapters, ${paragraphs} paragraphs, ` +
    `${errors + schemaErrors} errors, ${warnings} warnings`,
)
process.exit(errors + schemaErrors > 0 ? 1 : 0)
