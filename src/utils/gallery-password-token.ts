import { createHmac } from 'crypto'

/**
 * Computes a gallery access token based on galleryId + passwordHash.
 * Changing the password invalidates all existing tokens.
 * Cannot be forged without knowing both values and the server secret.
 */
export function computeGalleryToken(galleryId: string, passwordHash: string): string {
  const secret = process.env.NEXTAUTH_SECRET ?? 'dev-fallback-secret'
  return createHmac('sha256', secret)
    .update(`${galleryId}:${passwordHash}`)
    .digest('hex')
}

export function galleryTokenCookieName(galleryId: string): string {
  return `gal_${galleryId}`
}
