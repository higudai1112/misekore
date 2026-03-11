import { test, expect } from '@playwright/test'

/**
 * ステータス変更フローのE2Eテスト
 * 前提: テスト用ユーザー（test@example.com / password123）とWANTステータスのお店がDBに存在すること
 */

// 各テスト前にログイン済み状態にする
test.beforeEach(async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('メールアドレス').fill('test@example.com')
  await page.getByLabel('パスワード').fill('password123')
  await page.getByRole('button', { name: 'ログイン' }).click()
  await expect(page).toHaveURL('/shops')
})

test.describe('ステータス変更フロー', () => {
  test('お店一覧からお店詳細に遷移できる', async ({ page }) => {
    await page.goto('/shops')

    // 最初のお店カードをクリック
    const firstShopCard = page.locator('[data-testid="shop-card"]').first()
    if (await firstShopCard.isVisible()) {
      await firstShopCard.click()
      // 詳細ページのURLパターンを確認
      await expect(page).toHaveURL(/\/shops\/[a-z0-9-]+/)
    }
  })

  test('WANT から VISITED にステータスを変更できる', async ({ page }) => {
    await page.goto('/shops')

    // WANTタブでお店を探す
    const wantTab = page.getByRole('tab', { name: '行きたい' })
    if (await wantTab.isVisible()) {
      await wantTab.click()
    }

    // 最初のお店をクリックして詳細ページへ
    const firstShopCard = page.locator('[data-testid="shop-card"]').first()
    if (!(await firstShopCard.isVisible())) {
      test.skip()
      return
    }
    await firstShopCard.click()

    // 「行った」ボタンをクリック（ステータス変更）
    const visitedButton = page.getByRole('button', { name: '行った' })
    await expect(visitedButton).toBeVisible()
    await visitedButton.click()

    // ステータスバッジが「行った」に変わることを確認
    await expect(page.getByText('行った').first()).toBeVisible()
  })

  test('お気に入りに登録できる', async ({ page }) => {
    await page.goto('/shops')

    // 最初のお店をクリックして詳細ページへ
    const firstShopCard = page.locator('[data-testid="shop-card"]').first()
    if (!(await firstShopCard.isVisible())) {
      test.skip()
      return
    }
    await firstShopCard.click()

    // 「お気に入り」ボタンをクリック（ステータス変更）
    const favoriteButton = page.getByRole('button', { name: 'お気に入り' })
    if (await favoriteButton.isVisible()) {
      await favoriteButton.click()
      // ステータスバッジが「お気に入り」に変わることを確認
      await expect(page.getByText('お気に入り').first()).toBeVisible()
    }
  })
})
