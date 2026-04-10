'use server'

import supabase from '@/lib/supabase'

const BUCKET = 'images'

/**
 * Upload multiple files to Supabase Storage.
 * Returns an array of JSON strings: {"path":"...","url":"..."}
 * (Same shape as the old Cloudinary {"publicId":"...","url":"..."})
 */
export async function uploadToStorage(
  formData: FormData,
  folder: string = 'uploads'
): Promise<string[]> {
  const files = formData.getAll('images') as File[]
  if (!files.length) throw new Error('No files found')

  const uploadPromises = files.map(async (file) => {
    const ext = file.name.split('.').pop() ?? 'jpg'
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    const storagePath = `${folder}/${uniqueName}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      })

    if (error) throw new Error(`Upload failed: ${error.message}`)

    const {
      data: { publicUrl },
    } = supabase.storage.from(BUCKET).getPublicUrl(data.path)

    return JSON.stringify({
      path: data.path,
      url: publicUrl,
    })
  })

  return await Promise.all(uploadPromises)
}

/**
 * Delete files from Supabase Storage by their storage paths.
 * Paths are extracted from the stored JSON strings.
 */
export async function deleteFromStorage(paths: string[]): Promise<void> {
  if (!paths.length) return

  const { error } = await supabase.storage.from(BUCKET).remove(paths)

  if (error) throw new Error(`Delete failed: ${error.message}`)
}

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
