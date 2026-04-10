import { uploadToStorage } from './storage'

/**
 * Upload files to Supabase Storage.
 * Returns array of JSON strings: {"path":"...","url":"..."}
 */
export const onImagesUpload = async (
  files: File[],
  folder: string = 'uploads'
): Promise<string[] | undefined> => {
  try {
    const formData = new FormData()
    files.forEach((file) => formData.append('images', file))

    return await uploadToStorage(formData, folder)
  } catch (error) {
    console.error('Storage Upload Error:', error)
    return undefined
  }
}
