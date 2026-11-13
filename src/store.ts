import { z } from 'zod'
import type { Card } from './srs'

const KEY = { prog: 'gloss:v1:progress', words: 'gloss:v1:words', srs: 'gloss:v1:srs' }
const Prog = z.record(z.string(), z.array(z.string()))
const Words = z.array(z.object({ p: z.string(), t: z.string() }))
const Srs = z.record(z.string(), z.object({ step: z.number().int().min(0), due: z.number() }))

// Stored data is untrusted too: validate it, and fall back to empty on any problem.
function read<T>(key: string, schema: z.ZodType<T>, fallback: T): T {
  try {
    const s = localStorage.getItem(key)
    if (!s) return fallback
    const r = schema.safeParse(JSON.parse(s))
    return r.success ? r.data : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Storage full or blocked. The app keeps working, progress just will not persist.
  }
}

export const getProgress = () => read<Record<string, string[]>>(KEY.prog, Prog, {})
export function markSeen(chapterId: string, paraId: string) {
  const g = getProgress()
  const seen = new Set(g[chapterId] ?? [])
  if (seen.has(paraId)) return
  seen.add(paraId)
  write(KEY.prog, { ...g, [chapterId]: [...seen] })
}

export const getWords = () => read<{ p: string; t: string }[]>(KEY.words, Words, [])
export function addWord(paraId: string, term: string) {
  const w = getWords()
  if (w.some((x) => x.p === paraId && x.t === term)) return
  write(KEY.words, [...w, { p: paraId, t: term }])
}

export const getSrs = () => read<Record<string, Card>>(KEY.srs, Srs, {})
export function saveCard(id: string, card: Card) {
  write(KEY.srs, { ...getSrs(), [id]: card })
}
