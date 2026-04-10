'use server'

import { revalidatePath } from 'next/cache'

import { auth } from '@/lib/auth/auth'
import { createSafeAction } from '@/lib/create-safe-action'
import supabase from '@/lib/supabase'
import { mapUserMetadata } from '@/types'

import { UpdateProfileSchema } from '../schema'
import { InputType, ReturnType } from '../types'

const handler = async (data: InputType): Promise<ReturnType> => {
  const session = await auth()

  if (!session?.user) {
    return { error: 'Unauthorized' }
  }

  const {
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
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .neq('id', session.user.id)
      .maybeSingle()

    if (existingUser) throw new Error('Username already exists')

    // Update username
    const { error: userError } = await supabase
      .from('users')
      .update({
        username,
        updated_at: new Date().toISOString(),
      })
      .eq('id', session.user.id)

    if (userError) throw new Error(userError.message)

    // Update user metadata
    const { data: metaRow, error: metaError } = await supabase
      .from('user_metadata')
      .update({
        about_image: aboutImage as string,
        about_text: aboutText,
        banner_image: bannerImage as string,
        instagram,
        logo: logo as string,
        whatsapp,
      })
      .eq('user_id', session.user.id)
      .select()
      .single()

    if (metaError) throw new Error(metaError.message)

    revalidatePath('/profile/')
    return { data: mapUserMetadata(metaRow) }
  } catch (error: any) {
    console.error(error.message)
    return { error: error.message || 'Failed to update profile' }
  }
}

export const updateProfile = createSafeAction(UpdateProfileSchema, handler)
