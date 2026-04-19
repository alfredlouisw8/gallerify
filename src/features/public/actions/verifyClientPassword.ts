'use server'

import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import supabase from '@/lib/supabase'
import {
  computeClientToken,
  clientTokenCookieName,
  roleCookieName,
} from '@/utils/gallery-client-token'

export async function verifyClientPassword(
  galleryId: string,
  password: string,
  redirectPath: string
): Promise<{ error: string }> {
  const { data: row } = await supabase
    .from('galleries')
    .select('client_password_hash')
    .eq('id', galleryId)
    .single()

  const clientPasswordHash =
    (row as { client_password_hash?: string | null })?.client_password_hash ?? null

  if (!clientPasswordHash) {
    redirect(redirectPath)
  }

  const valid = await bcrypt.compare(password, clientPasswordHash)
  if (!valid) {
    return { error: 'Incorrect password. Please try again.' }
  }

  const token = computeClientToken(galleryId, clientPasswordHash)
  const cookieStore = await cookies()

  const cookieOpts = {
    httpOnly: true,
    sameSite: 'lax' as const,
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  }

  cookieStore.set(clientTokenCookieName(galleryId), token, cookieOpts)
  cookieStore.set(roleCookieName(galleryId), 'client', cookieOpts)

  redirect(redirectPath)
}
