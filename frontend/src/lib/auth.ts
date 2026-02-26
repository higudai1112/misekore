// auth.ts
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { authConfig } from '@/auth.config'
import { query } from '@/lib/db.server'
import type { QueryResultRow } from 'pg'

// データベースから取得するユーザー情報の型
type UserRow = QueryResultRow & {
  id: string
  email: string
  name: string | null
  password_hash: string
}

// NextAuthの設定本体。ミドルウェア用設定(authConfig)を拡張している
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: {
    strategy: 'jwt', // セッションの管理方法としてJWT(JSON Web Token)を使用
  },
  callbacks: {
    ...authConfig.callbacks,
    // トークン生成時、DBのユーザーIDをJWTトークンに含める
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    session({ session, token }) {
      // セッションオブジェクトを使えるように、トークンからユーザーIDを復元して渡す
      if (session.user && token.id) {
        session.user.id = token.id as string
      }
      return session
    },
  },
  secret: process.env.AUTH_SECRET,
  providers: [
    // メールアドレスとパスワードを使った独自のログイン処理（Credentials Provider）
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
      // ユーザーの入力情報を受け取り、DBと照合して認証を行う関数
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const email = credentials.email as string
        const password = credentials.password as string

        try {
          // DBからメールアドレスに一致するユーザーを検索
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

          // bcryptを使って、入力されたパスワードとDBのハッシュ化されたパスワードを比較
          const isValid = await bcrypt.compare(
            password,
            user.password_hash
          )

          if (!isValid) return null

          // 認証成功時、NextAuthに返すユーザー情報
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
