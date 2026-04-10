'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase-server'
import { createSafeAction } from '@/lib/create-safe-action'
import supabase from '@/lib/supabase'
import { mapGallery } from '@/types'

import { GallerySchema } from '../schema'
import { InputType, ReturnType } from '../types'

const handler = async (data: InputType): Promise<ReturnType> => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const { title, bannerImage, date, isPublished, slug } = data

  try {
    // 1. Create gallery
    const { data: galleryRow, error: galleryError } = await supabase
      .from('galleries')
      .insert({
        title,
        banner_image: bannerImage as string[],
        user_id: user.id,
        date: new Date(date).toISOString(),
        is_published: isPublished,
        slug,
      })
      .select()
      .single()

    if (galleryError) throw new Error(galleryError.message)

    // 2. Auto-create first category
    const { error: categoryError } = await supabase
      .from('gallery_categories')
      .insert({
        gallery_id: galleryRow.id,
        name: 'Category 1',
      })

    if (categoryError) {
      // Rollback gallery if category creation fails
      await supabase.from('galleries').delete().eq('id', galleryRow.id)
      throw new Error(categoryError.message)
    }

    revalidatePath('/gallery')
    return { data: mapGallery(galleryRow) }
  } catch (error: any) {
    console.error(error.message)
    return { error: 'Failed to create gallery' }
  }
}

export const createGallery = createSafeAction(GallerySchema, handler)
