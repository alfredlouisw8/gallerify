-- =============================================
-- Migration 016: Onboarding fields + fix trigger regression
--
-- Migration 006 rewrote handle_new_user() but accidentally removed
-- plan / trial_ends_at / subscription_status from the INSERT, causing
-- all Google-OAuth users created after that migration to have NULL
-- trial_ends_at (which renders as "trial expired" immediately).
-- This migration restores those fields and adds onboarding columns.
-- =============================================

-- 1. Add onboarding-specific columns
ALTER TABLE public.user_metadata
  ADD COLUMN IF NOT EXISTS business_name       TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS location            TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Fix the trigger — restore billing fields lost in migration 006
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter        INT := 0;
  display_name   TEXT;
BEGIN
  base_username := LOWER(SPLIT_PART(NEW.email, '@', 1));
  base_username := REGEXP_REPLACE(base_username, '[^a-z0-9]', '-', 'g');
  base_username := TRIM(BOTH '-' FROM base_username);
  IF base_username = '' THEN base_username := 'user'; END IF;

  final_username := base_username;

  WHILE EXISTS (
    SELECT 1 FROM public.user_metadata WHERE username = final_username
  ) LOOP
    counter        := counter + 1;
    final_username := base_username || '-' || counter::TEXT;
  END LOOP;

  display_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name'
  );

  INSERT INTO public.user_metadata (
    user_id,
    username,
    name,
    plan,
    trial_ends_at,
    subscription_status,
    onboarding_completed
  )
  VALUES (
    NEW.id,
    final_username,
    display_name,
    'free_trial',
    NOW() + INTERVAL '14 days',
    'trialing',
    FALSE
  )
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Backfill users whose trial_ends_at was lost due to the 006 regression
UPDATE public.user_metadata
SET
  plan                = 'free_trial',
  trial_ends_at       = NOW() + INTERVAL '14 days',
  subscription_status = 'trialing'
WHERE trial_ends_at IS NULL
  AND ls_subscription_id IS NULL;
