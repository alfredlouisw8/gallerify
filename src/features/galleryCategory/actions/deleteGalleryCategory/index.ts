'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase-server'
import supabase from '@/lib/supabase'
import { decrementStorageUsage, decrementVideoUsage, deleteFromStorage } from '@/utils/storage-actions'
import { getStoragePath, sumStorageSizes, sumStorageDurations } from '@/utils/storage'

export async function deleteGalleryCategory(categoryId: string): Promise<void> {
  const authClient = await createClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Fetch category to get galleryId for revalidation
  const { data: category, error: catError } = await supabase
    .from('gallery_categories')
    .select('id, gallery_id')
    .eq('id', categoryId)
    .single()

  if (catError) throw new Error(catError.message)

  // Fetch all images in this category for storage cleanup
  const { data: imageRows } = await supabase
    .from('gallery_category_images')
    .select('image_url')
    .eq('category_id', categoryId)

  const imageUrls = (imageRows ?? []).map((r) => r.image_url)
  const totalBytes = sumStorageSizes(imageUrls)
  const totalVideoSeconds = sumStorageDurations(imageUrls)
  const storagePaths = imageUrls.map(getStoragePath).filter(Boolean)

  // Delete image files from storage
  if (storagePaths.length > 0) {
    await deleteFromStorage(storagePaths)
  }

  // Delete category from DB (cascades to gallery_category_images via FK)
  const { error: deleteError } = await supabase
    .from('gallery_categories')
    .delete()
    .eq('id', categoryId)

  if (deleteError) throw new Error(deleteError.message)

  // Decrement storage and video usage
  await Promise.all([
    decrementStorageUsage(user.id, totalBytes),
    decrementVideoUsage(user.id, totalVideoSeconds),
  ])

  revalidatePath(`/gallery/${category.gallery_id}`)
}
