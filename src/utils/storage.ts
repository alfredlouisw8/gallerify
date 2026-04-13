/**
 * Extract the storage path from a stored JSON image string.
 * Stored as: {"path":"userId/filename.jpg","url":"https://...","size":12345}
 */
export function getStoragePath(jsonString: string): string {
  try {
    return JSON.parse(jsonString).path as string
  } catch {
    return jsonString
  }
}

/**
 * Extract the byte size from a stored JSON image string.
 * Returns 0 if size is not stored (e.g. older records).
 */
export function getStorageSize(jsonString: string): number {
  try {
    return (JSON.parse(jsonString).size as number) ?? 0
  } catch {
    return 0
  }
}

/**
 * Sum byte sizes across an array of stored JSON image strings.
 */
export function sumStorageSizes(jsonStrings: string[]): number {
  return jsonStrings.reduce((total, s) => total + getStorageSize(s), 0)
}
