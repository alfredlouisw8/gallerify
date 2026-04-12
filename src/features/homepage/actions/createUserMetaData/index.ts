'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase-server'
import { createSafeAction } from '@/lib/create-safe-action'
import supabase from '@/lib/supabase'
import { mapUserMetadata } from '@/types'

import { UpdateProfileSchema } from '../schema'
import { InputType, ReturnType } from '../types'

const handler = async (data: InputType): Promise<ReturnType> => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  try {
    const { data: row, error } = await supabase
      .from('user_metadata')
      .insert({
        user_id: user.id,
        banner_image: data.bannerImage ?? null,
        whatsapp: data.whatsapp ?? null,
        instagram: data.instagram ?? null,
        about_image: data.aboutImage ?? null,
        about_text: data.aboutText ?? null,
        logo: data.logo ?? null,
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    revalidatePath('/homepage')
    return { data: mapUserMetadata(row) }
  } catch (error: any) {
    console.error(error.message)
    return { error: 'Failed to create user metadata' }
  }
}

export const createUserMetadata = createSafeAction(UpdateProfileSchema, handler)
