'use server'

import { createClient } from '@/lib/supabase-server'
import supabase from '@/lib/supabase'

export type VendorShareListItem = {
  id: string
  vendorName: string
  vendorType: string
  imageCount: number
  watermark: boolean
  expiresAt: string | null
  createdAt: string
  token: string
  isExpired: boolean
}

export async function getGalleryVendorShares(galleryId: string): Promise<VendorShareListItem[]> {
  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return []

  const { data: gallery } = await supabase
    .from('galleries')
    .select('id')
    .eq('id', galleryId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!gallery) return []

  const { data } = await supabase
    .from('vendor_shares')
    .select('id, vendor_name, vendor_type, image_ids, watermark, expires_at, created_at, token')
    .eq('gallery_id', galleryId)
    .order('created_at', { ascending: false })

  const now = new Date()

  return (data ?? []).map(row => ({
    id: row.id,
    vendorName: row.vendor_name,
    vendorType: row.vendor_type,
    imageCount: (row.image_ids as string[]).length,
    watermark: row.watermark,
    expiresAt: row.expires_at ?? null,
    createdAt: row.created_at,
    token: row.token,
    isExpired: row.expires_at ? new Date(row.expires_at) < now : false,
  }))
}
