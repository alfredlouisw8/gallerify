'use server'

import { getPlanLimits, isTrialExpired, getEffectivePlan } from '@/lib/plans'
import supabase from '@/lib/supabase'
import { createClient } from '@/lib/supabase-server'

const BUCKET = 'images'

const VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/quicktime',
  'video/x-msvideo',
  'video/webm',
  'video/ogg',
]

/**
 * Upload multiple files to Supabase Storage under the user's own folder.
 * Enforces plan limits (storage quota, video restriction, trial expiry) before uploading.
 * Increments the user's storage_used_bytes after a successful upload.
 * Returns an array of JSON strings: {"path":"userId/filename","url":"https://...","size":12345}
 */
export async function uploadToStorage(
  formData: FormData,
  folder: string = 'uploads'
): Promise<string[]> {
  const files = formData.getAll('images') as File[]
  if (!files.length) throw new Error('No files found')

  // --- Auth + plan enforcement ---
  const authClient = await createClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()

  if (!user) throw new Error('Unauthorized')

  const { data: meta } = await supabase
    .from('user_metadata')
    .select(
      'plan, trial_ends_at, storage_used_bytes, subscription_status, current_period_end'
    )
    .eq('user_id', user.id)
    .single()

  if (meta) {
    const effectivePlan = getEffectivePlan(
      meta.plan,
      meta.subscription_status,
      meta.current_period_end
    )
    const limits = getPlanLimits(effectivePlan)

    if (effectivePlan === 'free_trial' && isTrialExpired(meta.trial_ends_at)) {
      throw new Error(
        'Your free trial has expired. Please upgrade to continue uploading.'
      )
    }

    const hasVideo = files.some((f) => VIDEO_MIME_TYPES.includes(f.type))
    if (hasVideo && !limits.videoAllowed) {
      throw new Error(
        'Video uploads are not available on your current plan. Upgrade to Pro Max to upload videos.'
      )
    }

    const uploadBytes = files.reduce((sum, f) => sum + f.size, 0)
    const usedBytes = meta.storage_used_bytes ?? 0
    if (usedBytes + uploadBytes > limits.maxStorageBytes) {
      throw new Error(
        `Not enough storage. Your ${limits.label} plan includes ${limits.maxStorageLabel} total. Please upgrade or delete some files.`
      )
    }
  }
  // --- End plan enforcement ---

  const uploadPromises = files.map(async (file) => {
    const ext = file.name.split('.').pop() ?? 'jpg'
    const uniqueName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
    // Store under user's own folder so each user's files are isolated
    const storagePath = `${user.id}/${folder}/${uniqueName}`

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

    // Include size so we can decrement accurately on deletion
    return {
      jsonUrl: JSON.stringify({ path: data.path, url: publicUrl, size: file.size }),
      size: file.size,
    }
  })

  const results = await Promise.all(uploadPromises)

  // Increment storage usage atomically
  const totalBytes = results.reduce((sum, r) => sum + r.size, 0)
  await supabase.rpc('increment_storage_usage', {
    p_user_id: user.id,
    p_bytes: totalBytes,
  })

  return results.map((r) => r.jsonUrl)
}

/**
 * Validates plan limits server-side and returns one-time signed upload tokens.
 * File bytes never pass through Next.js — the client uploads directly to Supabase.
 */
export async function createSignedUploadUrls(
  files: { name: string; size: number; type: string }[],
  folder: string = 'uploads'
): Promise<{ userId: string; uploads: { path: string; token: string }[] }> {
  if (!files.length) throw new Error('No files provided')

  const authClient = await createClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: meta } = await supabase
    .from('user_metadata')
    .select(
      'plan, trial_ends_at, storage_used_bytes, subscription_status, current_period_end'
    )
    .eq('user_id', user.id)
    .single()

  if (meta) {
    const effectivePlan = getEffectivePlan(
      meta.plan,
      meta.subscription_status,
      meta.current_period_end
    )
    const limits = getPlanLimits(effectivePlan)

    if (effectivePlan === 'free_trial' && isTrialExpired(meta.trial_ends_at)) {
      throw new Error(
        'Your free trial has expired. Please upgrade to continue uploading.'
      )
    }

    const hasVideo = files.some((f) => VIDEO_MIME_TYPES.includes(f.type))
    if (hasVideo && !limits.videoAllowed) {
      throw new Error(
        'Video uploads are not available on your current plan. Upgrade to Pro Max to upload videos.'
      )
    }

    const uploadBytes = files.reduce((sum, f) => sum + f.size, 0)
    const usedBytes = meta.storage_used_bytes ?? 0
    if (usedBytes + uploadBytes > limits.maxStorageBytes) {
      throw new Error(
        `Not enough storage. Your ${limits.label} plan includes ${limits.maxStorageLabel} total. Please upgrade or delete some files.`
      )
    }
  }

  const uploads = await Promise.all(
    files.map(async (file, i) => {
      const ext = file.name.split('.').pop() ?? 'jpg'
      const uniqueName = `${Date.now()}-${i}-${Math.random().toString(36).slice(2)}.${ext}`
      const path = `${user.id}/${folder}/${uniqueName}`

      const { data, error } = await supabase.storage
        .from(BUCKET)
        .createSignedUploadUrl(path)

      if (error || !data) {
        throw new Error(`Failed to create upload URL: ${error?.message}`)
      }

      return { path, token: data.token }
    })
  )

  return { userId: user.id, uploads }
}

/**
 * Increments the user's storage usage after a successful direct client upload.
 */
export async function recordUploadedFiles(
  userId: string,
  totalBytes: number
): Promise<void> {
  if (totalBytes <= 0) return
  await supabase.rpc('increment_storage_usage', {
    p_user_id: userId,
    p_bytes: totalBytes,
  })
}

/**
 * Delete files from Supabase Storage by their storage paths.
 * Paths are extracted from the stored JSON strings via getStoragePath().
 */
export async function deleteFromStorage(paths: string[]): Promise<void> {
  if (!paths.length) return
  const { error } = await supabase.storage.from(BUCKET).remove(paths)
  if (error) throw new Error(`Delete failed: ${error.message}`)
}

/**
 * Decrement the owner's storage usage by the given byte count.
 * Safe to call with 0 bytes (no-op).
 */
export async function decrementStorageUsage(
  userId: string,
  bytes: number
): Promise<void> {
  if (bytes <= 0) return
  await supabase.rpc('decrement_storage_usage', {
    p_user_id: userId,
    p_bytes: bytes,
  })
}
