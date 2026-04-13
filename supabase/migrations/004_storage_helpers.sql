-- Decrement a user's storage usage, clamped to 0 to avoid negative values.
CREATE OR REPLACE FUNCTION public.decrement_storage_usage(p_user_id UUID, p_bytes BIGINT)
RETURNS void AS $$
BEGIN
  UPDATE public.user_metadata
  SET storage_used_bytes = GREATEST(0, storage_used_bytes - p_bytes)
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
