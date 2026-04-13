'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase-server'
import supabase from '@/lib/supabase'
import { mapGallery } from '@/types'
import {
  deleteFromStorage,
  decrementStorageUsage,
} from '@/utils/storage-actions'
import { getStoragePath, sumStorageSizes } from '@/utils/storage'

export default async function deleteGallery(galleryId: string) {
  const authClient = await createClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()

  // Fetch gallery to get banner images for storage cleanup
  const { data: galleryRow, error: fetchError } = await supabase
    .from('galleries')
    .select('*')
    .eq('id', galleryId)
    .single()

  if (fetchError) throw new Error(fetchError.message)

  const bannerImages: string[] = galleryRow.banner_image ?? []

  // Fetch all category images before cascade-deleting the gallery
  const { data: categoryImages } = await supabase
    .from('gallery_category_images')
    .select('image_url, gallery_categories!inner(gallery_id)')
    .eq('gallery_categories.gallery_id', galleryId)

  const categoryImageUrls = (categoryImages ?? []).map((img) => img.image_url)

  // Calculate total bytes being freed
  const totalBytes =
    sumStorageSizes(bannerImages) + sumStorageSizes(categoryImageUrls)

  // Delete files from Supabase Storage
  const bannerPaths = bannerImages.map(getStoragePath).filter(Boolean)
  const categoryPaths = categoryImageUrls.map(getStoragePath).filter(Boolean)

  await Promise.all([
    bannerPaths.length > 0 ? deleteFromStorage(bannerPaths) : Promise.resolve(),
    categoryPaths.length > 0
      ? deleteFromStorage(categoryPaths)
      : Promise.resolve(),
  ])

  // Delete gallery from DB (cascades to categories + images via FK)
  const { error: deleteError } = await supabase
    .from('galleries')
    .delete()
    .eq('id', galleryId)

  if (deleteError) throw new Error(deleteError.message)

  // Decrement storage usage for the gallery owner
  if (user && totalBytes > 0) {
    await decrementStorageUsage(user.id, totalBytes)
  }

  revalidatePath('/gallery')
  return mapGallery(galleryRow)
}
