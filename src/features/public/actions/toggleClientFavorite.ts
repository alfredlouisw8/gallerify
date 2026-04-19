'use server'

import { cookies } from 'next/headers'

import supabase from '@/lib/supabase'
import { clientTokenCookieName } from '@/utils/gallery-client-token'

export async function toggleClientFavorite(
  galleryId: string,
  imageId: string
): Promise<{ favorited: boolean; error?: string }> {
  const cookieStore = await cookies()
  const token = cookieStore.get(clientTokenCookieName(galleryId))?.value
  if (!token) return { favorited: false, error: 'Not authenticated as client' }

  // Check if already favorited
  const { data: existing } = await supabase
    .from('gallery_client_favorites')
    .select('id')
    .eq('gallery_id', galleryId)
    .eq('image_id', imageId)
    .maybeSingle()

  if (existing) {
    await supabase
      .from('gallery_client_favorites')
      .delete()
      .eq('gallery_id', galleryId)
      .eq('image_id', imageId)
    return { favorited: false }
  } else {
    await supabase
      .from('gallery_client_favorites')
      .insert({ gallery_id: galleryId, image_id: imageId })
    return { favorited: true }
  }
}
