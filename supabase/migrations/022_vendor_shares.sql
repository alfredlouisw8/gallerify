-- =============================================
-- Migration 022: Vendor shares
--
-- Allows photographers to share a curated set of
-- gallery photos with vendors (florist, MUA, venue,
-- planner, etc.) via a unique, optionally-expiring link.
-- No auth required to view a vendor share link.
-- =============================================

CREATE TABLE IF NOT EXISTS public.vendor_shares (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id  UUID        NOT NULL REFERENCES public.galleries(id) ON DELETE CASCADE,
  vendor_name TEXT        NOT NULL,
  vendor_type TEXT        NOT NULL
                CHECK (vendor_type IN ('florist', 'mua', 'venue', 'planner', 'other')),
  image_ids   UUID[]      NOT NULL DEFAULT '{}',
  token       TEXT        NOT NULL UNIQUE,
  watermark   BOOLEAN     NOT NULL DEFAULT FALSE,
  expires_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS vendor_shares_gallery_id_idx ON public.vendor_shares (gallery_id);
CREATE UNIQUE INDEX IF NOT EXISTS vendor_shares_token_idx ON public.vendor_shares (token);

ALTER TABLE public.vendor_shares ENABLE ROW LEVEL SECURITY;
-- All operations use the service-role client in server actions.
