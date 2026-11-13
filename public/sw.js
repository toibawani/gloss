const C = 'gloss-v1'
self.addEventListener('install', (e) => {
  self.skipWaiting()
  e.waitUntil(caches.open(C).then((c) => c.addAll(['./'])))
})
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== C).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  )
})
// The page sends the URLs it loaded so the first visit is fully available offline.
self.addEventListener('message', (e) => {
  const urls = (Array.isArray(e.data) ? e.data : []).filter((u) => typeof u === 'string' && u.startsWith(self.location.origin))
  e.waitUntil(caches.open(C).then((c) => c.addAll(urls)).catch(() => {}))
})
self.addEventListener('fetch', (e) => {
  const r = e.request
  if (r.method !== 'GET' || new URL(r.url).origin !== self.location.origin) return
  e.respondWith(
    caches.open(C).then(async (c) => {
      const hit = await c.match(r)
      const net = fetch(r).then((res) => { if (res.ok) c.put(r, res.clone()); return res }).catch(() => hit)
      return hit || net
    }),
  )
})
