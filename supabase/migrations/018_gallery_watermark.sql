-- =============================================
-- Migration 018: Add watermark_id to galleries
--
-- Allows a watermark to be assigned to a gallery.
-- The watermark is applied when photos are displayed
-- to viewers. Nullable — no watermark by default.
-- =============================================

ALTER TABLE public.galleries
  ADD COLUMN IF NOT EXISTS watermark_id UUID
    REFERENCES public.watermarks(id)
    ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS galleries_watermark_id_idx
  ON public.galleries (watermark_id);
