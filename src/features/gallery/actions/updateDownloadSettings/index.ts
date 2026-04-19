'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase-server'
import supabase from '@/lib/supabase'

export async function updateDownloadSettings(
  galleryId: string,
  enabled: boolean,
  pin: string | null
): Promise<{ error?: string }> {
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('galleries')
    .update({
      download_enabled: enabled,
      download_pin: enabled ? pin : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', galleryId)

  if (error) return { error: error.message }

  revalidatePath(`/gallery/${galleryId}`)
  return {}
}
