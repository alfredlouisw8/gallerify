'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase-server'
import supabase from '@/lib/supabase'

export async function bulkMoveGalleryCategoryImages(
  imageIds: string[],
  targetCategoryId: string
): Promise<void> {
  if (!imageIds.length || !targetCategoryId) return

  const authClient = await createClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Fetch source category IDs for revalidation
  const { data: images, error: fetchError } = await supabase
    .from('gallery_category_images')
    .select('id, category_id')
    .in('id', imageIds)

  if (fetchError) throw new Error(fetchError.message)

  const sourceCategoryIds = Array.from(
    new Set((images ?? []).map((img) => img.category_id))
  )

  // Get the current max display_order in the target category so images append at the end
  const { data: maxRow } = await supabase
    .from('gallery_category_images')
    .select('display_order')
    .eq('category_id', targetCategoryId)
    .order('display_order', { ascending: false })
    .limit(1)
    .maybeSingle()

  const startOrder = (maxRow?.display_order ?? -1) + 1

  // Move all images in parallel
  await Promise.all(
    imageIds.map((id, i) =>
      supabase
        .from('gallery_category_images')
        .update({
          category_id: targetCategoryId,
          display_order: startOrder + i,
        })
        .eq('id', id)
    )
  )

  // Revalidate source and target collection paths
  const allCategoryIds = Array.from(
    new Set([...sourceCategoryIds, targetCategoryId])
  )
  const { data: categories } = await supabase
    .from('gallery_categories')
    .select('id, gallery_id')
    .in('id', allCategoryIds)

  const galleryIds = Array.from(new Set((categories ?? []).map((c) => c.gallery_id)))
  for (const category of categories ?? []) {
    revalidatePath(`/gallery/${category.gallery_id}/collection/${category.id}`)
  }
  for (const galleryId of galleryIds) {
    revalidatePath(`/gallery/${galleryId}`)
  }
}
