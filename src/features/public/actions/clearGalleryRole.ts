'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { clientTokenCookieName, roleCookieName } from '@/utils/gallery-client-token'

export async function clearGalleryRole(galleryId: string, redirectPath: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(roleCookieName(galleryId))
  cookieStore.delete(clientTokenCookieName(galleryId))
  redirect(redirectPath)
}
