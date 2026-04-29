ALTER TABLE public.user_metadata
  ADD COLUMN IF NOT EXISTS billing_period TEXT NOT NULL DEFAULT 'monthly'
    CHECK (billing_period IN ('monthly', 'annual'));
