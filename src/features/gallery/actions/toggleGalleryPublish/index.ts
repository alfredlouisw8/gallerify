'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase-server'

export async function toggleGalleryPublish(
  galleryId: string,
  isPublished: boolean
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('galleries')
    .update({
      is_published: isPublished,
      updated_at: new Date().toISOString(),
    })
    .eq('id', galleryId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/gallery')
  revalidatePath(`/gallery/${galleryId}`)
  return {}
}
