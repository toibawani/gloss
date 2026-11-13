import { loadChapter } from './content'
import { cacheForOffline } from './sw'

export function formatBytes(bytes: number | null): string {
  if (bytes === null || !Number.isFinite(bytes)) return 'unknown'
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} kB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

/** Fetches every chapter in the subject, then hands the used URLs to the service worker. */
export async function saveChaptersOffline(ids: string[]): Promise<{ ok: boolean; usage: number | null }> {
  for (const id of ids) {
    try {
      await loadChapter(id)
    } catch {
      // One missing chapter should not stop the rest from being saved.
    }
  }
  const urls = performance
    .getEntriesByType('resource')
    .map((e) => e.name)
    .filter((u) => u.startsWith(location.origin))
  const ok = await cacheForOffline([location.href, ...urls])
  const estimate = await navigator.storage?.estimate?.().catch(() => null)
  return { ok, usage: estimate?.usage ?? null }
}

export async function storageUsage(): Promise<number | null> {
  const estimate = await navigator.storage?.estimate?.().catch(() => null)
  return estimate?.usage ?? null
}
