'use server'

import { revalidatePath } from 'next/cache'

import getCategoryById from '@/features/galleryCategory/actions/getCategoryById'
import { GalleryCategorySchema } from '@/features/galleryCategory/actions/schema'
import { auth } from '@/lib/auth/auth'
import { createSafeAction } from '@/lib/create-safe-action'
import supabase from '@/lib/supabase'
import { mapGalleryCategory } from '@/types'

import { InputType, ReturnType } from '../types'

const handler = async (data: InputType): Promise<ReturnType> => {
  const session = await auth()

  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  const { name, galleryCategoryId, galleryId } = data

  try {
    if (!galleryId || !galleryCategoryId) throw new Error('Gallery not found')

    const existingCategory = await getCategoryById(galleryCategoryId)
    if (!existingCategory) throw new Error('Gallery Category not found')

    const { data: row, error } = await supabase
      .from('gallery_categories')
      .update({ name })
      .eq('id', galleryCategoryId)
      .select()
      .single()

    if (error) throw new Error(error.message)

    const result = mapGalleryCategory(row)

    revalidatePath(`/gallery/${galleryId}/collection/${result.id}`)
    return { data: result }
  } catch (error: any) {
    console.error(error.message)
    return { error: error.message || 'Failed to update gallery category' }
  }
}

export const updateGalleryCategory = createSafeAction(
  GalleryCategorySchema,
  handler
)
