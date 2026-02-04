// auth.ts
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import bcrypt from 'bcryptjs'

import { authConfig } from '@/auth.config'
import { prisma } from '@/lib/prisma'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
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
        if (
          typeof credentials.email !== 'string' ||
          typeof credentials.password !== 'string'
        ) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.passwordHash) {
          return null
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash,
        )

        if (!isValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
        }
      },
    }),
  ],
})
