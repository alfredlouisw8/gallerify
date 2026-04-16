import { createClient } from '@/lib/supabase-browser'

import { createSignedUploadUrls, recordUploadedFiles } from './storage-actions'

const BUCKET = 'images'
const UPLOAD_CONCURRENCY = 4

/**
 * Run an array of async tasks with a maximum concurrency.
 * Avoids firing hundreds of requests simultaneously on large batches.
 */
async function withConcurrency<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number
): Promise<T[]> {
  const results: T[] = new Array(tasks.length)
  let index = 0

  async function worker() {
    while (index < tasks.length) {
      const i = index++
      results[i] = await tasks[i]()
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, tasks.length) }, worker)
  await Promise.all(workers)
  return results
}

/**
 * Upload files directly from the browser to Supabase Storage.
 *
 * Flow:
 *  1. Server validates plan limits and issues one-time signed upload tokens.
 *     Only file metadata (name, size, type) is sent to the server — no bytes.
 *  2. Browser uploads each file directly to Supabase using its token.
 *     Next.js is never in the data path, so there is no 413 / body-size limit.
 *  3. Uploads run UPLOAD_CONCURRENCY at a time to avoid overwhelming the
 *     browser or hitting Supabase rate limits on large batches.
 *  4. Server records the added storage usage.
 *
 * Returns an array of JSON strings: {"path":"...","url":"...","size":...}
 */
export const onImagesUpload = async (
  files: File[],
  folder: string = 'uploads',
  onProgress?: (uploaded: number, total: number) => void
): Promise<string[]> => {
  if (!files.length) return []

  // 1. Validate plan limits & get signed tokens (server-side, metadata only)
  const { userId, uploads } = await createSignedUploadUrls(
    files.map((f) => ({ name: f.name, size: f.size, type: f.type })),
    folder
  )

  // 2. Upload files directly from the browser, UPLOAD_CONCURRENCY at a time
  const supabaseClient = createClient()
  let uploaded = 0

  const tasks = files.map((file, i) => async () => {
    const { path, token } = uploads[i]

    const { data, error } = await supabaseClient.storage
      .from(BUCKET)
      .uploadToSignedUrl(path, token, file, { contentType: file.type })

    if (error) throw new Error(`Upload failed for "${file.name}": ${error.message}`)

    const {
      data: { publicUrl },
    } = supabaseClient.storage.from(BUCKET).getPublicUrl(data.path)

    uploaded++
    onProgress?.(uploaded, files.length)

    return {
      jsonUrl: JSON.stringify({ path: data.path, url: publicUrl, size: file.size }),
      size: file.size,
    }
  })

  const results = await withConcurrency(tasks, UPLOAD_CONCURRENCY)

  // 3. Record total storage usage server-side
  const totalBytes = results.reduce((sum, r) => sum + r.size, 0)
  await recordUploadedFiles(userId, totalBytes)

  return results.map((r) => r.jsonUrl)
}
