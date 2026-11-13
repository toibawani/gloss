export const INTERVALS = [1, 3, 7, 21] as const

export type Card = { step: number; due: number }

/** step is the index of the interval just used. Wrong answers go back to step 0. */
export function nextCard(prev: Card | undefined, correct: boolean, now: number): Card {
  const step = correct && prev ? Math.min(prev.step + 1, INTERVALS.length - 1) : 0
  const d = new Date(now)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() + INTERVALS[step])
  return { step, due: d.getTime() }
}

export const isDue = (c: Card, now: number) => c.due <= now
