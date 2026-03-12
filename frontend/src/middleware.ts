import NextAuth from 'next-auth'
import { authConfig } from './auth.config'

// NextAuthのミドルウェア機能をエクスポートし、リクエストに認証情報を付与する
export default NextAuth(authConfig).auth

// ミドルウェアを適用するパスの条件を指定
// api・_next系・favicon・拡張子付きの静的ファイル（.png/.svg等）は除外
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)',],
}
