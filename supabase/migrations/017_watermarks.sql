-- =============================================
-- Migration 017: Watermarks table
--
-- Allows photographers to create reusable watermarks
-- (text or image) with configurable scale, opacity, and
-- position. Watermarks are scoped per user and can be
-- assigned to galleries to protect photos.
-- =============================================

CREATE TABLE IF NOT EXISTS public.watermarks (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL DEFAULT 'Watermark',
  type        TEXT        NOT NULL DEFAULT 'text'
                CHECK (type IN ('text', 'image')),
  text        TEXT,
  text_color  TEXT        NOT NULL DEFAULT 'white'
                CHECK (text_color IN ('white', 'black')),
  image_url   TEXT,
  scale       NUMERIC     NOT NULL DEFAULT 50
                CHECK (scale BETWEEN 10 AND 200),
  opacity     NUMERIC     NOT NULL DEFAULT 80
                CHECK (opacity BETWEEN 0 AND 100),
  position    TEXT        NOT NULL DEFAULT 'bottom-center'
                CHECK (position IN (
                  'top-left', 'top-center', 'top-right',
                  'center-left', 'center', 'center-right',
                  'bottom-left', 'bottom-center', 'bottom-right'
                )),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast per-user lookups
CREATE INDEX IF NOT EXISTS watermarks_user_id_idx
  ON public.watermarks (user_id);

-- Enable Row Level Security
ALTER TABLE public.watermarks ENABLE ROW LEVEL SECURITY;

-- Users can only read and write their own watermarks
CREATE POLICY "Users manage own watermarks"
  ON public.watermarks
  FOR ALL
  USING  (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
