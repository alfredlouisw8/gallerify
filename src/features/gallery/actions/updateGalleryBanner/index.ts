'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase-server'
import supabase from '@/lib/supabase'
import { deleteFromStorage, decrementStorageUsage } from '@/utils/storage-actions'
import { getStoragePath, sumStorageSizes } from '@/utils/storage'

export async function updateGalleryBanner(
  galleryId: string,
  newBannerJson: string
): Promise<void> {
  const authClient = await createClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // Fetch existing banner to clean up old file
  const { data: row, error: fetchError } = await supabase
    .from('galleries')
    .select('banner_image')
    .eq('id', galleryId)
    .single()

  if (fetchError) throw new Error(fetchError.message)

  const oldBanners: string[] = row.banner_image ?? []
  if (oldBanners.length > 0) {
    const paths = oldBanners.map(getStoragePath).filter(Boolean)
    if (paths.length > 0) await deleteFromStorage(paths)
    const freedBytes = sumStorageSizes(oldBanners)
    if (freedBytes > 0) await decrementStorageUsage(user.id, freedBytes)
  }

  const { error: updateError } = await supabase
    .from('galleries')
    .update({ banner_image: [newBannerJson], updated_at: new Date().toISOString() })
    .eq('id', galleryId)

  if (updateError) throw new Error(updateError.message)

  revalidatePath(`/gallery/${galleryId}`)
}
