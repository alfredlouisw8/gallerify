import { uploadToStorage } from './storage-actions'

/**
 * Upload files to Supabase Storage.
 * Returns array of JSON strings: {"path":"...","url":"..."}
 */
/**
 * Throws with the server's error message on failure so callers can surface it directly.
 */
export const onImagesUpload = async (
  files: File[],
  folder: string = 'uploads'
): Promise<string[]> => {
  const formData = new FormData()
  files.forEach((file) => formData.append('images', file))
  return await uploadToStorage(formData, folder)
}
