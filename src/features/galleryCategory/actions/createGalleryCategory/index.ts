'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase-server'
import { createSafeAction } from '@/lib/create-safe-action'
import supabase from '@/lib/supabase'
import { mapGalleryCategory } from '@/types'

import { GalleryCategorySchema } from '../schema'
import { InputType, ReturnType } from '../types'

const handler = async (data: InputType): Promise<ReturnType> => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { galleryId, name } = data

  try {
    const { data: row, error } = await supabase
      .from('gallery_categories')
      .insert({
        gallery_id: galleryId,
        name,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    const result = mapGalleryCategory(row)

    revalidatePath(`/gallery/${galleryId}/collection/${result.id}`)
    return { data: result }
  } catch (error: any) {
    console.error(error.message)
    return { error: 'Failed to create gallery category' }
  }
}

export const createGalleryCategory = createSafeAction(
  GalleryCategorySchema,
  handler
)
