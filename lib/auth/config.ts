/**
 * NextAuth.js v5 Configuration
 *
 * 認證系統核心配置
 */

import NextAuth, { NextAuthConfig } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { prisma } from '@/lib/db/prisma'
import { verifyPassword } from './password'

/**
 * NextAuth.js Configuration
 */
export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),

  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('請提供 Email 和密碼')
        }

        const email = credentials.email as string
        const password = credentials.password as string

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email },
        })

        if (!user || !user.password) {
          throw new Error('Email 或密碼錯誤')
        }

        // Check if email is verified
        if (!user.emailVerified) {
          throw new Error('請先驗證您的 Email')
        }

        // Verify password
        const isPasswordValid = await verifyPassword(password, user.password)

        if (!isPasswordValid) {
          throw new Error('Email 或密碼錯誤')
        }

        // Return user object (password excluded)
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      },
    }),
  ],

  pages: {
    signIn: '/auth/login',
    signOut: '/auth/logout',
    error: '/auth/error',
    verifyRequest: '/auth/verify-request',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },

  debug: process.env.NODE_ENV === 'development',
}

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig)
