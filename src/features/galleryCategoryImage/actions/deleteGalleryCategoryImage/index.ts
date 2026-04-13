'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase-server'
import supabase from '@/lib/supabase'
import { deleteFromStorage, decrementStorageUsage } from '@/utils/storage-actions'
import { getStoragePath, getStorageSize } from '@/utils/storage'

export async function deleteGalleryCategoryImage(imageId: string): Promise<void> {
  const authClient = await createClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  // Fetch the image record to get its storage path + size
  const { data: image, error: fetchError } = await supabase
    .from('gallery_category_images')
    .select('image_url, category_id')
    .eq('id', imageId)
    .single()

  if (fetchError || !image) throw new Error('Image not found')

  const storagePath = getStoragePath(image.image_url)
  const bytes = getStorageSize(image.image_url)

  // Delete from DB first
  const { error: deleteError } = await supabase
    .from('gallery_category_images')
    .delete()
    .eq('id', imageId)

  if (deleteError) throw new Error(deleteError.message)

  // Delete from Supabase Storage
  if (storagePath) {
    await deleteFromStorage([storagePath])
  }

  // Decrement owner's storage usage
  if (bytes > 0) {
    await decrementStorageUsage(user.id, bytes)
  }

  // Get gallery_id from category for cache revalidation
  const { data: category } = await supabase
    .from('gallery_categories')
    .select('gallery_id')
    .eq('id', image.category_id)
    .single()

  if (category) {
    revalidatePath(`/gallery/${category.gallery_id}/collection/${image.category_id}`)
  }
}
