import NextAuth from 'next-auth'
import { authConfig } from './auth.config'

// NextAuthのミドルウェア機能をエクスポートし、リクエストに認証情報を付与する
export default NextAuth(authConfig).auth

// ミドルウェアを適用するパスの条件を指定（APIルート、静的ファイル、画像、favicon以外に適用）
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
