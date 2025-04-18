import { NextAuthConfig } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'

const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/', // Your custom login page
    error: '/',
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
}

export default authConfig
