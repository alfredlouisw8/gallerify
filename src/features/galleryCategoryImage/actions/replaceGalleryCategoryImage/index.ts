'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase-server'
import supabase from '@/lib/supabase'
import {
  deleteFromStorage,
  decrementStorageUsage,
  recordUploadedFiles,
} from '@/utils/storage-actions'
import { getStoragePath, getStorageSize } from '@/utils/storage'

export async function replaceGalleryCategoryImage(
  imageId: string,
  newImageUrl: string
): Promise<{ success: true } | { success: false; error: string }> {
  const authClient = await createClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { data: image } = await supabase
    .from('gallery_category_images')
    .select('image_url, category_id')
    .eq('id', imageId)
    .single()

  if (!image) return { success: false, error: 'Image not found' }

  const oldPath = getStoragePath(image.image_url)
  const oldBytes = getStorageSize(image.image_url)
  const newBytes = getStorageSize(newImageUrl)

  const { error } = await supabase
    .from('gallery_category_images')
    .update({ image_url: newImageUrl })
    .eq('id', imageId)

  if (error) return { success: false, error: error.message }

  if (oldPath) await deleteFromStorage([oldPath])
  if (oldBytes > 0) await decrementStorageUsage(user.id, oldBytes)
  if (newBytes > 0) await recordUploadedFiles(user.id, newBytes)

  const { data: category } = await supabase
    .from('gallery_categories')
    .select('gallery_id')
    .eq('id', image.category_id)
    .single()

  if (category) {
    revalidatePath(`/gallery/${category.gallery_id}/collection/${image.category_id}`)
    revalidatePath(`/gallery/${category.gallery_id}/comments`)
  }

  return { success: true }
}
