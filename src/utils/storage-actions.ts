'use server'

import { DeleteObjectsCommand, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

import { getPlanLimits, isTrialExpired, getEffectivePlan, Plan } from '@/lib/plans'
import { r2, R2_BUCKET } from '@/lib/r2'
import supabase from '@/lib/supabase'
import { createClient } from '@/lib/supabase-server'

const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL!

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

    if (effectivePlan === Plan.FREE_TRIAL && isTrialExpired(meta.trial_ends_at)) {
      throw new Error(
        'Your free trial has expired. Please upgrade to continue uploading.'
      )
    }

    const hasVideo = files.some((f) => VIDEO_MIME_TYPES.includes(f.type))
    if (hasVideo && !limits.videoAllowed) {
      throw new Error(
        'Video uploads are not available on your current plan. Upgrade to Pro or Pro Max to upload videos.'
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

    await r2.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: storagePath,
        Body: buffer,
        ContentType: file.type,
      })
    )

    const publicUrl = `${R2_PUBLIC_URL}/${storagePath}`

    return {
      jsonUrl: JSON.stringify({ path: storagePath, url: publicUrl, size: file.size }),
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
 * Validates plan limits server-side and returns presigned R2 PUT URLs.
 * File bytes never pass through Next.js — the client uploads directly to R2.
 * Checks both storage quota and total video time quota.
 */
export async function createSignedUploadUrls(
  files: { name: string; size: number; type: string; durationSeconds?: number }[],
  folder: string = 'uploads'
): Promise<{ userId: string; uploads: { path: string; presignedUrl: string }[] }> {
  if (!files.length) throw new Error('No files provided')

  const authClient = await createClient()
  const {
    data: { user },
  } = await authClient.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: meta } = await supabase
    .from('user_metadata')
    .select(
      'plan, trial_ends_at, storage_used_bytes, video_used_seconds, subscription_status, current_period_end'
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

    if (effectivePlan === Plan.FREE_TRIAL && isTrialExpired(meta.trial_ends_at)) {
      throw new Error(
        'Your free trial has expired. Please upgrade to continue uploading.'
      )
    }

    const hasVideo = files.some((f) => VIDEO_MIME_TYPES.includes(f.type))
    if (hasVideo && !limits.videoAllowed) {
      throw new Error(
        'Video uploads are not available on your current plan. Upgrade to Pro or Pro Max to upload videos.'
      )
    }

    if (hasVideo && limits.maxVideoDurationSeconds > 0) {
      const newVideoSeconds = files
        .filter((f) => VIDEO_MIME_TYPES.includes(f.type))
        .reduce((sum, f) => sum + (f.durationSeconds ?? 0), 0)
      const usedVideoSeconds = (meta.video_used_seconds as number) ?? 0
      if (usedVideoSeconds + newVideoSeconds > limits.maxVideoDurationSeconds) {
        const remainingMin = Math.max(
          0,
          Math.floor((limits.maxVideoDurationSeconds - usedVideoSeconds) / 60)
        )
        throw new Error(
          `Not enough video time remaining. You have ${remainingMin} min left on your ${limits.label} plan. Please upgrade or delete existing videos.`
        )
      }
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

      const presignedUrl = await getSignedUrl(
        r2,
        new PutObjectCommand({ Bucket: R2_BUCKET, Key: path, ContentType: file.type }),
        { expiresIn: 3600 }
      )

      return { path, presignedUrl }
    })
  )

  return { userId: user.id, uploads }
}

/**
 * Increments the user's storage and video usage after a successful direct client upload.
 */
export async function recordUploadedFiles(
  userId: string,
  totalBytes: number,
  totalVideoSeconds: number = 0
): Promise<void> {
  const promises: PromiseLike<unknown>[] = []
  if (totalBytes > 0) {
    promises.push(
      supabase.rpc('increment_storage_usage', { p_user_id: userId, p_bytes: totalBytes })
    )
  }
  if (totalVideoSeconds > 0) {
    promises.push(
      supabase.rpc('increment_video_usage', { p_user_id: userId, p_seconds: totalVideoSeconds })
    )
  }
  await Promise.all(promises)
}

/**
 * Delete files from R2 by their storage paths.
 * Paths are extracted from the stored JSON strings via getStoragePath().
 */
export async function deleteFromStorage(paths: string[]): Promise<void> {
  if (!paths.length) return
  await r2.send(
    new DeleteObjectsCommand({
      Bucket: R2_BUCKET,
      Delete: {
        Objects: paths.map((Key) => ({ Key })),
        Quiet: true,
      },
    })
  )
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

/**
 * Decrement the owner's video usage by the given second count.
 * Safe to call with 0 seconds (no-op).
 */
export async function decrementVideoUsage(
  userId: string,
  seconds: number
): Promise<void> {
  if (seconds <= 0) return
  await supabase.rpc('decrement_video_usage', {
    p_user_id: userId,
    p_seconds: seconds,
  })
}
