'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase-server'
import { createSafeAction } from '@/lib/create-safe-action'
import supabase from '@/lib/supabase'
import { mapGallery } from '@/types'
import { deleteFromStorage, getStoragePath } from '@/utils/storage'

import getGalleryById from '../getGalleryById'
import { GallerySchema } from '../schema'
import { InputType, ReturnType } from '../types'

const handler = async (data: InputType): Promise<ReturnType> => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { title, bannerImage, date, isPublished, slug, galleryId } = data

  try {
    if (!galleryId) throw new Error('Gallery not found')

    const existingGallery = await getGalleryById(galleryId)
    if (!existingGallery) throw new Error('Gallery not found')

    // Delete removed images from Supabase Storage
    const removedImages = existingGallery.bannerImage.filter(
      (img) => !bannerImage.includes(img)
    )
    if (removedImages.length > 0) {
      const paths = removedImages.map(getStoragePath).filter(Boolean)
      await deleteFromStorage(paths)
    }

    const { data: galleryRow, error } = await supabase
      .from('galleries')
      .update({
        title,
        banner_image: bannerImage as string[],
        date: new Date(date).toISOString(),
        is_published: isPublished,
        slug,
        updated_at: new Date().toISOString(),
      })
      .eq('id', galleryId)
      .select()
      .single()

    if (error) throw new Error(error.message)

    revalidatePath('/gallery')
    return { data: mapGallery(galleryRow) }
  } catch (error: any) {
    console.error(error.message)
    return { error: error.message || 'Failed to update gallery' }
  }
}

export const updateGallery = createSafeAction(GallerySchema, handler)
