-- =============================================
-- Migration 002: Switch to Supabase Auth
--
-- Run this AFTER 001_initial_schema.sql
-- =============================================

-- 1. Add username to user_metadata (moved from custom users table)
ALTER TABLE public.user_metadata
  ADD COLUMN IF NOT EXISTS username TEXT UNIQUE;

-- 2. Update galleries FK to reference auth.users directly
ALTER TABLE public.galleries
  DROP CONSTRAINT IF EXISTS galleries_user_id_fkey;
ALTER TABLE public.galleries
  ADD CONSTRAINT galleries_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 3. Update user_metadata FK to reference auth.users directly
ALTER TABLE public.user_metadata
  DROP CONSTRAINT IF EXISTS user_metadata_user_id_fkey;
ALTER TABLE public.user_metadata
  ADD CONSTRAINT user_metadata_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 4. Drop NextAuth-specific tables (no longer needed)
DROP TABLE IF EXISTS public.verification_tokens CASCADE;
DROP TABLE IF EXISTS public.sessions CASCADE;
DROP TABLE IF EXISTS public.accounts CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- 5. Trigger: auto-create user_metadata with a unique username
--    when a new user signs in via Google OAuth for the first time.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INT := 0;
BEGIN
  -- Derive base username from email (part before @)
  base_username := LOWER(SPLIT_PART(NEW.email, '@', 1));
  -- Replace non-alphanumeric chars with hyphens
  base_username := REGEXP_REPLACE(base_username, '[^a-z0-9]', '-', 'g');
  -- Trim leading/trailing hyphens
  base_username := TRIM(BOTH '-' FROM base_username);
  -- Fallback
  IF base_username = '' THEN base_username := 'user'; END IF;

  final_username := base_username;

  -- Ensure uniqueness
  WHILE EXISTS (
    SELECT 1 FROM public.user_metadata WHERE username = final_username
  ) LOOP
    counter := counter + 1;
    final_username := base_username || '-' || counter::TEXT;
  END LOOP;

  -- Insert user_metadata row
  INSERT INTO public.user_metadata (user_id, username)
  VALUES (NEW.id, final_username)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
