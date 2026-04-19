'use server'

import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase-server'
import supabase from '@/lib/supabase'

export async function updateClientAccess(
  galleryId: string,
  enabled: boolean,
  password: string | null
): Promise<{ error?: string }> {
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  try {
    let clientPasswordHash: string | null = null
    let clientPasswordPlain: string | null = null

    if (enabled && password && password.trim().length > 0) {
      clientPasswordPlain = password.trim()
      clientPasswordHash = await bcrypt.hash(clientPasswordPlain, 10)
    } else if (!enabled) {
      // Turning off — clear both
      clientPasswordHash = null
      clientPasswordPlain = null
    } else {
      // Toggling on without a new password — keep existing values
      const { data } = await supabase
        .from('galleries')
        .select('client_password_hash, client_password_plain')
        .eq('id', galleryId)
        .single()
      const row = data as { client_password_hash?: string | null; client_password_plain?: string | null } | null
      clientPasswordHash = row?.client_password_hash ?? null
      clientPasswordPlain = row?.client_password_plain ?? null
    }

    const { error } = await supabase
      .from('galleries')
      .update({
        client_access_enabled: enabled,
        client_password_hash: clientPasswordHash,
        client_password_plain: clientPasswordPlain,
        updated_at: new Date().toISOString(),
      })
      .eq('id', galleryId)

    if (error) throw new Error(error.message)

    revalidatePath(`/gallery/${galleryId}`, 'layout')
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to update client access' }
  }
}
