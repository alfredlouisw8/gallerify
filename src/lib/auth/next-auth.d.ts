// next-auth.d.ts
import { DefaultSession, DefaultUser } from 'next-auth'

declare module 'next-auth' {
  /**
   * Returned by `useSession`, `getSession`, and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's ID. */
      id: string
    } & DefaultSession['user']
  }

  interface User extends DefaultUser {
    /** The user's ID. */
    id: string
  }

  interface JWT {
    id: string
  }
}
