// Gloss service worker. Same-origin GET only, ok responses only, versioned cache, explicit updates.
// Bump VERSION whenever this file changes so old caches are dropped.
const VERSION = 'gloss-v4'
const SHELL = './'
const PRECACHE = ['./', './index.html', './manifest.webmanifest']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((cache) => cache.addAll(PRECACHE)).catch(() => undefined))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(keys.filter((key) => key !== VERSION).map((key) => caches.delete(key)))
      await self.clients.claim()
    })(),
  )
})

const cacheable = (request, response) => {
  if (!response || !response.ok) return false
  if (response.type !== 'basic') return false
  return new URL(request.url).origin === self.location.origin
}

self.addEventListener('message', (event) => {
  const data = event.data
  if (!data || typeof data !== 'object') return

  if (data.type === 'SKIP_WAITING') {
    self.skipWaiting()
    return
  }

  if (data.type === 'CACHE_URLS' && Array.isArray(data.urls)) {
    const urls = [...new Set(data.urls)]
      .filter((url) => typeof url === 'string')
      .map((url) => {
        try {
          return new URL(url, self.location.href)
        } catch {
          return null
        }
      })
      .filter((url) => url && url.origin === self.location.origin)
      .map((url) => url.href)
      .slice(0, 200)

    event.waitUntil(
      caches.open(VERSION).then(async (cache) => {
        await Promise.all(
          urls.map(async (url) => {
            try {
              const response = await fetch(url, { credentials: 'same-origin' })
              if (response.ok && response.type === 'basic') await cache.put(url, response)
            } catch {
              // A failed pre-cache leaves that URL to the runtime handler.
            }
          }),
        )
      }),
    )
  }
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET') return

  let url
  try {
    url = new URL(request.url)
  } catch {
    return
  }
  if (url.origin !== self.location.origin) return
  if (url.pathname.endsWith('/sw.js')) return
  if (request.headers.has('range')) return

  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const response = await fetch(request)
          if (response.ok && response.type === 'basic') {
            const cache = await caches.open(VERSION)
            await cache.put(SHELL, response.clone())
          }
          return response
        } catch {
          const cache = await caches.open(VERSION)
          return (await cache.match(SHELL)) ?? (await cache.match(request)) ?? Response.error()
        }
      })(),
    )
    return
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(VERSION)
      const hit = await cache.match(request)
      if (hit) {
        // Hashed assets never change, so a hit is safe to return and refresh quietly.
        fetch(request)
          .then((response) => {
            if (cacheable(request, response)) cache.put(request, response.clone())
          })
          .catch(() => undefined)
        return hit
      }
      try {
        const response = await fetch(request)
        if (cacheable(request, response)) {
          const copy = response.clone()
          await cache.put(request, copy)
        }
        return response
      } catch {
        return Response.error()
      }
    })(),
  )
})
