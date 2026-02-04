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
                    // If logged in and on public page, maybe redirect to /want?
                    // User request didn't specify, but usually good UX.
                    // For now, let's keep it simple and allow access.
                    return true
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
