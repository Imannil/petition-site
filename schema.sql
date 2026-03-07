-- ============================================================
-- Stop Iran War — Supabase Schema
-- Run this once in your Supabase SQL Editor
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS signatures (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name    TEXT NOT NULL,
  email        TEXT NOT NULL UNIQUE,   -- one signature per email
  country      TEXT,                   -- optional
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fast alphabetical listing
CREATE INDEX IF NOT EXISTS idx_signatures_name ON signatures (full_name ASC);
-- Fast email duplicate check
CREATE INDEX IF NOT EXISTS idx_signatures_email ON signatures (email);

-- ── Row Level Security ──────────────────────────────────────────────────────
ALTER TABLE signatures ENABLE ROW LEVEL SECURITY;

-- Public can read name + country only (NOT email)
CREATE POLICY "Public read names"
  ON signatures FOR SELECT
  USING (true);

-- Only server (service role key) can insert/update/delete
-- No extra policies needed — service_role_key bypasses RLS

-- ── Count function ──────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_signature_count()
RETURNS INTEGER LANGUAGE sql SECURITY DEFINER AS $$
  SELECT COUNT(*)::INTEGER FROM signatures;
$$;
