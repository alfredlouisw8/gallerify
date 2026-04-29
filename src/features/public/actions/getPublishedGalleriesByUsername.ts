'use server'

import { unstable_noStore as noStore } from 'next/cache'

import { isGalleryAccessible } from '@/lib/plans'
import supabase from '@/lib/supabase'
import { Gallery, GalleryRow, mapGallery } from '@/types'

export async function getPublishedGalleriesByUsername(
  username: string
): Promise<Gallery[]> {
  noStore()

  const { data: meta, error: metaError } = await supabase
    .from('user_metadata')
    .select(
      'user_id, plan, subscription_status, subscription_expired_at, trial_ends_at, current_period_end'
    )
    .eq('username', username)
    .maybeSingle()

  if (metaError) throw new Error(metaError.message)
  if (!meta) return []

  // Block gallery access for expired accounts (with grace period for paid plans)
  if (!isGalleryAccessible(meta)) return []

  const { data: rows, error } = await supabase
    .from('galleries')
    .select('*')
    .eq('user_id', meta.user_id)
    .order('date', { ascending: false })

  if (error) throw new Error(error.message)
  if (!rows) return []

  return rows.map((row) => mapGallery(row as GalleryRow))
}

