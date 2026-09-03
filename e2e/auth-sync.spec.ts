import { expect, test } from '@playwright/test'

test.use({ trace: 'off', screenshot: 'off', video: 'off' })

test.describe('authenticated sync', () => {
  test('Jane can sign in without recording credential artifacts', async ({ page }) => {
    const email = process.env.KNIGHTSHIFT_USER
    const password = process.env.KNIGHTSHIFT_PASSWORD
    test.skip(!email || !password, 'Knightshift runtime credentials are unavailable.')

    await page.goto('/settings')
    await page.getByLabel('Email').fill(email)
    await page.getByLabel('Password').fill(password)
    await page.getByRole('button', { name: 'Sign in' }).click()

    await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible({ timeout: 10_000 })
  })
})