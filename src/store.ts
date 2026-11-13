import { z } from 'zod'
import type { Card } from './srs'

// One versioned state object. Reads are validated, writes are guarded, and a failed write is
// reported to the UI instead of disappearing. Local data is the only data Gloss has.

const KEY = 'gloss:v2:state'
const LEGACY = { prog: 'gloss:v1:progress', words: 'gloss:v1:words', srs: 'gloss:v1:srs' }
export const STATE_VERSION = 2
export const TRANSFER_VERSION = 1

const CardSchema = z.object({
  step: z.number().int().min(0).max(10),
  due: z.number().int().nonnegative().max(4102444800000),
  ch: z.string().max(80).optional(),
})

export const WordEntry = z.object({
  p: z.string().max(80),
  t: z.string().max(80),
  ch: z.string().max(80).optional(),
  ref: z.string().max(160).optional(),
  meaning: z.string().max(400).optional(),
  breakdown: z.string().max(400).optional(),
  trap: z.string().max(400).optional(),
  hi: z.string().max(80).optional(),
})
export type WordEntryT = z.infer<typeof WordEntry>

const Settings = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  textSize: z.enum(['sm', 'md', 'lg']),
  leading: z.enum(['tight', 'normal', 'loose']),
  goal: z.enum(['NEET', 'JEE', 'UPSC']),
})
export type SettingsT = z.infer<typeof Settings>

export const DEFAULT_SETTINGS: SettingsT = {
  theme: 'system',
  textSize: 'md',
  leading: 'normal',
  goal: 'NEET',
}

const State = z.object({
  version: z.literal(STATE_VERSION),
  progress: z.record(z.string().max(80), z.array(z.string().max(80)).max(2000)).default({}),
  words: z.array(WordEntry).max(5000).default([]),
  srs: z.record(z.string().max(120), CardSchema).default({}),
  settings: Settings.default(DEFAULT_SETTINGS),
})
type StateT = z.infer<typeof State>

export const ImportFile = z.object({
  app: z.literal('gloss'),
  version: z.number().int().min(1).max(TRANSFER_VERSION),
  exported_at: z.string().max(40),
  progress: State.shape.progress,
  words: State.shape.words,
  srs: State.shape.srs,
  settings: Settings.optional(),
})
export type ImportFileT = z.infer<typeof ImportFile>

const empty = (): StateT => ({
  version: STATE_VERSION,
  progress: {},
  words: [],
  srs: {},
  settings: { ...DEFAULT_SETTINGS },
})

let corrupted = false
let writeError: string | null = null
let storageBlocked = false

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    storageBlocked = true
    return null
  }
}

function safeSet(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value)
    return true
  } catch (e) {
    const name = e instanceof Error ? e.name : ''
    writeError =
      name === 'QuotaExceededError' || name === 'NS_ERROR_DOM_QUOTA_REACHED'
        ? 'Storage is full. Export your progress, then clear some browser data.'
        : 'This browser is blocking storage. Progress will not be saved.'
    return false
  }
}

function migrateLegacy(): StateT | null {
  const rawProg = safeGet(LEGACY.prog)
  const rawWords = safeGet(LEGACY.words)
  const rawSrs = safeGet(LEGACY.srs)
  if (!rawProg && !rawWords && !rawSrs) return null
  try {
    const parsed = State.safeParse({
      version: STATE_VERSION,
      progress: rawProg ? JSON.parse(rawProg) : {},
      words: rawWords ? JSON.parse(rawWords) : [],
      srs: rawSrs ? JSON.parse(rawSrs) : {},
      settings: DEFAULT_SETTINGS,
    })
    if (!parsed.success) return null
    safeSet(KEY, JSON.stringify(parsed.data))
    for (const k of Object.values(LEGACY)) {
      try {
        localStorage.removeItem(k)
      } catch {
        // Nothing to do; the migrated copy is already written.
      }
    }
    return parsed.data
  } catch {
    return null
  }
}

function read(): StateT {
  const raw = safeGet(KEY)
  if (raw) {
    try {
      const parsed = State.safeParse(JSON.parse(raw))
      if (parsed.success) return parsed.data
      corrupted = true
      return empty()
    } catch {
      corrupted = true
      return empty()
    }
  }
  return migrateLegacy() ?? empty()
}

function write(next: StateT): boolean {
  return safeSet(KEY, JSON.stringify(next))
}

export function getHealth() {
  return { corrupted, writeError, storageBlocked }
}

export function clearHealth() {
  writeError = null
  corrupted = false
}

export const getProgress = () => read().progress

export function markSeen(chapterId: string, paraId: string) {
  const s = read()
  const seen = new Set(s.progress[chapterId] ?? [])
  if (seen.has(paraId)) return
  seen.add(paraId)
  write({ ...s, progress: { ...s.progress, [chapterId]: [...seen] } })
}

export const getWords = () => read().words

export function addWord(paraId: string, term: string, snapshot?: Omit<WordEntryT, 'p' | 't'>) {
  const s = read()
  if (s.words.some((x) => x.p === paraId && x.t === term)) return
  if (s.words.length >= 5000) return
  write({ ...s, words: [...s.words, { p: paraId, t: term, ...snapshot }] })
}

export const getSrs = () => read().srs

export function saveCard(id: string, card: Card) {
  const s = read()
  write({ ...s, srs: { ...s.srs, [id]: { step: card.step, due: card.due, ...(card.ch ? { ch: card.ch } : {}) } } })
}

export const getSettings = (): SettingsT => read().settings

export function setSettings(patch: Partial<SettingsT>) {
  const s = read()
  const next = Settings.safeParse({ ...s.settings, ...patch })
  if (!next.success) return
  write({ ...s, settings: next.data })
}

export function clearAll() {
  const s = read()
  write({ ...empty(), settings: s.settings })
}

export function exportJSON(): string {
  const s = read()
  const file: ImportFileT = {
    app: 'gloss',
    version: TRANSFER_VERSION,
    exported_at: new Date().toISOString(),
    progress: s.progress,
    words: s.words,
    srs: s.srs,
    settings: s.settings,
  }
  return JSON.stringify(file, null, 2)
}

export type ImportResult =
  | { ok: true; progress: number; words: number; cards: number }
  | { ok: false; error: string }

/** Import files are untrusted. Parse, cap and merge; never trust a shape. */
export function importJSON(text: string, mode: 'merge' | 'replace'): ImportResult {
  if (text.length > 2_000_000) return { ok: false, error: 'That file is too large to be a Gloss backup.' }
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return { ok: false, error: 'That file is not valid JSON. Pick a Gloss backup file.' }
  }
  const parsed = ImportFile.safeParse(raw)
  if (!parsed.success) {
    return { ok: false, error: 'That file is not a Gloss backup, or it comes from a newer version.' }
  }
  const incoming = parsed.data
  const current = read()
  if (mode === 'replace') {
    const next: StateT = {
      version: STATE_VERSION,
      progress: incoming.progress,
      words: incoming.words,
      srs: incoming.srs,
      settings: incoming.settings ?? current.settings,
    }
    if (!write(next)) return { ok: false, error: writeError ?? 'The import could not be saved.' }
    return {
      ok: true,
      progress: Object.values(next.progress).reduce((n, v) => n + v.length, 0),
      words: next.words.length,
      cards: Object.keys(next.srs).length,
    }
  }
  const progress = { ...current.progress }
  for (const [ch, ids] of Object.entries(incoming.progress)) {
    progress[ch] = [...new Set([...(progress[ch] ?? []), ...ids])].slice(0, 2000)
  }
  const words = [...current.words]
  for (const w of incoming.words) {
    if (!words.some((x) => x.p === w.p && x.t === w.t) && words.length < 5000) words.push(w)
  }
  const srs = { ...current.srs }
  for (const [id, card] of Object.entries(incoming.srs)) {
    const old = srs[id]
    if (!old || card.step > old.step) srs[id] = card
  }
  const next: StateT = {
    version: STATE_VERSION,
    progress,
    words,
    srs,
    settings: incoming.settings ?? current.settings,
  }
  if (!write(next)) return { ok: false, error: writeError ?? 'The import could not be saved.' }
  return {
    ok: true,
    progress: Object.values(next.progress).reduce((n, v) => n + v.length, 0),
    words: next.words.length,
    cards: Object.keys(next.srs).length,
  }
}

/** Exposed for tests. */
export function __resetFlags() {
  corrupted = false
  writeError = null
  storageBlocked = false
}
