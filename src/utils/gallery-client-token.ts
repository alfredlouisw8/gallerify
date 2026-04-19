import { createHmac } from 'crypto'

/** Cookie that stores the HMAC token after client authenticates. */
export function clientTokenCookieName(galleryId: string): string {
  return `gal_client_${galleryId}`
}

/** Cookie that remembers whether this browser chose 'client' or 'viewer'. */
export function roleCookieName(galleryId: string): string {
  return `gal_role_${galleryId}`
}

export function computeClientToken(galleryId: string, clientPasswordHash: string): string {
  const secret = process.env.NEXTAUTH_SECRET ?? 'dev-fallback-secret'
  return createHmac('sha256', secret)
    .update(`client:${galleryId}:${clientPasswordHash}`)
    .digest('hex')
}
