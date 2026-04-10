'use server'

import { revalidatePath } from 'next/cache'

import supabase from '@/lib/supabase'
import { mapGallery } from '@/types'
import { deleteFromStorage, getStoragePath } from '@/utils/storage'

export default async function deleteGallery(galleryId: string) {
  // Fetch gallery first to get banner images for storage cleanup
  const { data: galleryRow, error: fetchError } = await supabase
    .from('galleries')
    .select('*')
    .eq('id', galleryId)
    .single()

  if (fetchError) throw new Error(fetchError.message)

  // Delete banner images from Supabase Storage
  const bannerImages: string[] = galleryRow.banner_image ?? []
  if (bannerImages.length > 0) {
    const paths = bannerImages.map(getStoragePath).filter(Boolean)
    await deleteFromStorage(paths)
  }

  // Also delete all category images from storage
  const { data: categoryImages } = await supabase
    .from('gallery_category_images')
    .select('image_url, gallery_categories!inner(gallery_id)')
    .eq('gallery_categories.gallery_id', galleryId)

  if (categoryImages && categoryImages.length > 0) {
    const paths = categoryImages.map((img) => getStoragePath(img.image_url)).filter(Boolean)
    await deleteFromStorage(paths)
  }

  // Delete gallery (cascades to categories + images via FK)
  const { error: deleteError } = await supabase
    .from('galleries')
    .delete()
    .eq('id', galleryId)

  if (deleteError) throw new Error(deleteError.message)

  revalidatePath('/gallery')

  return mapGallery(galleryRow)
}
