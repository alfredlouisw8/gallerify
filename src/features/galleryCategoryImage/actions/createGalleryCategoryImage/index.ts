'use server'

import { revalidatePath } from 'next/cache'

import { auth } from '@/lib/auth/auth'
import { createSafeAction } from '@/lib/create-safe-action'
import supabase from '@/lib/supabase'
import { mapGalleryCategoryImage } from '@/types'

import { GalleryCategoryImageSchema } from '../schema'
import { InputType, ReturnType } from '../types'

const handler = async (data: InputType): Promise<ReturnType> => {
  const session = await auth()

  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  const { categoryId, imageUrl } = data

  try {
    // Verify category exists and get galleryId for revalidation
    const { data: category, error: catError } = await supabase
      .from('gallery_categories')
      .select('gallery_id')
      .eq('id', categoryId)
      .maybeSingle()

    if (catError || !category) {
      return { error: 'Gallery category not found' }
    }

    // Insert all images
    const inserts = (imageUrl ?? []).map((url) => ({
      image_url: url as string,
      category_id: categoryId,
    }))

    const { data: rows, error } = await supabase
      .from('gallery_category_images')
      .insert(inserts)
      .select()

    if (error) throw new Error(error.message)

    const result = (rows ?? []).map(mapGalleryCategoryImage)

    revalidatePath(
      `/gallery/${category.gallery_id}/collection/${categoryId}`
    )
    return { data: result }
  } catch (error: any) {
    console.error(error.message)
    return { error: 'Failed to create gallery category image' }
  }
}

export const createGalleryCategoryImage = createSafeAction(
  GalleryCategoryImageSchema,
  handler
)
