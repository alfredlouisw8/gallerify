'use server'

import supabase from '@/lib/supabase'

export type PrivacySettings = {
  isPasswordProtected: boolean
  passwordPlain: string | null
}

export async function getPrivacySettings(galleryId: string): Promise<PrivacySettings> {
  const { data } = await supabase
    .from('galleries')
    .select('password_hash, password_plain')
    .eq('id', galleryId)
    .single()

  const row = data as { password_hash: string | null; password_plain: string | null } | null

  return {
    isPasswordProtected: !!row?.password_hash,
    passwordPlain: row?.password_plain ?? null,
  }
}
