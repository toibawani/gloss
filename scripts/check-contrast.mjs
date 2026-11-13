#!/usr/bin/env node
// Fails if any text token pair falls below WCAG AA (4.5:1) in light or dark mode.
import { readFileSync } from 'node:fs'
import { contrast, parseTokens, TEXT_PAIRS } from '../src/contrast.ts'

const css = readFileSync(new URL('../src/styles.css', import.meta.url), 'utf8')

const themes = [
  ['light', parseTokens(css, ':root {')],
  ['dark', parseTokens(css, ":root[data-theme='dark'] {")],
]

let failed = 0
for (const [name, tokens] of themes) {
  const missing = TEXT_PAIRS.flat().filter((t) => !tokens[t])
  if (missing.length) {
    console.error(`${name}: missing tokens ${[...new Set(missing)].join(', ')}`)
    failed++
    continue
  }
  for (const [fg, bg] of TEXT_PAIRS) {
    const ratio = contrast(tokens[fg], tokens[bg])
    const ok = ratio >= 4.5
    if (!ok) failed++
    console.log(`${ok ? 'pass' : 'FAIL'} ${name.padEnd(5)} ${fg}/${bg}: ${ratio.toFixed(2)}:1`)
  }
}

if (failed) {
  console.error(`contrast: ${failed} pair(s) below 4.5:1`)
  process.exit(1)
}
console.log('contrast: every text token pair meets AA in light and dark')
