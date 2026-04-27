-- Migration 023: Track when a paid subscription expired
-- Used by the daily cleanup worker to enforce the 7-day gallery grace period
-- and delete data at day 60.

ALTER TABLE public.user_metadata
  ADD COLUMN IF NOT EXISTS subscription_expired_at TIMESTAMPTZ;

-- Backfill: any row already marked expired but missing the timestamp
-- gets NOW() as a conservative estimate (prevents immediate deletion of existing expired users)
UPDATE public.user_metadata
SET subscription_expired_at = NOW()
WHERE subscription_status = 'expired'
  AND subscription_expired_at IS NULL;
