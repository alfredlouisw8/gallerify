import NextAuth from 'next-auth'

import { CustomPrismaAdapter } from '@/lib/auth/custom-prisma-adapter'

import authConfig from './auth.config'

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: CustomPrismaAdapter(),
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.id = user.id
      return token
    },
    async session({ session, token }) {
      if (token) session.user.id = token.id as string
      return session
    },
  },
  ...authConfig,
})
