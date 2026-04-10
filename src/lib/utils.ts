import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Extract the public URL from a stored image JSON string.
 * Stored format: {"path":"...","url":"https://...supabase.co/storage/..."}
 */
export function getStorageUrl(file: string): string {
  try {
    const parsed = JSON.parse(file) as { url?: string }
    if (typeof parsed?.url === 'string' && parsed.url.length > 0) {
      return parsed.url
    }
  } catch {
    // Not JSON — often already a plain https URL
  }
  return file
}

/**
 * @deprecated Use getStorageUrl instead.
 * Kept for backward compatibility during transition.
 */
export const getCloudinaryUrl = getStorageUrl
