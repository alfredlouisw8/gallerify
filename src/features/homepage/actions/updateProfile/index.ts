'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase-server'
import { createSafeAction } from '@/lib/create-safe-action'
import supabase from '@/lib/supabase'
import { mapUserMetadata } from '@/types'

import { UpdateProfileSchema } from '../schema'
import { InputType, ReturnType } from '../types'

const handler = async (data: InputType): Promise<ReturnType> => {
  const client = await createClient()
  const {
    data: { user },
  } = await client.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const {
    name,
    username,
    aboutImage,
    aboutText,
    bannerImage,
    instagram,
    logo,
    whatsapp,
  } = data

  try {
    // Check username uniqueness (excluding current user)
    const { data: existingMeta } = await supabase
      .from('user_metadata')
      .select('user_id')
      .eq('username', username)
      .neq('user_id', user.id)
      .maybeSingle()

    if (existingMeta) throw new Error('Username already exists')

    // Update all fields including username in user_metadata
    const { data: metaRow, error: metaError } = await supabase
      .from('user_metadata')
      .update({
        name,
        username,
        about_image: aboutImage as string,
        about_text: aboutText,
        banner_image: bannerImage as string,
        instagram,
        logo: logo as string,
        whatsapp,
      })
      .eq('user_id', user.id)
      .select()
      .single()

    if (metaError) throw new Error(metaError.message)

    revalidatePath('/homepage')
    return { data: mapUserMetadata(metaRow) }
  } catch (error: any) {
    console.error(error.message)
    return { error: error.message || 'Failed to update profile' }
  }
}

export const updateProfile = createSafeAction(UpdateProfileSchema, handler)
