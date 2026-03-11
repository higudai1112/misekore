import { test, expect } from '@playwright/test'

/**
 * 認証フロー（ログイン・ログアウト）のE2Eテスト
 * 前提: テスト用ユーザー（test@example.com / password123）がDBに存在すること
 */
test.describe('認証フロー', () => {
  test('ログインページにアクセスできる', async ({ page }) => {
    await page.goto('/login')
    // ログインフォームが表示されることを確認
    await expect(page.getByRole('heading', { name: 'ログイン' })).toBeVisible()
    await expect(page.getByLabel('メールアドレス')).toBeVisible()
    await expect(page.getByLabel('パスワード')).toBeVisible()
  })

  test('誤った認証情報でログインするとエラーが表示される', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('メールアドレス').fill('wrong@example.com')
    await page.getByLabel('パスワード').fill('wrongpassword')
    await page.getByRole('button', { name: 'ログイン' }).click()
    // エラーメッセージが表示されることを確認
    await expect(page.getByText(/メールアドレスまたはパスワードが正しくありません/)).toBeVisible()
  })

  test('正しい認証情報でログインするとお店一覧に遷移する', async ({ page }) => {
    await page.goto('/login')
    await page.getByLabel('メールアドレス').fill('test@example.com')
    await page.getByLabel('パスワード').fill('password123')
    await page.getByRole('button', { name: 'ログイン' }).click()
    // /shops へリダイレクトされることを確認
    await expect(page).toHaveURL('/shops')
  })

  test('未認証でprotectedページにアクセスするとログインにリダイレクトされる', async ({ page }) => {
    await page.goto('/shops')
    // ログインページにリダイレクトされることを確認
    await expect(page).toHaveURL(/\/login/)
  })
})
