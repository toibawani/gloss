import { useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { chapterIndex, loadChapter, loadChapters } from './content'
import type { ChapterT } from './schema'

export function useHash() {
  const [h, setH] = useState(location.hash.slice(1) || '/')
  useEffect(() => {
    const read = () => location.hash.slice(1) || '/'
    const f = () => {
      // A short cross-fade between routes, only where the browser supports view transitions.
      // Reduced-motion users skip it because the transition paints nothing beyond the final frame.
      const vt = (document as Document & { startViewTransition?: (cb: () => void) => void }).startViewTransition
      if (vt && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
        vt.call(document, () => flushSync(() => setH(read())))
      } else {
        setH(read())
      }
    }
    addEventListener('hashchange', f)
    return () => removeEventListener('hashchange', f)
  }, [])
  return h
}

export function useOnline() {
  const [on, setOn] = useState(navigator.onLine)
  useEffect(() => {
    const a = () => setOn(true)
    const b = () => setOn(false)
    addEventListener('online', a)
    addEventListener('offline', b)
    return () => {
      removeEventListener('online', a)
      removeEventListener('offline', b)
    }
  }, [])
  return on
}

export type Loaded = { ch: ChapterT | null; error: 'missing' | 'offline' | 'invalid' | null; loading: boolean }

export function useChapter(id: string): Loaded {
  const [state, setState] = useState<Loaded>({ ch: null, error: null, loading: true })
  useEffect(() => {
    let live = true
    setState({ ch: null, error: null, loading: true })
    loadChapter(id)
      .then((ch) => live && setState({ ch, error: null, loading: false }))
      .catch((e: Error) => {
        if (!live) return
        const error = e.message === 'Chapter not found' ? 'missing' : navigator.onLine ? 'invalid' : 'offline'
        setState({ ch: null, error, loading: false })
      })
    return () => {
      live = false
    }
  }, [id])
  return state
}

/** Loads only the chapters that are actually needed. */
export function useChapters(ids: string[] | null) {
  const [all, setAll] = useState<Map<string, ChapterT> | null>(null)
  const key = ids ? ids.join(',') : ''
  const last = useRef('')
  useEffect(() => {
    if (!ids) return
    if (ids.length === 0) {
      setAll(new Map())
      return
    }
    let live = true
    if (last.current !== key) setAll(null)
    last.current = key
    loadChapters(ids).then((m) => live && setAll(m))
    return () => {
      live = false
    }
    // key represents the contents of ids
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  return all
}

export function useInstallPrompt() {
  const [event, setEvent] = useState<{ prompt: () => Promise<void> } | null>(null)
  useEffect(() => {
    const f = (e: Event) => {
      e.preventDefault()
      setEvent(e as unknown as { prompt: () => Promise<void> })
    }
    addEventListener('beforeinstallprompt', f)
    return () => removeEventListener('beforeinstallprompt', f)
  }, [])
  return {
    available: Boolean(event),
    install: async () => {
      await event?.prompt()
      setEvent(null)
    },
  }
}

export const allChapterIds = () => chapterIndex.map((c) => c.id)
