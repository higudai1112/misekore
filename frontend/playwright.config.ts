import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  // E2Eテストのディレクトリ
  testDir: './e2e',
  // テスト実行前にビルド済みサーバーが起動していることを期待
  use: {
    // ローカル開発サーバーのURL
    baseURL: 'http://localhost:3000',
    // スクリーンショットを失敗時のみ保存
    screenshot: 'only-on-failure',
    // 操作の動画を失敗時のみ保存
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  // テスト実行時に開発サーバーを自動起動しない（docker compose で別途起動）
  webServer: undefined,
})
