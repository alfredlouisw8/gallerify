-- Add preferences JSONB column to galleries table
-- Stores design settings: titleAlign, colorTheme, photoLayout, accentColor

ALTER TABLE galleries
ADD COLUMN IF NOT EXISTS preferences JSONB NOT NULL DEFAULT '{}';
