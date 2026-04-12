'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase-server'
import { createSafeAction } from '@/lib/create-safe-action'
import supabase from '@/lib/supabase'
import { getPlanLimits, isTrialExpired } from '@/lib/plans'
import { mapGallery } from '@/types'

import { GallerySchema } from '../schema'
import { InputType, ReturnType } from '../types'

const handler = async (data: InputType): Promise<ReturnType> => {
  const authClient = await createClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  // --- Plan enforcement ---
  const { data: meta } = await supabase
    .from('user_metadata')
    .select('plan, trial_ends_at')
    .eq('user_id', user.id)
    .single()

  if (meta) {
    const limits = getPlanLimits(meta.plan)

    if (meta.plan === 'free_trial' && isTrialExpired(meta.trial_ends_at)) {
      return {
        error:
          'Your free trial has expired. Please upgrade to continue creating galleries.',
      }
    }

    if (limits.maxGalleries !== Infinity) {
      const { count } = await supabase
        .from('galleries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      if ((count ?? 0) >= limits.maxGalleries) {
        return {
          error: `You've reached the ${limits.maxGalleries}-gallery limit on the Free Trial. Upgrade to Pro for unlimited galleries.`,
        }
      }
    }
  }
  // --- End plan enforcement ---

  const { title, bannerImage, date, isPublished, slug } = data

  try {
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

    const { error: categoryError } = await supabase
      .from('gallery_categories')
      .insert({
        gallery_id: galleryRow.id,
        name: 'Category 1',
      })

    if (categoryError) {
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
