import supabase from '@/lib/supabase'
import { getStorageUrl } from '@/lib/utils'

export type VendorShareImage = { id: string; imageUrl: string }

export type VendorShareWatermark = {
  type: 'text' | 'image'
  text: string | null
  textColor: 'white' | 'black'
  imageUrl: string | null
  scale: number
  opacity: number
  position: string
}

export type VendorShareData = {
  id: string
  galleryId: string
  vendorName: string
  vendorType: string
  imageIds: string[]
  watermark: boolean
  expiresAt: string | null
  createdAt: string
  images: VendorShareImage[]
  photographer: { name: string | null; logo: string | null; username: string | null }
  watermarkData: VendorShareWatermark | null
  colorTheme: string
  customColorTheme: string | null
}

export async function getVendorShareByToken(
  token: string
): Promise<VendorShareData | null | 'expired'> {
  const { data: share } = await supabase
    .from('vendor_shares')
    .select('*')
    .eq('token', token)
    .maybeSingle()

  if (!share) return null

  if (share.expires_at && new Date(share.expires_at) < new Date()) return 'expired'

  // Fetch the actual images, ordered to match image_ids
  const { data: imageRows } = await supabase
    .from('gallery_category_images')
    .select('id, image_url')
    .in('id', share.image_ids as string[])

  const imageMap: Record<string, string> = {}
  for (const row of imageRows ?? []) {
    imageMap[row.id] = getStorageUrl(row.image_url)
  }

  const images: VendorShareImage[] = (share.image_ids as string[])
    .map(id => imageMap[id] ? { id, imageUrl: imageMap[id] } : null)
    .filter(Boolean) as VendorShareImage[]

  // Fetch gallery for user_id + watermark_id + preferences
  const { data: galleryRow } = await supabase
    .from('galleries')
    .select('user_id, watermark_id, preferences')
    .eq('id', share.gallery_id)
    .single()

  // Fetch photographer branding
  let photographer = { name: null as string | null, logo: null as string | null, username: null as string | null }
  if (galleryRow?.user_id) {
    const { data: meta } = await supabase
      .from('user_metadata')
      .select('name, logo, username, business_name')
      .eq('user_id', galleryRow.user_id)
      .maybeSingle()
    if (meta) {
      photographer = {
        name: meta.business_name ?? meta.name ?? null,
        logo: meta.logo ?? null,
        username: meta.username ?? null,
      }
    }
  }

  // Fetch watermark if enabled and gallery has one assigned
  let watermarkData: VendorShareWatermark | null = null
  if (share.watermark && galleryRow?.watermark_id) {
    const { data: wm } = await supabase
      .from('watermarks')
      .select('*')
      .eq('id', galleryRow.watermark_id)
      .single()
    if (wm) {
      watermarkData = {
        type: wm.type as 'text' | 'image',
        text: wm.text ?? null,
        textColor: wm.text_color as 'white' | 'black',
        imageUrl: wm.image_url ? getStorageUrl(wm.image_url) : null,
        scale: wm.scale,
        opacity: wm.opacity,
        position: wm.position,
      }
    }
  }

  const prefs = galleryRow?.preferences as Record<string, unknown> | null
  const colorTheme = (typeof prefs?.colorTheme === 'string' ? prefs.colorTheme : 'dark')
  const customColorTheme = (typeof prefs?.customColorTheme === 'string' ? prefs.customColorTheme : null)

  return {
    id: share.id,
    galleryId: share.gallery_id,
    vendorName: share.vendor_name,
    vendorType: share.vendor_type,
    imageIds: share.image_ids as string[],
    watermark: share.watermark,
    expiresAt: share.expires_at ?? null,
    createdAt: share.created_at,
    images,
    photographer,
    watermarkData,
    colorTheme,
    customColorTheme,
  }
}
