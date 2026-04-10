-- =============================================
-- Pixieset Clone - Supabase PostgreSQL Schema
-- Run this in your Supabase SQL Editor
-- =============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- USERS TABLE (NextAuth + App)
-- =============================================
CREATE TABLE IF NOT EXISTS users (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT,
  email         TEXT        UNIQUE NOT NULL,
  username      TEXT        UNIQUE NOT NULL,
  email_verified TIMESTAMPTZ,
  password      TEXT,
  image         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ACCOUNTS TABLE (NextAuth OAuth providers)
-- =============================================
CREATE TABLE IF NOT EXISTS accounts (
  id                   UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              UUID  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type                 TEXT  NOT NULL,
  provider             TEXT  NOT NULL,
  provider_account_id  TEXT  NOT NULL,
  refresh_token        TEXT,
  access_token         TEXT,
  expires_at           BIGINT,
  token_type           TEXT,
  scope                TEXT,
  id_token             TEXT,
  session_state        TEXT,
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (provider, provider_account_id)
);

-- =============================================
-- SESSIONS TABLE (NextAuth - JWT strategy, optional)
-- =============================================
CREATE TABLE IF NOT EXISTS sessions (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token TEXT        UNIQUE NOT NULL,
  user_id       UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires       TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- VERIFICATION TOKENS TABLE (NextAuth)
-- =============================================
CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier TEXT        NOT NULL,
  token      TEXT        NOT NULL,
  expires    TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (identifier, token)
);

-- =============================================
-- USER METADATA TABLE (1:1 with users)
-- =============================================
CREATE TABLE IF NOT EXISTS user_metadata (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  banner_image TEXT,
  whatsapp     TEXT,
  instagram    TEXT,
  about_image  TEXT,
  about_text   TEXT,
  logo         TEXT
);

-- =============================================
-- GALLERIES TABLE
-- banner_image stores JSON strings: {"path":"...","url":"..."}
-- =============================================
CREATE TABLE IF NOT EXISTS galleries (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT        NOT NULL,
  slug         TEXT        UNIQUE NOT NULL,
  banner_image TEXT[]      DEFAULT '{}',
  user_id      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  date         TIMESTAMPTZ NOT NULL,
  is_published BOOLEAN     DEFAULT FALSE,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- GALLERY CATEGORIES TABLE
-- =============================================
CREATE TABLE IF NOT EXISTS gallery_categories (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  gallery_id UUID NOT NULL REFERENCES galleries(id) ON DELETE CASCADE
);

-- =============================================
-- GALLERY CATEGORY IMAGES TABLE
-- image_url stores JSON string: {"path":"...","url":"..."}
-- =============================================
CREATE TABLE IF NOT EXISTS gallery_category_images (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url   TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES gallery_categories(id) ON DELETE CASCADE
);

-- =============================================
-- INDEXES for performance
-- =============================================
CREATE INDEX IF NOT EXISTS idx_galleries_user_id        ON galleries(user_id);
CREATE INDEX IF NOT EXISTS idx_galleries_slug           ON galleries(slug);
CREATE INDEX IF NOT EXISTS idx_gallery_categories_gallery_id ON gallery_categories(gallery_id);
CREATE INDEX IF NOT EXISTS idx_gallery_category_images_category_id ON gallery_category_images(category_id);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id         ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id         ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_metadata_user_id    ON user_metadata(user_id);

-- =============================================
-- STORAGE BUCKET
-- Run this separately or via Supabase dashboard:
--
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('images', 'images', true)
-- ON CONFLICT DO NOTHING;
-- =============================================
