// auth.ts
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Apple from 'next-auth/providers/apple'
import Google from 'next-auth/providers/google'
import Line from 'next-auth/providers/line'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'
import { authConfig } from '@/auth.config'
import { query, pool } from '@/lib/db.server'
import type { QueryResultRow } from 'pg'

// データベースから取得するユーザー情報の型
type UserRow = QueryResultRow & {
  id: string
  email: string
  name: string | null
  password_hash: string | null
}

// Account テーブルの行型
type AccountRow = QueryResultRow & {
  id: string
  userId: string
}

// NextAuthの設定本体。ミドルウェア用設定(authConfig)を拡張している
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  // Vercel等のリバースプロキシ環境でX-Forwarded-Hostを信頼する（本番環境の500エラー対策）
  trustHost: true,
  session: {
    strategy: 'jwt', // セッションの管理方法としてJWT(JSON Web Token)を使用
  },
  callbacks: {
    ...authConfig.callbacks,
    // OAuthログイン時にDBへユーザー情報を upsert する
    async signIn({ user, account }) {
      // Credentials プロバイダーの場合はスキップ（authorize() で処理済み）
      if (!account || account.provider === 'credentials') return true

      const provider = account.provider           // 'google' | 'line' | 'apple'
      const providerAccountId = account.providerAccountId
      const email = user.email
      const name = user.name ?? null

      // Apple は初回ログイン時のみメールを返すため providerAccountId のみで管理
      if (!providerAccountId) return false
      // Apple でメールが取得できない場合（2回目以降）は Account 検索で対応
      if (!email && provider !== 'apple') return false

      const client = await pool.connect()
      try {
        await client.query('BEGIN')

        // 同じ provider + providerAccountId の Account が既に存在するか確認
        const existingAccounts = await client.query<AccountRow>(
          `SELECT id, "userId" FROM "Account"
           WHERE provider = $1 AND "providerAccountId" = $2
           LIMIT 1`,
          [provider, providerAccountId]
        )

        if (existingAccounts.rows.length > 0) {
          // 既存アカウントあり → user.id に userId をセットして終了
          user.id = existingAccounts.rows[0].userId
          await client.query('COMMIT')
          return true
        }

        // Account が存在しない場合、同メールの User を探す
        // Apple はメールが null になる場合（2回目以降）があるため email がある場合のみ検索
        let userId: string

        if (email) {
          const existingUsers = await client.query<UserRow>(
            `SELECT id FROM "User" WHERE email = $1 LIMIT 1`,
            [email]
          )

          if (existingUsers.rows.length > 0) {
            // 同メールの User が既存 → Account を紐付けるだけ
            userId = existingUsers.rows[0].id
          } else {
            // User が存在しない → User + Profile を新規作成
            userId = randomUUID()
            const now = new Date()

            await client.query(
              `INSERT INTO "User" (id, email, "passwordHash", "createdAt", "updatedAt")
               VALUES ($1, $2, NULL, $3, $3)`,
              [userId, email, now]
            )

            await client.query(
              `INSERT INTO "Profile" (id, "userId", name, "createdAt", "updatedAt")
               VALUES ($1, $2, $3, $4, $4)`,
              [randomUUID(), userId, name, now]
            )
          }
        } else {
          // Apple 2回目以降でメールなし・Accountも未登録の場合はログイン不可
          await client.query('ROLLBACK')
          return false
        }

        // Account を新規作成
        const now = new Date()
        await client.query(
          `INSERT INTO "Account" (id, "userId", provider, "providerAccountId", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, $5)`,
          [randomUUID(), userId, provider, providerAccountId, now]
        )

        await client.query('COMMIT')

        // JWT に userId をセットするため user.id に代入
        user.id = userId
        return true
      } catch (error) {
        await client.query('ROLLBACK')
        console.error('OAuth signIn error:', error)
        return false
      } finally {
        client.release()
      }
    },
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
    // Googleソーシャルログイン
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    // LINEソーシャルログイン
    Line({
      clientId: process.env.LINE_CLIENT_ID!,
      clientSecret: process.env.LINE_CLIENT_SECRET!,
    }),
    // Apple Sign In（App Store ガイドライン必須）
    Apple({
      clientId: process.env.APPLE_ID!,
      clientSecret: process.env.APPLE_SECRET!,
    }),
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
              u.id,
              u.email,
              p.name,
              u."passwordHash" AS password_hash
            FROM "User" u
            LEFT JOIN "Profile" p ON p."userId" = u.id
            WHERE u.email = $1
            LIMIT 1
            `,
            [email]
          )

          const user = users[0]
          // OAuthのみのユーザー（passwordHash が NULL）はCredentialsでログイン不可
          if (!user || !user.password_hash) return null

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
