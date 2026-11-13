import { beforeEach, describe, expect, it } from 'vitest'
import * as store from './store'

const mem = new Map<string, string>()
beforeEach(() => {
  mem.clear()
  ;(globalThis as any).localStorage = {
    getItem: (k: string) => mem.get(k) ?? null,
    setItem: (k: string, v: string) => void mem.set(k, v),
  }
})

describe('store', () => {
  it('persists progress and ignores repeats', () => {
    store.markSeen('c1', 'p1')
    store.markSeen('c1', 'p1')
    store.markSeen('c1', 'p2')
    expect(store.getProgress()).toEqual({ c1: ['p1', 'p2'] })
  })
  it('saves each opened word once', () => {
    store.addWord('p1', 'cell')
    store.addWord('p1', 'cell')
    expect(store.getWords()).toEqual([{ p: 'p1', t: 'cell' }])
  })
  it('round-trips a review card', () => {
    store.saveCard('p1#0', { step: 1, due: 123 })
    expect(store.getSrs()['p1#0']).toEqual({ step: 1, due: 123 })
  })
  it('falls back to empty on corrupted JSON', () => {
    mem.set('gloss:v1:srs', '{not json')
    expect(store.getSrs()).toEqual({})
  })
  it('falls back to empty on the wrong shape', () => {
    mem.set('gloss:v1:words', JSON.stringify({ a: 1 }))
    expect(store.getWords()).toEqual([])
  })
})
