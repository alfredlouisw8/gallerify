'use server'

import supabase from '@/lib/supabase'

export type DownloadSettings = {
  downloadEnabled: boolean
  downloadPinRequired: boolean
  downloadPin: string | null
}

export async function getDownloadSettings(galleryId: string): Promise<DownloadSettings> {
  const { data } = await supabase
    .from('galleries')
    .select('download_enabled, download_pin')
    .eq('id', galleryId)
    .single()

  const row = data as { download_enabled: boolean | null; download_pin: string | null } | null

  return {
    downloadEnabled: !!row?.download_enabled,
    downloadPinRequired: !!row?.download_enabled && !!row?.download_pin,
    downloadPin: row?.download_pin ?? null,
  }
}
