'use server'

import { revalidatePath } from 'next/cache'

import getGalleryCategoryImageById from '@/features/galleryCategoryImage/actions/getGalleryCategoryImageById'
import { GalleryCategoryImageSchema } from '@/features/galleryCategoryImage/actions/schema'
import { createClient } from '@/lib/supabase-server'
import { createSafeAction } from '@/lib/create-safe-action'
import supabase from '@/lib/supabase'
import { mapGalleryCategoryImage } from '@/types'

import { InputType, ReturnTypeSingle } from '../types'

const handler = async (data: InputType): Promise<ReturnTypeSingle> => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { categoryId, galleryCategoryImageId } = data

  try {
    if (!categoryId || !galleryCategoryImageId)
      throw new Error('Gallery not found')

    const existing = await getGalleryCategoryImageById(galleryCategoryImageId)
    if (!existing) throw new Error('Image not found')

    const { data: row, error } = await supabase
      .from('gallery_category_images')
      .update({ category_id: categoryId })
      .eq('id', galleryCategoryImageId)
      .select()
      .single()

    if (error) throw new Error(error.message)

    revalidatePath('/gallery')
    return { data: mapGalleryCategoryImage(row) }
  } catch (error: any) {
    console.error(error.message)
    return { error: error.message || 'Failed to update image' }
  }
}

export const updateGalleryCategoryImage = createSafeAction(
  GalleryCategoryImageSchema,
  handler
)
