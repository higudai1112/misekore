import type { NextAuthConfig } from 'next-auth'

// NextAuthの認証設定（ミドルウェアと共通で利用される部分）
export const authConfig = {
    // ミドルウェア（Edge runtime）でも secret を読み取れるよう明示的に指定する
    // AUTH_SECRET 環境変数から取得（NextAuth v5 の自動読み取りが Edge で機能しない場合の対策）
    secret: process.env.AUTH_SECRET,
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

            // 未ログインユーザーでも閲覧できる法的情報・サポートページ・共有ページ
            const isOnGuestPage =
                nextUrl.pathname === '/settings/privacy' ||
                nextUrl.pathname === '/settings/terms' ||
                nextUrl.pathname === '/settings/contact' ||
                nextUrl.pathname === '/settings/contact/thanks' ||
                nextUrl.pathname === '/forgot-password' ||
                nextUrl.pathname.startsWith('/reset-password') ||
                nextUrl.pathname.startsWith('/share/') // お店共有ページは未ログインでも閲覧可能

            if (isOnPublicPage) {
                // ログイン済みのユーザーが公開ページにアクセスした場合は、一覧（/shops）へリダイレクト
                if (isLoggedIn) {
                    return Response.redirect(new URL('/shops', nextUrl))
                }
                return true // 未ログインならそのまま公開ページへアクセス可能
            }

            // 法的情報・サポートページは未ログインでもアクセス許可
            if (isOnGuestPage) {
                return true
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
