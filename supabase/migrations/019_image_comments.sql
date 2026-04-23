-- =============================================
-- Migration 019: Image comments
--
-- Allows clients to leave comments, feedback, or
-- requests on individual gallery images. The owner
-- can read all comments from their gallery dashboard.
-- =============================================

CREATE TABLE IF NOT EXISTS public.image_comments (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id  UUID        NOT NULL REFERENCES public.galleries(id) ON DELETE CASCADE,
  image_id    UUID        NOT NULL,
  client_name TEXT,
  type        TEXT        NOT NULL DEFAULT 'comment'
                CHECK (type IN ('comment', 'feedback', 'request')),
  comment     TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS image_comments_gallery_id_idx ON public.image_comments (gallery_id);
CREATE INDEX IF NOT EXISTS image_comments_image_id_idx   ON public.image_comments (image_id);

ALTER TABLE public.image_comments ENABLE ROW LEVEL SECURITY;
-- All operations go through the service-role client in server actions,
-- so no user-level RLS policies are needed.
