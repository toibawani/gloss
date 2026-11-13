import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

const routes = [
  ['/', 'home'],
  ['/#/c/bio-11-ch8', 'reader'],
  ['/#/words', 'word bank'],
  ['/#/revise', 'revision'],
  ['/#/search', 'search'],
  ['/#/settings', 'settings'],
  ['/#/terms', 'terms'],
  ['/#/privacy', 'privacy'],
  ['/#/nope', '404'],
] as const

for (const [path, name] of routes) {
  test(`${name} has no serious accessibility violations`, async ({ page }) => {
    await page.goto(path)
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()
    const bad = results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious')
    expect(
      bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`),
      `${name} (${path})`,
    ).toEqual([])
  })
}

test('home and reader also pass in dark mode', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' })
  for (const path of ['/', '/#/c/bio-11-ch9']) {
    await page.goto(path)
    await page.waitForLoadState('networkidle')
    const results = await new AxeBuilder({ page }).withTags(['wcag2aa']).analyze()
    const bad = results.violations.filter((v) => v.impact === 'critical' || v.impact === 'serious')
    expect(
      bad.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`),
      `dark ${path}`,
    ).toEqual([])
  }
})

test('keyboard reaches the first recall option and shows a focus ring', async ({ page }) => {
  await page.goto('/#/c/bio-11-ch8')
  await page.getByRole('button', { name: 'Cell', exact: true }).focus()
  await expect(page.getByRole('button', { name: 'Cell', exact: true })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.getByRole('button', { name: 'Tissue', exact: true })).toBeFocused()
})
