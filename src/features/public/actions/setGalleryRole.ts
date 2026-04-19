'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { roleCookieName } from '@/utils/gallery-client-token'

export async function setGalleryRole(
  galleryId: string,
  role: 'viewer',
  redirectPath: string
): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(roleCookieName(galleryId), role, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  })
  redirect(redirectPath)
}
