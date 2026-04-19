'use server'

import supabase from '@/lib/supabase'

export type ClientAccessSettings = {
  clientAccessEnabled: boolean
  isClientPasswordProtected: boolean
  clientPasswordPlain: string | null
  showClientSelects: boolean
}

export async function getClientAccessSettings(
  galleryId: string
): Promise<ClientAccessSettings> {
  const { data } = await supabase
    .from('galleries')
    .select('client_access_enabled, client_password_hash, client_password_plain, show_client_selects')
    .eq('id', galleryId)
    .single()

  const row = data as {
    client_access_enabled: boolean | null
    client_password_hash: string | null
    client_password_plain: string | null
    show_client_selects: boolean | null
  } | null

  return {
    clientAccessEnabled: !!row?.client_access_enabled,
    isClientPasswordProtected: !!row?.client_password_hash,
    clientPasswordPlain: row?.client_password_plain ?? null,
    showClientSelects: !!row?.show_client_selects,
  }
}
