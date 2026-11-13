export const INTERVALS = [1, 3, 7, 21] as const

export type Card = { step: number; due: number; ch?: string }

/** Local midnight for a timestamp. Reviews are scheduled by calendar day, not by 24h blocks. */
export function startOfDay(now: number): number {
  const d = new Date(now)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

/** step is the index of the interval just used. Wrong answers go back to step 0. */
export function nextCard(prev: Card | undefined, correct: boolean, now: number): Card {
  const step = correct && prev ? Math.min(prev.step + 1, INTERVALS.length - 1) : 0
  const d = new Date(startOfDay(now))
  d.setDate(d.getDate() + INTERVALS[step])
  return { step, due: d.getTime(), ...(prev?.ch ? { ch: prev.ch } : {}) }
}

export const isDue = (c: Card, now: number) => c.due <= now

/**
 * A device clock can be wrong, and storage can be edited by hand. Anything that is not a
 * real timestamp near the present is thrown away rather than trusted.
 */
export function usableCard(c: Card | undefined, now: number): Card | null {
  if (!c) return null
  if (!Number.isFinite(c.due) || c.due <= 0) return null
  const tenYears = 10 * 365 * 86_400_000
  if (Math.abs(c.due - now) > tenYears) return null
  const step = Number.isInteger(c.step) ? Math.min(Math.max(c.step, 0), INTERVALS.length - 1) : 0
  return { ...c, step }
}
