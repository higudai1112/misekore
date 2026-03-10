import type { NextAuthConfig } from 'next-auth'

// NextAuthの認証設定（ミドルウェアと共通で利用される部分）
export const authConfig = {
    pages: {
        signIn: '/', // 未ログイン時にリダイレクトされるページ（トップページ）
    },
    callbacks: {
        // 各ルートへのアクセス時に認証状態をチェックするコールバック
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            // ログイン不要でアクセスできる公開ページの判定
            const isOnPublicPage =
                nextUrl.pathname === '/' ||
                nextUrl.pathname === '/login' ||
                nextUrl.pathname === '/signup'

            if (isOnPublicPage) {
                // ログイン済みのユーザーが公開ページにアクセスした場合は、一覧（/shops）へリダイレクト
                if (isLoggedIn) {
                    return Response.redirect(new URL('/shops', nextUrl))
                }
                return true // 未ログインならそのまま公開ページへアクセス可能
            }

            // ログインが必要なページへのアクセスで、未ログインの場合は signIn ページ（/）へリダイレクト
            if (!isLoggedIn) {
                return false
            }

            return true // ログイン済みならアクセス許可
        },
    },
    providers: [], // 実際のプロバイダ設定は auth.ts 側で行う
} satisfies NextAuthConfig
