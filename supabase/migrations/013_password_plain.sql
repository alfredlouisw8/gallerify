-- Store plain-text copies of gallery passwords so they can be shown back to the owner
ALTER TABLE galleries ADD COLUMN IF NOT EXISTS password_plain TEXT;
ALTER TABLE galleries ADD COLUMN IF NOT EXISTS client_password_plain TEXT;
