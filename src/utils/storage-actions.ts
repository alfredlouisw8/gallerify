'use server'

import { createClient } from '@/lib/supabase-server'
import supabase from '@/lib/supabase'
import { getPlanLimits, isTrialExpired } from '@/lib/plans'

const BUCKET = 'images'

const VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/webm',
  'video/ogg',
]

/**
 * Upload multiple files to Supabase Storage.
 * Enforces plan limits (storage quota, video restriction, trial expiry) before uploading.
 * Increments the user's storage_used_bytes after a successful upload.
 * Returns an array of JSON strings: {"path":"...","url":"..."}
 */
export async function uploadToStorage(
  formData: FormData,
  folder: string = 'uploads'
): Promise<string[]> {
  const files = formData.getAll('images') as File[]
  if (!files.length) throw new Error('No files found')

  // --- Plan enforcement ---
  const authClient = await createClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()

  if (user) {
    const { data: meta } = await supabase
      .from('user_metadata')
      .select('plan, trial_ends_at, storage_used_bytes')
      .eq('user_id', user.id)
      .single()

    if (meta) {
      const limits = getPlanLimits(meta.plan)

      // Check trial expiry
      if (meta.plan === 'free_trial' && isTrialExpired(meta.trial_ends_at)) {
        throw new Error(
          'Your free trial has expired. Please upgrade to continue uploading.'
        )
      }

      // Check video files
      const hasVideo = files.some((f) => VIDEO_MIME_TYPES.includes(f.type))
      if (hasVideo && !limits.videoAllowed) {
        throw new Error(
          `Video uploads are not available on the ${limits.label} plan. Upgrade to Pro Max to upload videos.`
        )
      }

      // Check storage quota
      const uploadBytes = files.reduce((sum, f) => sum + f.size, 0)
      const usedBytes = meta.storage_used_bytes ?? 0
      if (usedBytes + uploadBytes > limits.maxStorageBytes) {
        throw new Error(
          `Not enough storage. Your ${limits.label} plan includes ${limits.maxStorageLabel} total. Please upgrade or delete some files.`
        )
      }
    }
  }
  // --- End plan enforcement ---

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

    return { jsonUrl: JSON.stringify({ path: data.path, url: publicUrl }), size: file.size }
  })

  const results = await Promise.all(uploadPromises)

  // Increment storage usage (atomic — no read-then-write race)
  if (user) {
    const totalBytes = results.reduce((sum, r) => sum + r.size, 0)
    await supabase.rpc('increment_storage_usage', {
      p_user_id: user.id,
      p_bytes: totalBytes,
    })
  }

  return results.map((r) => r.jsonUrl)
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
