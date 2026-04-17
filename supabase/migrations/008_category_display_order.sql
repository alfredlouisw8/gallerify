-- Add display_order to gallery_categories for drag-and-drop ordering
ALTER TABLE gallery_categories ADD COLUMN IF NOT EXISTS display_order INTEGER;

-- Backfill existing rows with sequential order per gallery
UPDATE gallery_categories gc
SET display_order = sub.rn
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY gallery_id ORDER BY id) - 1 AS rn
  FROM gallery_categories
) sub
WHERE gc.id = sub.id;

ALTER TABLE gallery_categories ALTER COLUMN display_order SET NOT NULL;
ALTER TABLE gallery_categories ALTER COLUMN display_order SET DEFAULT 0;
