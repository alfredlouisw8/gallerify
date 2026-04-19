'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase-server'
import supabase from '@/lib/supabase'

export async function updateShowClientSelects(
  galleryId: string,
  show: boolean
): Promise<{ error?: string }> {
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('galleries')
    .update({ show_client_selects: show, updated_at: new Date().toISOString() })
    .eq('id', galleryId)

  if (error) return { error: error.message }

  revalidatePath(`/gallery/${galleryId}`)
  return {}
}
