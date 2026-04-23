'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase-server'
import supabase from '@/lib/supabase'

const schema = z.object({
  commentId: z.string().uuid(),
  galleryId: z.string().uuid(),
  reply: z.string().min(1).max(1000),
})

export async function replyToComment(
  input: z.infer<typeof schema>
): Promise<{ success: true } | { success: false; error: string }> {
  const parsed = schema.safeParse(input)
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message }

  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  // Verify gallery ownership
  const { data: gallery } = await supabase
    .from('galleries')
    .select('id')
    .eq('id', parsed.data.galleryId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!gallery) return { success: false, error: 'Gallery not found' }

  const { error } = await supabase
    .from('image_comments')
    .update({
      owner_reply: parsed.data.reply,
      owner_replied_at: new Date().toISOString(),
    })
    .eq('id', parsed.data.commentId)
    .eq('gallery_id', parsed.data.galleryId)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/gallery/${parsed.data.galleryId}/comments`)
  return { success: true }
}
