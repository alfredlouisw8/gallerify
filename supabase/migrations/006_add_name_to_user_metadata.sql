-- =============================================
-- Migration 006: Add display name to user_metadata
-- =============================================

-- Add name column (public-facing display name, separate from username)
ALTER TABLE public.user_metadata
  ADD COLUMN IF NOT EXISTS name TEXT;

-- Backfill: set name from auth.users raw_user_meta_data for existing rows
UPDATE public.user_metadata um
SET name = COALESCE(
  (au.raw_user_meta_data->>'full_name'),
  (au.raw_user_meta_data->>'name')
)
FROM auth.users au
WHERE au.id = um.user_id
  AND um.name IS NULL;

-- Update trigger to also capture name on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  counter INT := 0;
  display_name TEXT;
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

  -- Capture display name from OAuth metadata
  display_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name'
  );

  -- Insert user_metadata row
  INSERT INTO public.user_metadata (user_id, username, name)
  VALUES (NEW.id, final_username, display_name)
  ON CONFLICT (user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
