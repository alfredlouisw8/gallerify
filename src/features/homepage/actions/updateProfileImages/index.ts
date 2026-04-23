'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase-server'
import supabase from '@/lib/supabase'

export async function updateProfileImages(data: {
  logo?: string | null
  bannerImage?: string | null
  aboutImage?: string | null
}): Promise<{ success: true } | { success: false; error: string }> {
  const client = await createClient()
  const {
    data: { user },
  } = await client.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const update: Record<string, string | null> = {}
  if (data.logo !== undefined) update.logo = data.logo
  if (data.bannerImage !== undefined) update.banner_image = data.bannerImage
  if (data.aboutImage !== undefined) update.about_image = data.aboutImage

  if (Object.keys(update).length === 0) return { success: true }

  const { error } = await supabase
    .from('user_metadata')
    .update(update)
    .eq('user_id', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/homepage')
  revalidatePath('/homepage/design')
  return { success: true }
}
