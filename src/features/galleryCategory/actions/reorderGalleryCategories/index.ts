'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase-server'

export async function reorderGalleryCategories(
  galleryId: string,
  orderedIds: string[]
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  try {
    await Promise.all(
      orderedIds.map((id, index) =>
        supabase
          .from('gallery_categories')
          .update({ display_order: index })
          .eq('id', id)
          .eq('gallery_id', galleryId)
      )
    )

    revalidatePath(`/gallery/${galleryId}`)
    return {}
  } catch (error: any) {
    return { error: error.message || 'Failed to reorder categories' }
  }
}
