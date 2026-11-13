import { expect, test } from '@playwright/test'

test('a visited chapter reloads with no network', async ({ page, context }) => {
  await page.goto('/#/c/bio-11-ch8')
  await expect(page.locator('.phrase q')).toHaveText('basic structural and functional unit')
  await page.waitForFunction(() => Boolean(navigator.serviceWorker?.controller), undefined, { timeout: 15_000 })
  // Give the worker a moment to store the shell and the chapter chunk it was sent.
  await page.waitForFunction(
    async () => {
      const names = await caches.keys()
      if (names.length === 0) return false
      const cache = await caches.open(names[0])
      const keys = await cache.keys()
      // Wait for the chapter's own chunk, not any script: the shell's JS is cached before the
      // chapter bundle arrives, and reloading in between is not the case this test claims.
      return keys.some((r) => r.url.includes('bio-11-ch8')) && keys.some((r) => r.url.endsWith('/'))
    },
    undefined,
    { timeout: 15_000 },
  )

  await context.setOffline(true)
  await page.reload()
  await expect(page.getByRole('heading', { name: 'Cell: The Unit of Life' })).toBeVisible()
  await expect(page.locator('.phrase q')).toHaveText('basic structural and functional unit')
  await expect(page.getByText('Offline. Chapters you have opened still work.')).toBeVisible()
  await context.setOffline(false)
})

test('an unvisited chapter says so while offline', async ({ page, context }) => {
  await page.goto('/#/c/bio-11-ch8')
  await page.waitForFunction(() => Boolean(navigator.serviceWorker?.controller), undefined, { timeout: 15_000 })
  await context.setOffline(true)
  await page.goto('/#/c/bio-11-ch9')
  await expect(page.getByText(/not saved|did not load|offline/i).first()).toBeVisible()
  await context.setOffline(false)
})
