-- Drop and recreate client tables without session tracking (one client per gallery)
DROP TABLE IF EXISTS gallery_client_favorites;
DROP TABLE IF EXISTS gallery_client_hidden;

CREATE TABLE gallery_client_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id UUID NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  image_id UUID NOT NULL REFERENCES gallery_category_images(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(gallery_id, image_id)
);

CREATE TABLE gallery_client_hidden (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gallery_id UUID NOT NULL REFERENCES galleries(id) ON DELETE CASCADE,
  image_id UUID NOT NULL REFERENCES gallery_category_images(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(gallery_id, image_id)
);

CREATE INDEX IF NOT EXISTS idx_client_favorites_gallery ON gallery_client_favorites(gallery_id);
CREATE INDEX IF NOT EXISTS idx_client_hidden_gallery ON gallery_client_hidden(gallery_id);
