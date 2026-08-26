import { expect, test } from '@playwright/test'

test('a mobile tap sequence plays a legal pawn move', async ({ page }) => {
  await page.goto('/play')

  for (const square of ['d2', 'd4']) {
    const box = await page.locator(`[data-square="${square}"]`).boundingBox()
    if (!box) throw new Error(`Missing chess square ${square}`)
    await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2)
  }

  await expect(page.locator('.move-log')).toContainText('d4')
})
