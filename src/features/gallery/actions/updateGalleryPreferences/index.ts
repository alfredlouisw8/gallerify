'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase-server'
import type { GalleryPreferences } from '@/types'

export async function updateGalleryPreferences(
  galleryId: string,
  preferences: GalleryPreferences
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('galleries')
    .update({
      preferences: preferences as Record<string, unknown>,
      updated_at: new Date().toISOString(),
    })
    .eq('id', galleryId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath(`/gallery/${galleryId}`)
  return {}
}
