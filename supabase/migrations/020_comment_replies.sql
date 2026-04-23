-- =============================================
-- Migration 020: Owner replies on image comments
--
-- Allows the gallery owner to reply to client
-- comments, feedback, and requests.
-- =============================================

ALTER TABLE public.image_comments
  ADD COLUMN IF NOT EXISTS owner_reply      TEXT,
  ADD COLUMN IF NOT EXISTS owner_replied_at TIMESTAMPTZ;
