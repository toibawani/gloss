import { expect, test } from '@playwright/test'

const DAY = 24 * 60 * 60 * 1000

test('a question answered today comes due tomorrow, not before', async ({ page }) => {
  const start = new Date('2026-01-10T10:00:00')
  await page.clock.install({ time: start })
  await page.goto('/#/c/bio-11-ch8')
  await page.getByRole('button', { name: 'Cell', exact: true }).click()
  await expect(page.getByText('Right.', { exact: false })).toBeVisible()

  await page.getByRole('link', { name: 'Revise' }).click()
  await expect(page.getByRole('heading', { name: 'Nothing due' })).toBeVisible()

  await page.clock.setFixedTime(new Date(start.getTime() + DAY))
  await page.getByRole('link', { name: 'Home' }).click()
  await page.getByRole('link', { name: 'Revise' }).click()
  await expect(page.getByRole('heading', { name: /1 question today/ })).toBeVisible()
  await expect(page.getByText('Which level of organisation is the basic structural and functional unit of life?')).toBeVisible()
})

test('a wrong answer resets the card to one day', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-01-10T10:00:00') })
  await page.goto('/#/c/bio-11-ch8')
  await page.getByRole('button', { name: 'Tissue', exact: true }).click()
  await expect(page.getByText('Not quite.', { exact: false })).toBeVisible()
  await page.goto('/#/revise')
  await expect(page.getByRole('heading', { name: 'Nothing due' })).toBeVisible()
})

test('revision screen explains an empty day', async ({ page }) => {
  await page.goto('/#/revise')
  await expect(page.getByRole('heading', { name: 'Nothing due' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Open a chapter' })).toBeVisible()
})
