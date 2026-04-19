'use server'

import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import supabase from '@/lib/supabase'
import { roleCookieName } from '@/utils/gallery-client-token'
import { computeGalleryToken, galleryTokenCookieName } from '@/utils/gallery-password-token'

export async function verifyGalleryPasswordAsViewer(
  galleryId: string,
  password: string,
  redirectPath: string
): Promise<{ error: string }> {
  const { data: row } = await supabase
    .from('galleries')
    .select('password_hash')
    .eq('id', galleryId)
    .single()

  const passwordHash = (row as { password_hash?: string | null })?.password_hash ?? null

  if (!passwordHash) {
    // No password — just set viewer role and redirect
    const cookieStore = await cookies()
    cookieStore.set(roleCookieName(galleryId), 'viewer', {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    })
    redirect(redirectPath)
  }

  const valid = await bcrypt.compare(password, passwordHash)
  if (!valid) {
    return { error: 'Incorrect password. Please try again.' }
  }

  const cookieStore = await cookies()

  cookieStore.set(galleryTokenCookieName(galleryId), computeGalleryToken(galleryId, passwordHash), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })

  cookieStore.set(roleCookieName(galleryId), 'viewer', {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })

  redirect(redirectPath)
}
