'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase-server'
import supabase from '@/lib/supabase'

export async function deleteVendorShare(
  shareId: string,
  galleryId: string
): Promise<{ success: boolean; error?: string }> {
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { data: gallery } = await supabase
    .from('galleries')
    .select('id')
    .eq('id', galleryId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!gallery) return { success: false, error: 'Not found' }

  const { error } = await supabase
    .from('vendor_shares')
    .delete()
    .eq('id', shareId)
    .eq('gallery_id', galleryId)

  if (error) return { success: false, error: error.message }

  revalidatePath(`/gallery/${galleryId}/vendors`)
  return { success: true }
}
