import NextAuth from 'next-auth'

import { CustomSupabaseAdapter } from '@/lib/auth/custom-supabase-adapter'

import authConfig from './auth.config'

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: CustomSupabaseAdapter(),
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
