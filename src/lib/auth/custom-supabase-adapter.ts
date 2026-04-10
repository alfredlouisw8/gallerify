import { type Adapter } from 'next-auth/adapters'

import supabase from '@/lib/supabase'

// =============================================
// Helpers
// =============================================

function slugifyName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

async function generateUniqueUsername(name: string): Promise<string> {
  const base = slugifyName(name) || 'user'
  let username = base
  let counter = 1

  while (true) {
    const { data } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .maybeSingle()

    if (!data) break
    username = `${base}-${counter++}`
  }

  return username
}

// =============================================
// Custom Supabase Adapter for NextAuth v5
// =============================================

export function CustomSupabaseAdapter(): Adapter {
  return {
    // ------------------------------------------
    // User CRUD
    // ------------------------------------------

    async createUser(data) {
      const username = await generateUniqueUsername(data.name ?? 'user')

      const { data: user, error } = await supabase
        .from('users')
        .insert({
          name: data.name,
          email: data.email,
          email_verified: data.emailVerified?.toISOString() ?? null,
          image: data.image ?? null,
          username,
        })
        .select()
        .single()

      if (error) throw new Error(`createUser failed: ${error.message}`)

      // Auto-create UserMetadata (1:1)
      await supabase.from('user_metadata').insert({ user_id: user.id })

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.email_verified
          ? new Date(user.email_verified)
          : null,
        image: user.image,
      }
    },

    async getUser(id) {
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .maybeSingle()

      if (!user) return null

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.email_verified
          ? new Date(user.email_verified)
          : null,
        image: user.image,
      }
    },

    async getUserByEmail(email) {
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle()

      if (!user) return null

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.email_verified
          ? new Date(user.email_verified)
          : null,
        image: user.image,
      }
    },

    async getUserByAccount({ provider, providerAccountId }) {
      const { data: account } = await supabase
        .from('accounts')
        .select('*, users(*)')
        .eq('provider', provider)
        .eq('provider_account_id', providerAccountId)
        .maybeSingle()

      if (!account?.users) return null

      const user = account.users as {
        id: string
        name: string | null
        email: string
        email_verified: string | null
        image: string | null
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.email_verified
          ? new Date(user.email_verified)
          : null,
        image: user.image,
      }
    },

    async updateUser(data) {
      const { data: user, error } = await supabase
        .from('users')
        .update({
          name: data.name,
          email: data.email,
          email_verified: data.emailVerified?.toISOString() ?? null,
          image: data.image ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', data.id)
        .select()
        .single()

      if (error) throw new Error(`updateUser failed: ${error.message}`)

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.email_verified
          ? new Date(user.email_verified)
          : null,
        image: user.image,
      }
    },

    async deleteUser(id) {
      await supabase.from('users').delete().eq('id', id)
    },

    // ------------------------------------------
    // Account linking (OAuth providers)
    // ------------------------------------------

    async linkAccount(data) {
      const { error } = await supabase.from('accounts').insert({
        user_id: data.userId,
        type: data.type,
        provider: data.provider,
        provider_account_id: data.providerAccountId,
        refresh_token: data.refresh_token ?? null,
        access_token: data.access_token ?? null,
        expires_at: data.expires_at ?? null,
        token_type: data.token_type ?? null,
        scope: data.scope ?? null,
        id_token: data.id_token ?? null,
        session_state: data.session_state ?? null,
      })

      if (error) throw new Error(`linkAccount failed: ${error.message}`)

      return data
    },

    async unlinkAccount({ provider, providerAccountId }) {
      await supabase
        .from('accounts')
        .delete()
        .eq('provider', provider)
        .eq('provider_account_id', providerAccountId)
    },

    // ------------------------------------------
    // Sessions (used only with "database" strategy;
    //  this app uses JWT so these are rarely called)
    // ------------------------------------------

    async createSession(data) {
      const { data: session, error } = await supabase
        .from('sessions')
        .insert({
          session_token: data.sessionToken,
          user_id: data.userId,
          expires: data.expires.toISOString(),
        })
        .select()
        .single()

      if (error) throw new Error(`createSession failed: ${error.message}`)

      return {
        sessionToken: session.session_token,
        userId: session.user_id,
        expires: new Date(session.expires),
      }
    },

    async getSessionAndUser(sessionToken) {
      const { data: session } = await supabase
        .from('sessions')
        .select('*, users(*)')
        .eq('session_token', sessionToken)
        .maybeSingle()

      if (!session?.users) return null

      const user = session.users as {
        id: string
        name: string | null
        email: string
        email_verified: string | null
        image: string | null
      }

      return {
        session: {
          sessionToken: session.session_token,
          userId: session.user_id,
          expires: new Date(session.expires),
        },
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.email_verified
            ? new Date(user.email_verified)
            : null,
          image: user.image,
        },
      }
    },

    async updateSession(data) {
      const { data: session, error } = await supabase
        .from('sessions')
        .update({
          expires: data.expires?.toISOString(),
          user_id: data.userId,
          updated_at: new Date().toISOString(),
        })
        .eq('session_token', data.sessionToken)
        .select()
        .single()

      if (error) throw new Error(`updateSession failed: ${error.message}`)

      return {
        sessionToken: session.session_token,
        userId: session.user_id,
        expires: new Date(session.expires),
      }
    },

    async deleteSession(sessionToken) {
      await supabase
        .from('sessions')
        .delete()
        .eq('session_token', sessionToken)
    },

    // ------------------------------------------
    // Verification tokens (email magic links etc.)
    // ------------------------------------------

    async createVerificationToken(data) {
      const { data: token, error } = await supabase
        .from('verification_tokens')
        .insert({
          identifier: data.identifier,
          token: data.token,
          expires: data.expires.toISOString(),
        })
        .select()
        .single()

      if (error)
        throw new Error(`createVerificationToken failed: ${error.message}`)

      return {
        identifier: token.identifier,
        token: token.token,
        expires: new Date(token.expires),
      }
    },

    async useVerificationToken({ identifier, token }) {
      const { data } = await supabase
        .from('verification_tokens')
        .delete()
        .eq('identifier', identifier)
        .eq('token', token)
        .select()
        .maybeSingle()

      if (!data) return null

      return {
        identifier: data.identifier,
        token: data.token,
        expires: new Date(data.expires),
      }
    },
  }
}
