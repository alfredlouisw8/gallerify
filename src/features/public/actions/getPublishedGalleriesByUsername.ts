'use server'

import { unstable_noStore as noStore } from 'next/cache'

import { isPaidGalleryGraceActive, isTrialExpired, SubscriptionStatus } from '@/lib/plans'
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

function isGalleryAccessible(meta: {
  plan: string
  subscription_status: string
  subscription_expired_at: string | null
  trial_ends_at: string | null
  current_period_end: string | null
}): boolean {
  const { plan, subscription_status, subscription_expired_at, trial_ends_at, current_period_end } = meta

  // Active paid subscription (or cancelled but still within paid period)
  if (subscription_status === SubscriptionStatus.ACTIVE) return true
  if (
    subscription_status === SubscriptionStatus.CANCELLED &&
    current_period_end &&
    new Date() < new Date(current_period_end)
  ) return true

  // Active free trial
  if (subscription_status === SubscriptionStatus.TRIALING && !isTrialExpired(trial_ends_at)) return true

  // Expired or past-due paid plan: 7-day grace window
  if (
    subscription_status === SubscriptionStatus.EXPIRED ||
    subscription_status === SubscriptionStatus.PAST_DUE
  ) {
    return isPaidGalleryGraceActive(plan, subscription_expired_at)
  }

  // Everything else (expired trial, past_due with no access, etc.) → blocked
  return false
}
