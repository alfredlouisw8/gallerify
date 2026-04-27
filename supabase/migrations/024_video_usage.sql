-- Migration 024: Track total video seconds uploaded per account
-- Mirrors storage_used_bytes; enforced per-plan limit (Pro: 3600s, Pro Max: 7200s).

ALTER TABLE public.user_metadata
  ADD COLUMN IF NOT EXISTS video_used_seconds BIGINT NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.increment_video_usage(p_user_id UUID, p_seconds BIGINT)
RETURNS void AS $$
BEGIN
  UPDATE public.user_metadata
  SET video_used_seconds = video_used_seconds + p_seconds
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.decrement_video_usage(p_user_id UUID, p_seconds BIGINT)
RETURNS void AS $$
BEGIN
  UPDATE public.user_metadata
  SET video_used_seconds = GREATEST(0, video_used_seconds - p_seconds)
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
