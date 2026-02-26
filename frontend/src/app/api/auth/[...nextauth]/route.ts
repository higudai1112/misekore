import { handlers } from '@/lib/auth'

// Node.js のランタイムを指定（Next.js のデフォルト）
export const runtime = 'nodejs'

// NextAuth が提供する各種APIエンドポイント（ログイン、ログアウトなど）の処理をエクスポート
export const { GET, POST } = handlers
