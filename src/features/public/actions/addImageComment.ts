'use server'

import { z } from 'zod'

import supabase from '@/lib/supabase'
import { ImageComment, ImageCommentRow, mapImageComment } from '@/types'

const schema = z.object({
  galleryId: z.string().uuid(),
  imageId: z.string().uuid(),
  clientName: z.string().max(80).nullable(),
  type: z.enum(['comment', 'feedback', 'request']),
  comment: z.string().min(1, 'Comment cannot be empty').max(1000),
})

export async function addImageComment(
  input: z.infer<typeof schema>
): Promise<{ success: true; data: ImageComment } | { success: false; error: string }> {
  const parsed = schema.safeParse(input)
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message }

  const { galleryId, imageId, clientName, type, comment } = parsed.data

  const { data, error } = await supabase
    .from('image_comments')
    .insert({
      gallery_id: galleryId,
      image_id: imageId,
      client_name: clientName,
      type,
      comment,
    })
    .select()
    .single()

  if (error || !data) return { success: false, error: error?.message ?? 'Failed to send' }

  return { success: true, data: mapImageComment(data as ImageCommentRow) }
}
