'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase-server'
import supabase from '@/lib/supabase'
import {
  decrementStorageUsage,
  deleteFromStorage,
} from '@/utils/storage-actions'
import { getStoragePath, getStorageSize } from '@/utils/storage'

export async function bulkDeleteGalleryCategoryImages(
  imageIds: string[]
): Promise<void> {
  if (!imageIds.length) return

  const authClient = await createClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Fetch all image records to get storage paths, sizes, and category IDs
  const { data: images, error: fetchError } = await supabase
    .from('gallery_category_images')
    .select('id, image_url, category_id')
    .in('id', imageIds)

  if (fetchError || !images?.length) throw new Error('Images not found')

  const categoryIds = Array.from(new Set(images.map((img) => img.category_id)))

  // Fetch categories to get gallery IDs for path revalidation
  const { data: categories } = await supabase
    .from('gallery_categories')
    .select('id, gallery_id')
    .in('id', categoryIds)

  // Delete from DB
  const { error: deleteError } = await supabase
    .from('gallery_category_images')
    .delete()
    .in('id', imageIds)

  if (deleteError) throw new Error(deleteError.message)

  // Delete from storage in one batch call
  const storagePaths = images
    .map((img) => getStoragePath(img.image_url))
    .filter((p): p is string => Boolean(p))

  if (storagePaths.length) {
    await deleteFromStorage(storagePaths)
  }

  // Decrement storage usage by total bytes removed
  const totalBytes = images.reduce(
    (sum, img) => sum + getStorageSize(img.image_url),
    0
  )
  if (totalBytes > 0) {
    await decrementStorageUsage(user.id, totalBytes)
  }

  // Revalidate all affected collection paths
  for (const category of categories ?? []) {
    revalidatePath(
      `/gallery/${category.gallery_id}/collection/${category.id}`
    )
  }
}
