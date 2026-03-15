import { auth } from '@/lib/auth'
import { query } from '@/lib/db.server'
import { AppLayoutClient } from './AppLayoutClient'

type ProfileRow = { avatarUrl: string | null }

// アプリケーション全体で共通して使用するレイアウトコンポーネント
// プロフィール画像を取得してフッターに渡す Server Component
export async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  const userId = session?.user?.id ?? null

  // ユーザーが認証済みの場合、プロフィール画像 URL を取得する
  let avatarUrl: string | null = null
  if (userId) {
    const rows = await query<ProfileRow>(
      `SELECT "avatarUrl" FROM "Profile" WHERE "userId" = $1`,
      [userId]
    )
    avatarUrl = rows[0]?.avatarUrl ?? null
  }

  return <AppLayoutClient avatarUrl={avatarUrl}>{children}</AppLayoutClient>
}
