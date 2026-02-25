// auth.ts
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { authConfig } from '@/auth.config'
import { query } from '@/lib/db.server'
import type { QueryResultRow } from 'pg'

type UserRow = QueryResultRow & {
  id: string
  email: string
  name: string | null
  password_hash: string
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    ...authConfig.callbacks,
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  secret: process.env.AUTH_SECRET,
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
        },
        password: {
          label: 'Password',
          type: 'password',
        },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const email = credentials.email as string
        const password = credentials.password as string

        try {
          const users = await query<UserRow>(
            `
            SELECT
              id,
              email,
              name,
              password_hash
            FROM users
            WHERE email = $1
            LIMIT 1
            `,
            [email]
          )

          const user = users[0]
          if (!user) return null

          const isValid = await bcrypt.compare(
            password,
            user.password_hash
          )

          if (!isValid) return null

          return {
            id: user.id,
            email: user.email,
            name: user.name ?? undefined,
          }
        } catch (error) {
          console.error('Auth check error:', error)
          return null
        }
      },
    }),
  ],
})
