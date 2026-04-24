'use server'

import crypto from 'crypto'
import { z } from 'zod'

import { createClient } from '@/lib/supabase-server'
import supabase from '@/lib/supabase'

const VENDOR_TYPES = ['florist', 'mua', 'venue', 'planner', 'other'] as const

const schema = z.object({
  galleryId: z.string().uuid(),
  vendorName: z.string().min(1).max(100),
  vendorType: z.enum(VENDOR_TYPES),
  imageIds: z.array(z.string().uuid()).min(1, 'Select at least one photo'),
  watermark: z.boolean(),
  expiresAt: z.string().nullable(),
})

export async function createVendorShare(
  input: z.infer<typeof schema>
): Promise<{ success: true; token: string } | { success: false; error: string }> {
  const parsed = schema.safeParse(input)
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message }

  const authClient = await createClient()
  const { data: { user } } = await authClient.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { data: gallery } = await supabase
    .from('galleries')
    .select('id')
    .eq('id', parsed.data.galleryId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (!gallery) return { success: false, error: 'Gallery not found' }

  const token = crypto.randomBytes(6).toString('hex') // 12-char unique slug

  const { data, error } = await supabase
    .from('vendor_shares')
    .insert({
      gallery_id: parsed.data.galleryId,
      vendor_name: parsed.data.vendorName,
      vendor_type: parsed.data.vendorType,
      image_ids: parsed.data.imageIds,
      token,
      watermark: parsed.data.watermark,
      expires_at: parsed.data.expiresAt,
    })
    .select('token')
    .single()

  if (error || !data) return { success: false, error: error?.message ?? 'Failed to create share' }

  return { success: true, token: data.token }
}
