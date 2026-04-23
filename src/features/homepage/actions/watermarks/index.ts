'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'

import { createClient } from '@/lib/supabase-server'
import supabase from '@/lib/supabase'
import { Watermark, WatermarkRow, mapWatermark } from '@/types'

const VALID_POSITIONS = [
  'top-left', 'top-center', 'top-right',
  'center-left', 'center', 'center-right',
  'bottom-left', 'bottom-center', 'bottom-right',
]

const WatermarkSchema = z.object({
  name: z.string().min(1, 'Name is required').max(80),
  type: z.enum(['text', 'image']),
  text: z.string().max(200).nullable(),
  textColor: z.enum(['white', 'black']),
  imageUrl: z.string().nullable(),
  scale: z.number().min(10).max(200),
  opacity: z.number().min(0).max(100),
  position: z.string().refine((v) => VALID_POSITIONS.includes(v), { message: 'Invalid position' }),
})

async function getAuthedUser() {
  const client = await createClient()
  const { data: { user } } = await client.auth.getUser()
  return user
}

export async function getWatermarks(): Promise<Watermark[]> {
  const user = await getAuthedUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('watermarks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error || !data) return []
  return (data as WatermarkRow[]).map(mapWatermark)
}

export async function createWatermark(
  input: z.infer<typeof WatermarkSchema>
): Promise<{ success: true; data: Watermark } | { success: false; error: string }> {
  const parsed = WatermarkSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message }

  const user = await getAuthedUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { name, type, text, textColor, imageUrl, scale, opacity, position } = parsed.data

  const { data, error } = await supabase
    .from('watermarks')
    .insert({
      user_id: user.id,
      name,
      type,
      text,
      text_color: textColor,
      image_url: imageUrl,
      scale,
      opacity,
      position,
    })
    .select()
    .single()

  if (error || !data) return { success: false, error: error?.message ?? 'Failed to create watermark' }

  revalidatePath('/homepage')
  return { success: true, data: mapWatermark(data as WatermarkRow) }
}

export async function updateWatermark(
  id: string,
  input: z.infer<typeof WatermarkSchema>
): Promise<{ success: true; data: Watermark } | { success: false; error: string }> {
  const parsed = WatermarkSchema.safeParse(input)
  if (!parsed.success) return { success: false, error: parsed.error.errors[0].message }

  const user = await getAuthedUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { name, type, text, textColor, imageUrl, scale, opacity, position } = parsed.data

  const { data, error } = await supabase
    .from('watermarks')
    .update({
      name,
      type,
      text,
      text_color: textColor,
      image_url: imageUrl,
      scale,
      opacity,
      position,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error || !data) return { success: false, error: error?.message ?? 'Failed to update watermark' }

  revalidatePath('/homepage')
  return { success: true, data: mapWatermark(data as WatermarkRow) }
}

export async function deleteWatermark(
  id: string
): Promise<{ success: true } | { success: false; error: string }> {
  const user = await getAuthedUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase
    .from('watermarks')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { success: false, error: error.message }

  revalidatePath('/homepage')
  return { success: true }
}
