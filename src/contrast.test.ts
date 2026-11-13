import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { contrast, parseTokens, TEXT_PAIRS } from './contrast'

const css = readFileSync(new URL('./styles.css', import.meta.url), 'utf8')

describe('colour tokens', () => {
  it('keeps body text well above 7:1 in both themes', () => {
    const light = parseTokens(css, ':root {')
    const dark = parseTokens(css, ":root[data-theme='dark'] {")
    expect(contrast(light.ink, light.paper)).toBeGreaterThan(7)
    expect(contrast(dark.ink, dark.paper)).toBeGreaterThan(7)
  })

  it.each(['light', 'dark'] as const)('meets AA for every text pair in %s', (theme) => {
    const tokens = parseTokens(css, theme === 'light' ? ':root {' : ":root[data-theme='dark'] {")
    for (const [fg, bg] of TEXT_PAIRS) {
      expect(tokens[fg], `${fg} token`).toBeTruthy()
      expect(tokens[bg], `${bg} token`).toBeTruthy()
      expect(contrast(tokens[fg], tokens[bg]), `${fg} on ${bg}`).toBeGreaterThanOrEqual(4.5)
    }
  })

  it('never sets a pure white page background', () => {
    for (const theme of ['light', 'dark'] as const) {
      const tokens = parseTokens(css, theme === 'light' ? ':root {' : ":root[data-theme='dark'] {")
      expect(tokens.paper.toLowerCase()).not.toBe('#fff')
      expect(tokens.paper.toLowerCase()).not.toBe('#ffffff')
    }
  })
})
