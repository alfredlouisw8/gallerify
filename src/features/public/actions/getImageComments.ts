'use server'

import supabase from '@/lib/supabase'
import { ImageComment, ImageCommentRow, mapImageComment } from '@/types'

export async function getImageComments(galleryId: string, imageId: string): Promise<ImageComment[]> {
  const { data, error } = await supabase
    .from('image_comments')
    .select('*')
    .eq('gallery_id', galleryId)
    .eq('image_id', imageId)
    .order('created_at', { ascending: true })

  if (error || !data) return []
  return (data as ImageCommentRow[]).map(mapImageComment)
}
