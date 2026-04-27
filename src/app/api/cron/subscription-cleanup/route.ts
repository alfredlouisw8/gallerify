import {
  DeleteObjectsCommand,
  ListObjectsV2Command,
} from '@aws-sdk/client-s3'
import { NextResponse } from 'next/server'

import { isDataDeletionDue, SubscriptionStatus } from '@/lib/plans'
import { r2, R2_BUCKET } from '@/lib/r2'
import supabase from '@/lib/supabase'

export const runtime = 'nodejs'
export const maxDuration = 300

export async function GET(request: Request) {
  // Vercel sends Authorization: Bearer <CRON_SECRET> for scheduled cron invocations.
  // We also accept a manual call with the same header for testing.
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const results = {
    backfilled: 0,
    deleted: 0,
    errors: [] as string[],
  }

  // ── Step 1: backfill subscription_expired_at for any missed webhook ──────────
  // Users with status=expired but no timestamp (webhook missed or old records)
  const { data: missing, error: missingErr } = await supabase
    .from('user_metadata')
    .select('user_id')
    .eq('subscription_status', SubscriptionStatus.EXPIRED)
    .is('subscription_expired_at', null)

  if (missingErr) {
    results.errors.push(`backfill-query: ${missingErr.message}`)
  } else if (missing?.length) {
    const { error: backfillErr } = await supabase
      .from('user_metadata')
      .update({ subscription_expired_at: new Date().toISOString() })
      .eq('subscription_status', SubscriptionStatus.EXPIRED)
      .is('subscription_expired_at', null)

    if (backfillErr) {
      results.errors.push(`backfill-update: ${backfillErr.message}`)
    } else {
      results.backfilled = missing.length
    }
  }

  // ── Step 2: find candidates for data deletion ────────────────────────────────
  // We fetch all expired/trialing users and let isDataDeletionDue() decide
  // whether 60 days have passed, to keep the SQL simple.
  const { data: candidates, error: candidatesErr } = await supabase
    .from('user_metadata')
    .select('user_id, plan, subscription_status, subscription_expired_at, trial_ends_at')
    .in('subscription_status', [SubscriptionStatus.TRIALING, SubscriptionStatus.EXPIRED, SubscriptionStatus.PAST_DUE])

  if (candidatesErr) {
    results.errors.push(`candidates-query: ${candidatesErr.message}`)
    return NextResponse.json(results, { status: 207 })
  }

  const due = (candidates ?? []).filter((u) =>
    isDataDeletionDue(u.subscription_status, u.trial_ends_at, u.subscription_expired_at)
  )

  // ── Step 3: delete each user's data ─────────────────────────────────────────
  for (const user of due) {
    try {
      await deleteUserData(user.user_id)
      results.deleted++
    } catch (err) {
      results.errors.push(`user-${user.user_id}: ${String(err)}`)
    }
  }

  return NextResponse.json(results, { status: 200 })
}

async function deleteUserData(userId: string) {
  // 1. Delete all R2 objects under the user's folder prefix
  await deleteR2Prefix(`${userId}/`)

  // 2. Delete all galleries from DB (cascade removes categories + images rows)
  const { error: galErr } = await supabase
    .from('galleries')
    .delete()
    .eq('user_id', userId)

  if (galErr) throw new Error(`galleries-delete: ${galErr.message}`)

  // 3. Clear profile images and reset storage counter in user_metadata
  const { error: metaErr } = await supabase
    .from('user_metadata')
    .update({
      banner_image: null,
      about_image: null,
      logo: null,
      storage_used_bytes: 0,
    })
    .eq('user_id', userId)

  if (metaErr) throw new Error(`meta-update: ${metaErr.message}`)
}

async function deleteR2Prefix(prefix: string) {
  let continuationToken: string | undefined

  do {
    const list = await r2.send(
      new ListObjectsV2Command({
        Bucket: R2_BUCKET,
        Prefix: prefix,
        ContinuationToken: continuationToken,
      })
    )

    const keys = (list.Contents ?? []).map((obj) => ({ Key: obj.Key! }))

    if (keys.length > 0) {
      await r2.send(
        new DeleteObjectsCommand({
          Bucket: R2_BUCKET,
          Delete: { Objects: keys, Quiet: true },
        })
      )
    }

    continuationToken = list.IsTruncated ? list.NextContinuationToken : undefined
  } while (continuationToken)
}
