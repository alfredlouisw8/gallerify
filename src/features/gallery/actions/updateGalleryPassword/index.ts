'use server'

import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

import { createClient } from '@/lib/supabase-server'
import supabase from '@/lib/supabase'
import { computeGalleryToken, galleryTokenCookieName } from '@/utils/gallery-password-token'

/**
 * Set a new password on a gallery (pass null to remove password protection).
 * Also clears the access cookie so the owner isn't locked out.
 */
export async function updateGalleryPassword(
  galleryId: string,
  password: string | null
): Promise<{ error?: string }> {
  const authClient = await createClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  try {
    let passwordHash: string | null = null

    const plainText = password !== null && password.trim().length > 0 ? password.trim() : null
    if (plainText) {
      passwordHash = await bcrypt.hash(plainText, 10)
    }

    const { error } = await supabase
      .from('galleries')
      .update({ password_hash: passwordHash, password_plain: plainText, updated_at: new Date().toISOString() })
      .eq('id', galleryId)

    if (error) throw new Error(error.message)

    // If a new password is set, plant the cookie so the owner can keep browsing.
    const cookieStore = await cookies()
    const cookieName = galleryTokenCookieName(galleryId)

    if (passwordHash) {
      const token = computeGalleryToken(galleryId, passwordHash)
      cookieStore.set(cookieName, token, {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
      })
    } else {
      // Password removed — clear the cookie
      cookieStore.delete(cookieName)
    }

    revalidatePath(`/gallery/${galleryId}`)
    return {}
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'Failed to update password' }
  }
}
