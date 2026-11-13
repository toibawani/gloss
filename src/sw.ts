import { useSyncExternalStore } from 'react'

// The new worker waits until the student taps reload, so a half-written chapter is never
// swapped under them. Only same-origin GET responses are cached by the worker itself.

let waiting: ServiceWorker | null = null
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())
let reloading = false
let userAppliedUpdate = false

export function initServiceWorker() {
  if (!('serviceWorker' in navigator) || !import.meta.env.PROD) return
  navigator.serviceWorker
    .register('./sw.js')
    .then((reg) => {
      if (reg.waiting) {
        waiting = reg.waiting
        emit()
      }
      reg.addEventListener('updatefound', () => {
        const worker = reg.installing
        worker?.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) {
            waiting = worker
            emit()
          }
        })
      })
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        // The first install also claims this page. Reloading there would throw away the
        // student's scroll position for no reason, so only reload after an explicit tap.
        if (!userAppliedUpdate || reloading) return
        reloading = true
        location.reload()
      })
      // Cache the shell that this first visit actually used. On a first visit the page is
      // claimed a moment after ready resolves, so message the active worker directly.
      navigator.serviceWorker.ready.then((ready) => {
        const urls = performance
          .getEntriesByType('resource')
          .map((e) => e.name)
          .filter((u) => u.startsWith(location.origin) && /\.(js|css|woff2|png|webmanifest)$/.test(u))
        const target = navigator.serviceWorker.controller ?? ready.active
        target?.postMessage({ type: 'CACHE_URLS', urls: [location.href, ...urls] })
      })
      setInterval(() => void reg.update().catch(() => {}), 60 * 60 * 1000)
    })
    .catch(() => {
      // No service worker means no offline mode. The app still works while online.
    })
}

export function applyUpdate() {
  userAppliedUpdate = true
  waiting?.postMessage({ type: 'SKIP_WAITING' })
  waiting = null
  emit()
}

export function dismissUpdate() {
  waiting = null
  emit()
}

export function useUpdateReady(): boolean {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn)
      return () => listeners.delete(fn)
    },
    () => waiting !== null,
    () => false,
  )
}

export async function cacheForOffline(urls: string[]) {
  const reg = await navigator.serviceWorker.ready.catch(() => null)
  if (!reg) return false
  const target = navigator.serviceWorker.controller ?? reg.active
  target?.postMessage({ type: 'CACHE_URLS', urls })
  return Boolean(target)
}
