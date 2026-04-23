-- =============================================
-- Migration 021: Done status on image comments
--
-- Lets the gallery owner mark a client comment
-- as resolved after replacing or editing the photo.
-- =============================================

ALTER TABLE public.image_comments
  ADD COLUMN IF NOT EXISTS is_done BOOLEAN     NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS done_at TIMESTAMPTZ;
