'use server'

import { createClient } from '@/lib/supabase-server'

export async function reorderGalleryCategoryImages(
  orderedIds: string[]
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const updates = orderedIds.map((id, index) =>
    supabase
      .from('gallery_category_images')
      .update({ display_order: index })
      .eq('id', id)
  )

  const results = await Promise.all(updates)
  const failed = results.find((r) => r.error)
  if (failed?.error) return { error: failed.error.message }

  return {}
}
