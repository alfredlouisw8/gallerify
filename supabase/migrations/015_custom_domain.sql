-- Migration 015: Add custom_domain to user_metadata

ALTER TABLE public.user_metadata
  ADD COLUMN IF NOT EXISTS custom_domain TEXT UNIQUE;

-- Index for fast middleware lookups (only indexes non-null values)
CREATE INDEX IF NOT EXISTS idx_user_metadata_custom_domain
  ON public.user_metadata(custom_domain)
  WHERE custom_domain IS NOT NULL;

-- Allow anon role to read username + custom_domain for public portfolio routing.
-- This is needed so the Edge middleware can resolve custom domains using the
-- publishable (anon) key without requiring the service role key.
ALTER TABLE public.user_metadata ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'user_metadata' AND policyname = 'Public read username and custom_domain'
  ) THEN
    CREATE POLICY "Public read username and custom_domain"
      ON public.user_metadata
      FOR SELECT
      TO anon, authenticated
      USING (true);
  END IF;
END $$;
