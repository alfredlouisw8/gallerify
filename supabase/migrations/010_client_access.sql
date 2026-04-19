-- Client access columns on galleries
ALTER TABLE galleries ADD COLUMN IF NOT EXISTS client_access_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE galleries ADD COLUMN IF NOT EXISTS client_password_hash TEXT;

-- Client favorites (hearted images)
CREATE TABLE IF NOT EXISTS gallery_client_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id UUID NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  image_id UUID NOT NULL REFERENCES gallery_category_images(id) ON DELETE CASCADE,
  client_session_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(image_id, client_session_id)
);

-- Client hidden images
CREATE TABLE IF NOT EXISTS gallery_client_hidden (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id UUID NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  image_id UUID NOT NULL REFERENCES gallery_category_images(id) ON DELETE CASCADE,
  client_session_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(image_id, client_session_id)
);

CREATE INDEX IF NOT EXISTS idx_client_favorites_gallery ON gallery_client_favorites(gallery_id);
CREATE INDEX IF NOT EXISTS idx_client_hidden_gallery ON gallery_client_hidden(gallery_id);
