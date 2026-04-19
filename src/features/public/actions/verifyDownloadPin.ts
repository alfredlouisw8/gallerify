'use server'

import supabase from '@/lib/supabase'

export async function verifyDownloadPin(
  galleryId: string,
  pin: string
): Promise<{ success: boolean; error?: string }> {
  const { data } = await supabase
    .from('galleries')
    .select('download_enabled, download_pin')
    .eq('id', galleryId)
    .single()

  const row = data as { download_enabled: boolean | null; download_pin: string | null } | null

  if (!row?.download_enabled) return { success: false, error: 'Downloads are not enabled.' }
  if (!row.download_pin) return { success: true }
  if (row.download_pin !== pin.trim()) return { success: false, error: 'Incorrect PIN.' }

  return { success: true }
}
