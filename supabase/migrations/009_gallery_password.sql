-- Add password protection to galleries
ALTER TABLE galleries ADD COLUMN IF NOT EXISTS password_hash TEXT;
