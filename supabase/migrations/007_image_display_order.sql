-- Add display_order to gallery_category_images for drag-and-drop ordering
ALTER TABLE gallery_category_images ADD COLUMN IF NOT EXISTS display_order INTEGER;

-- Backfill existing rows with a stable default order (by insertion order via ctid)
UPDATE gallery_category_images gi
SET display_order = sub.rn
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY ctid) AS rn
  FROM gallery_category_images
) sub
WHERE gi.id = sub.id;

-- Set NOT NULL with default 0 after backfill
ALTER TABLE gallery_category_images ALTER COLUMN display_order SET NOT NULL;
ALTER TABLE gallery_category_images ALTER COLUMN display_order SET DEFAULT 0;
