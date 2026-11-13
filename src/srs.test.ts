import { describe, expect, it } from 'vitest'
import { isDue, nextCard } from './srs'

const base = new Date(2026, 0, 10)
const t0 = new Date(2026, 0, 10, 15, 30).getTime()
const days = (c: { due: number }) => Math.round((c.due - base.getTime()) / 86_400_000)

describe('srs', () => {
  it('walks 1, 3, 7, 21 and holds at 21', () => {
    let c = nextCard(undefined, true, t0)
    const out = [days(c)]
    for (let i = 0; i < 4; i++) {
      c = nextCard(c, true, t0)
      out.push(days(c))
    }
    expect(out).toEqual([1, 3, 7, 21, 21])
  })
  it('sends a first wrong answer to 1 day', () => {
    expect(days(nextCard(undefined, false, t0))).toBe(1)
  })
  it('resets to 1 day after a wrong answer at a late step', () => {
    const late = { step: 3, due: t0 }
    const c = nextCard(late, false, t0)
    expect(c.step).toBe(0)
    expect(days(c)).toBe(1)
  })
  it('is due at the due time and not before', () => {
    const c = nextCard(undefined, true, t0)
    expect(isDue(c, c.due - 1)).toBe(false)
    expect(isDue(c, c.due)).toBe(true)
  })
})
