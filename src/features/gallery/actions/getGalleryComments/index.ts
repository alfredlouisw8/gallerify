'use server'

import { createClient } from '@/lib/supabase-server'
import supabase from '@/lib/supabase'
import { ImageComment, ImageCommentRow, mapImageComment } from '@/types'
import { getStorageUrl } from '@/lib/utils'

export type CommentWithImage = ImageComment & { imageUrl: string | null }

export async function getGalleryComments(galleryId: string): Promise<CommentWithImage[]> {
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return []

  // Verify gallery belongs to the current user
  const { data: gallery } = await supabase
    .from('galleries')
    .select('id')
    .eq('id', galleryId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!gallery) return []

  const { data: rows, error } = await supabase
    .from('image_comments')
    .select('*')
    .eq('gallery_id', galleryId)
    .order('created_at', { ascending: true })

  if (error || !rows?.length) return []

  const imageIds = Array.from(new Set(rows.map((r) => r.image_id)))

  const { data: imageRows } = await supabase
    .from('gallery_category_images')
    .select('id, image_url')
    .in('id', imageIds)

  const imageMap: Record<string, string> = {}
  for (const img of imageRows ?? []) {
    imageMap[img.id] = getStorageUrl(img.image_url)
  }

  return (rows as ImageCommentRow[]).map((row) => ({
    ...mapImageComment(row),
    imageUrl: imageMap[row.image_id] ?? null,
  }))
}
