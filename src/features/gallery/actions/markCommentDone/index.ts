'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase-server'
import supabase from '@/lib/supabase'

export async function markCommentDone(
  commentId: string,
  galleryId: string,
  done: boolean = true
): Promise<{ success: true } | { success: false; error: string }> {
  const authClient = await createClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { data: gallery } = await supabase
    .from('galleries')
    .select('id')
    .eq('id', galleryId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!gallery) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase
    .from('image_comments')
    .update({
      is_done: done,
      done_at: done ? new Date().toISOString() : null,
    })
    .eq('id', commentId)
    .eq('gallery_id', galleryId)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/gallery/${galleryId}/comments`)
  return { success: true }
}
