import { beforeEach, describe, expect, it } from 'vitest'
import * as store from './store'

const mem = new Map<string, string>()
let failWrites = false

beforeEach(() => {
  mem.clear()
  failWrites = false
  store.__resetFlags()
  ;(globalThis as any).localStorage = {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => {
      if (failWrites) {
        const e = new Error('full')
        e.name = 'QuotaExceededError'
        throw e
      }
      mem.set(k, v)
    },
    removeItem: (k: string) => void mem.delete(k),
  }
})

describe('store', () => {
  it('persists progress and ignores repeats', () => {
    store.markSeen('c1', 'p1')
    store.markSeen('c1', 'p1')
    store.markSeen('c1', 'p2')
    expect(store.getProgress()).toEqual({ c1: ['p1', 'p2'] })
  })

  it('saves each opened word once, with its note', () => {
    store.addWord('p1', 'cell')
    store.addWord('p1', 'cell', { meaning: 'second write is ignored' })
    expect(store.getWords()).toEqual([{ p: 'p1', t: 'cell' }])
    store.addWord('p2', 'nucleoid', { meaning: 'DNA region', ch: 'c1' })
    expect(store.getWords()[1]).toMatchObject({ t: 'nucleoid', ch: 'c1' })
  })

  it('round-trips a review card', () => {
    store.saveCard('p1#0', { step: 1, due: 123, ch: 'c1' })
    expect(store.getSrs()['p1#0']).toEqual({ step: 1, due: 123, ch: 'c1' })
  })

  it('falls back to empty on corrupted JSON', () => {
    mem.set('gloss:v2:state', '{not json')
    expect(store.getSrs()).toEqual({})
    expect(store.getHealth().corrupted).toBe(true)
  })

  it('falls back to empty on the wrong shape', () => {
    mem.set('gloss:v2:state', JSON.stringify({ version: 2, words: { a: 1 } }))
    expect(store.getWords()).toEqual([])
  })

  it('migrates v1 keys once and removes them', () => {
    mem.set('gloss:v1:progress', JSON.stringify({ c1: ['p1'] }))
    mem.set('gloss:v1:words', JSON.stringify([{ p: 'p1', t: 'cell' }]))
    mem.set('gloss:v1:srs', JSON.stringify({ 'p1#0': { step: 1, due: 500 } }))
    expect(store.getProgress()).toEqual({ c1: ['p1'] })
    expect(store.getWords()).toEqual([{ p: 'p1', t: 'cell' }])
    expect(store.getSrs()['p1#0']).toEqual({ step: 1, due: 500 })
    expect(mem.has('gloss:v1:progress')).toBe(false)
    expect(mem.has('gloss:v2:state')).toBe(true)
  })

  it('reports a full quota instead of silently dropping progress', () => {
    failWrites = true
    store.markSeen('c1', 'p1')
    expect(store.getHealth().writeError).toMatch(/Storage is full/)
  })

  it('exports a versioned file and merges it back', () => {
    store.markSeen('c1', 'p1')
    store.saveCard('p1#0', { step: 2, due: Date.now() + 86_400_000, ch: 'c1' })
    const file = store.exportJSON()
    const parsed = JSON.parse(file)
    expect(parsed).toMatchObject({ app: 'gloss', version: 1 })
    expect(parsed.words).toEqual([])

    mem.clear()
    const res = store.importJSON(file, 'replace')
    expect(res.ok).toBe(true)
    expect(store.getProgress()).toEqual({ c1: ['p1'] })
    expect(store.getSrs()['p1#0'].step).toBe(2)
  })

  it('refuses files that are not Gloss backups', () => {
    expect(store.importJSON('{"app":"other"}', 'merge').ok).toBe(false)
    expect(store.importJSON('not json', 'merge').ok).toBe(false)
    expect(store.importJSON(JSON.stringify({ app: 'gloss', version: 99 }), 'merge').ok).toBe(false)
  })

  it('rejects a card with an impossible due date', () => {
    const file = {
      app: 'gloss',
      version: 1,
      exported_at: '2026-01-01',
      progress: {},
      words: [],
      srs: { 'p#0': { step: 0, due: -5 } },
    }
    expect(store.importJSON(JSON.stringify(file), 'merge').ok).toBe(false)
  })

  it('clears progress but keeps settings', () => {
    store.markSeen('c1', 'p1')
    store.setSettings({ theme: 'dark' })
    store.clearAll()
    expect(store.getProgress()).toEqual({})
    expect(store.getSettings().theme).toBe('dark')
  })
})
