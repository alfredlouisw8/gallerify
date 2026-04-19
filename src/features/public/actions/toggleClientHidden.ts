'use server'

import { cookies } from 'next/headers'

import supabase from '@/lib/supabase'
import { clientTokenCookieName } from '@/utils/gallery-client-token'

export async function toggleClientHidden(
  galleryId: string,
  imageId: string
): Promise<{ hidden: boolean; error?: string }> {
  const cookieStore = await cookies()
  const token = cookieStore.get(clientTokenCookieName(galleryId))?.value
  if (!token) return { hidden: false, error: 'Not authenticated as client' }

  const { data: existing } = await supabase
    .from('gallery_client_hidden')
    .select('id')
    .eq('gallery_id', galleryId)
    .eq('image_id', imageId)
    .maybeSingle()

  if (existing) {
    await supabase
      .from('gallery_client_hidden')
      .delete()
      .eq('gallery_id', galleryId)
      .eq('image_id', imageId)
    return { hidden: false }
  } else {
    await supabase
      .from('gallery_client_hidden')
      .insert({ gallery_id: galleryId, image_id: imageId })
    return { hidden: true }
  }
}
