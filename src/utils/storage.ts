/**
 * Extract the storage path from a stored JSON image string.
 * Stored as: {"path":"gallery-banners/userId/filename.jpg","url":"https://..."}
 */
export function getStoragePath(jsonString: string): string {
  try {
    return JSON.parse(jsonString).path as string
  } catch {
    return jsonString
  }
}
