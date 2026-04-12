-- =============================================
-- Migration 003: Subscription / Billing (Lemon Squeezy)
--
-- Run this AFTER 002_supabase_auth.sql
-- =============================================

-- 1. Add plan & billing columns to user_metadata
ALTER TABLE public.user_metadata
  ADD COLUMN IF NOT EXISTS plan                TEXT        NOT NULL DEFAULT 'free_trial',
  ADD COLUMN IF NOT EXISTS trial_ends_at       TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS storage_used_bytes  BIGINT      NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ls_customer_id      TEXT,
  ADD COLUMN IF NOT EXISTS ls_subscription_id  TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status TEXT        NOT NULL DEFAULT 'trialing',
  ADD COLUMN IF NOT EXISTS current_period_end  TIMESTAMPTZ;

-- 2. Update the existing trigger so new users get a trial_ends_at
--    (14 days from signup)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INT := 0;
BEGIN
  base_username := LOWER(SPLIT_PART(NEW.email, '@', 1));
  base_username := REGEXP_REPLACE(base_username, '[^a-z0-9]', '-', 'g');
  base_username := TRIM(BOTH '-' FROM base_username);
  IF base_username = '' THEN base_username := 'user'; END IF;

  final_username := base_username;

  WHILE EXISTS (
    SELECT 1 FROM public.user_metadata WHERE username = final_username
  ) LOOP
    counter := counter + 1;
    final_username := base_username || '-' || counter::TEXT;
  END LOOP;

  INSERT INTO public.user_metadata (
    user_id,
    username,
    plan,
    trial_ends_at,
    subscription_status
  )
  VALUES (
    NEW.id,
    final_username,
    'free_trial',
    NOW() + INTERVAL '14 days',
    'trialing'
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Helper: atomically increment storage usage (avoids read-then-write races)
CREATE OR REPLACE FUNCTION public.increment_storage_usage(p_user_id UUID, p_bytes BIGINT)
RETURNS void AS $$
BEGIN
  UPDATE public.user_metadata
  SET storage_used_bytes = storage_used_bytes + p_bytes
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Backfill existing users who signed up before this migration
--    Give them 14 days from now so they aren't instantly expired.
UPDATE public.user_metadata
SET
  plan                = 'free_trial',
  trial_ends_at       = NOW() + INTERVAL '14 days',
  subscription_status = 'trialing'
WHERE trial_ends_at IS NULL;
