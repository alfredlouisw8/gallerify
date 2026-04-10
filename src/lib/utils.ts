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
    return JSON.parse(file).url as string
  } catch {
    // Fallback: if it's already a plain URL return as-is
    return file
  }
}

/**
 * @deprecated Use getStorageUrl instead.
 * Kept for backward compatibility during transition.
 */
export const getCloudinaryUrl = getStorageUrl
