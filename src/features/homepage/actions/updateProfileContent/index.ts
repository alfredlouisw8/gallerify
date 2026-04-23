'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase-server'
import supabase from '@/lib/supabase'

export async function updateProfileContent(data: {
  name: string | null
  aboutText: string | null
  whatsapp: string | null
  instagram: string | null
}): Promise<{ success: true } | { success: false; error: string }> {
  const client = await createClient()
  const {
    data: { user },
  } = await client.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase
    .from('user_metadata')
    .update({
      name: data.name,
      about_text: data.aboutText,
      whatsapp: data.whatsapp,
      instagram: data.instagram,
    })
    .eq('user_id', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/homepage')
  revalidatePath('/homepage/design')
  return { success: true }
}
