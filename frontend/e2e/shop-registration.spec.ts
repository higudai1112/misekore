import { test, expect } from '@playwright/test'

/**
 * お店の新規登録フローのE2Eテスト
 * 前提: テスト用ユーザー（test@example.com / password123）がDBに存在すること
 */

// 各テスト前にログイン済み状態にする
test.beforeEach(async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('メールアドレス').fill('test@example.com')
  await page.getByLabel('パスワード').fill('password123')
  await page.getByRole('button', { name: 'ログイン' }).click()
  await expect(page).toHaveURL('/shops')
})

test.describe('お店の新規登録フロー', () => {
  test('新規登録ページにアクセスできる', async ({ page }) => {
    await page.goto('/shops/new')
    // 新規登録フォームが表示されることを確認
    await expect(page.getByRole('heading', { name: 'お店を追加' })).toBeVisible()
  })

  test('手動入力でお店を登録できる', async ({ page }) => {
    await page.goto('/shops/new')

    // 手動入力タブに切り替え
    const manualTab = page.getByRole('tab', { name: '手動入力' })
    if (await manualTab.isVisible()) {
      await manualTab.click()
    }

    // 店名を入力して送信
    await page.getByLabel('店名').fill('E2Eテスト用のお店')
    await page.getByRole('button', { name: '登録する' }).click()

    // お店一覧ページへリダイレクトされることを確認
    await expect(page).toHaveURL('/shops')
    // 登録したお店名がページに表示されることを確認
    await expect(page.getByText('E2Eテスト用のお店')).toBeVisible()
  })

  test('店名が未入力の場合はエラーが表示される', async ({ page }) => {
    await page.goto('/shops/new')

    const manualTab = page.getByRole('tab', { name: '手動入力' })
    if (await manualTab.isVisible()) {
      await manualTab.click()
    }

    // 店名を空のまま送信
    await page.getByRole('button', { name: '登録する' }).click()

    // エラーメッセージが表示されることを確認
    await expect(page.getByText(/店名を入力してください/)).toBeVisible()
  })
})
