import { expect, test } from '@playwright/test'

test('opens a chapter, taps a word and answers a question', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'Every paragraph, with a margin note.' })).toBeVisible()

  // Home lists subjects; the chapters live on the subject page.
  await page.goto('/#/s/Biology')
  await page.getByRole('link', { name: /Cell: The Unit of Life/ }).click()
  await expect(page.getByRole('heading', { name: 'Cell: The Unit of Life' })).toBeVisible()
  await expect(page.locator('.phrase q')).toHaveText('basic structural and functional unit')

  const word = page.getByRole('button', { name: 'cell', exact: true })
  await word.click()
  await expect(word).toHaveAttribute('aria-expanded', 'true')
  await expect(page.getByText('Latin cella = small room')).toBeVisible()

  await page.getByRole('button', { name: 'Cell', exact: true }).click()
  await expect(page.getByText('Right.', { exact: false })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Answer' })).toBeVisible()
})

test('keeps progress and opened words on this device', async ({ page }) => {
  await page.goto('/#/c/bio-11-ch8/prokaryotic-cell')
  await page.getByRole('button', { name: 'nucleoid', exact: true }).click()
  await page.goto('/#/words')
  await expect(page.getByRole('heading', { name: 'Words you opened' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'nucleoid' })).toBeVisible()
  await page.goto('/#/s/Biology')
  await expect(page.getByRole('link', { name: /Cell: The Unit of Life/ })).toContainText('1 read')
})

test('deep links to a paragraph and moves with the arrow keys', async ({ page }) => {
  await page.goto('/#/c/bio-11-ch9/protein-structure')
  await expect(page.locator('.phrase q')).toHaveText('quaternary structure')
  await page.keyboard.press('ArrowRight')
  await expect(page.locator('.phrase q')).toHaveText('denaturation')
})

test('shows a 404 for an unknown route', async ({ page }) => {
  await page.goto('/#/nope')
  await expect(page.getByRole('heading', { name: 'This page does not exist' })).toBeVisible()
  await page.getByRole('link', { name: 'Go to Home' }).click()
  await expect(page.getByRole('heading', { name: 'Every paragraph, with a margin note.' })).toBeVisible()
})
