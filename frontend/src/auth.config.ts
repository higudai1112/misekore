import type { NextAuthConfig } from 'next-auth'

export const authConfig = {
    pages: {
        signIn: '/', // Redirect to title page if not authenticated
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user
            const isOnPublicPage =
                nextUrl.pathname === '/' ||
                nextUrl.pathname === '/login' ||
                nextUrl.pathname === '/signup'

            if (isOnPublicPage) {
                if (isLoggedIn) {
                    return Response.redirect(new URL('/want', nextUrl))
                }
                return true // Public pages are accessible
            }

            if (!isLoggedIn) {
                return false // Redirect to configured pages.signIn
            }

            return true
        },
    },
    providers: [], // Providers added in auth.ts
} satisfies NextAuthConfig
