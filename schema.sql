-- ============================================================
-- 1863 CRM — Supabase Database Schema
-- Run this entire file in the Supabase SQL Editor
-- ============================================================

-- App data table (key-value store for all CRM data)
CREATE TABLE IF NOT EXISTS app_data (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles + roles (linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email       TEXT UNIQUE NOT NULL,
  full_name   TEXT,
  role        TEXT NOT NULL DEFAULT 'standard'
              CHECK (role IN ('admin', 'standard', 'readonly')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create a profile when a new user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE app_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Helper function: get current user's role
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;

-- app_data policies
-- Admins and standard users: full read/write
-- Readonly users: read only
CREATE POLICY "Read app_data" ON app_data
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Write app_data - admin and standard" ON app_data
  FOR INSERT WITH CHECK (get_my_role() IN ('admin', 'standard'));

CREATE POLICY "Update app_data - admin and standard" ON app_data
  FOR UPDATE USING (get_my_role() IN ('admin', 'standard'));

-- profiles policies
-- Users can read their own profile
-- Admins can read all profiles and update roles
CREATE POLICY "Read own profile" ON profiles
  FOR SELECT USING (
    id = auth.uid() OR get_my_role() = 'admin'
  );

CREATE POLICY "Admin manages profiles" ON profiles
  FOR UPDATE USING (get_my_role() = 'admin');

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_app_data_key ON app_data(key);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- ============================================================
-- DONE
-- You can verify by running:
-- SELECT * FROM profiles;
-- SELECT * FROM app_data;
-- ============================================================
