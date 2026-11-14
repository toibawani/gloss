import { expect, test } from '@playwright/test'

test('exports a backup, clears data and imports it again', async ({ page }) => {
  await page.goto('/#/c/bio-11-ch8')
  await page.getByRole('button', { name: 'Cell', exact: true }).click()
  await page.getByRole('link', { name: 'Settings' }).click()

  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export a backup' }).click()
  const file = await download
  const path = await file.path()
  expect(path).toBeTruthy()

  await page.getByRole('button', { name: 'Clear all progress' }).click()
  await page.getByRole('button', { name: 'Tap again to clear everything' }).click()
  await expect(page.getByText('Progress cleared. Settings were kept.')).toBeVisible()

  await page.locator('#import-file').setInputFiles(path!)
  await expect(page.getByText(/Imported\./)).toBeVisible()

  await page.goto('/#/s/Biology/cell-structure-and-function')
  await expect(page.getByRole('link', { name: /Cell: The Unit of Life/ })).toContainText('1 read')
})

test('rejects a file that is not a Gloss backup', async ({ page }) => {
  await page.goto('/#/settings')
  await page.locator('#import-file').setInputFiles({
    name: 'notes.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{"hello":"world"}'),
  })
  await expect(page.getByText('That file is not a Gloss backup, or it comes from a newer version.')).toBeVisible()
})

test('theme, text size and goal survive a reload', async ({ page }) => {
  await page.goto('/#/settings')
  await page.getByText('Dark', { exact: true }).click()
  await page.getByText('Large', { exact: true }).click()
  await page.getByText('UPSC', { exact: true }).click()
  await page.reload()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark')
  await expect(page.locator('html')).toHaveAttribute('data-text-size', 'lg')
  await page.goto('/#/c/bio-11-ch8')
  await expect(page.getByRole('heading', { name: 'Cell: The Unit of Life' })).toBeVisible()
})
