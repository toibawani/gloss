#!/usr/bin/env node
// Captures docs/screens/*.png at 360, 390, 768 and 1280 in light and dark, plus the two
// manifest screenshots. Starts its own preview server against dist/.
import { spawn } from 'node:child_process'
import { existsSync, mkdirSync } from 'node:fs'
import { chromium } from '@playwright/test'

const ROOT = new URL('..', import.meta.url).pathname
const PORT = 4173
const BASE = `http://127.0.0.1:${PORT}`

if (!existsSync(`${ROOT}dist/index.html`)) {
  console.error('dist/ is missing. Run npm run build first.')
  process.exit(1)
}
mkdirSync(`${ROOT}docs/screens`, { recursive: true })

const server = spawn('npx', ['vite', 'preview', '--host', '127.0.0.1', '--port', String(PORT), '--strictPort'], {
  cwd: ROOT,
  stdio: 'ignore',
})

const ready = async () => {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`${BASE}/`)
      if (res.ok) return true
    } catch {
      // keep waiting
    }
    await new Promise((r) => setTimeout(r, 250))
  }
  return false
}

// Every screen, including the ones a reviewer would otherwise never open.
const pages = [
  ['home', '/'],
  ['reader', '/#/c/bio-11-ch8/cell-theory'],
  ['reader-visual', '/#/c/bio-11-ch8/what-is-a-cell'],
  ['reader-physics', '/#/c/phy-11-ch1/si-base-units'],
  ['library', '/#/library'],
  ['words', '/#/words'],
  ['revise', '/#/revise'],
  ['search', '/#/search'],
  ['settings', '/#/settings'],
  ['terms', '/#/terms'],
  ['privacy', '/#/privacy'],
  ['notfound', '/#/nope'],
  ['styleguide', '/#/styleguide'],
]

try {
  if (!(await ready())) throw new Error('preview server did not start')
  const browser = await chromium.launch()
  for (const width of [360, 390, 768, 1280]) {
    for (const theme of ['light', 'dark']) {
      const context = await browser.newContext({
        viewport: { width, height: width < 500 ? 780 : 900 },
        colorScheme: theme,
        reducedMotion: 'reduce',
      })
      const page = await context.newPage()
      for (const [name, path] of pages) {
        await page.goto(BASE + path)
        await page.waitForLoadState('networkidle')
        await page.waitForTimeout(200)
        await page.screenshot({ path: `${ROOT}docs/screens/${name}-${width}-${theme}.png`, fullPage: false })
      }
      await context.close()
    }
  }

  const mobile = await browser.newContext({ viewport: { width: 360, height: 640 }, deviceScaleFactor: 1.5 })
  const mp = await mobile.newPage()
  await mp.goto(`${BASE}/#/c/bio-11-ch8/cell-theory`)
  await mp.waitForLoadState('networkidle')
  await mp.screenshot({ path: `${ROOT}public/screenshot-mobile.png` })
  await mobile.close()

  const wide = await browser.newContext({ viewport: { width: 1280, height: 720 } })
  const wp = await wide.newPage()
  await wp.goto(`${BASE}/#/c/bio-11-ch9/protein-structure`)
  await wp.waitForLoadState('networkidle')
  await wp.screenshot({ path: `${ROOT}public/screenshot-wide.png` })
  await wide.close()

  await browser.close()
  console.log(`screenshots written: ${pages.length * 8} screen captures plus 2 manifest images`)
} finally {
  server.kill('SIGTERM')
}
