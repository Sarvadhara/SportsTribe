-- =====================================================
-- COMPLETE SQL SCRIPT: USER PROFILES
-- Run this in Supabase Dashboard > SQL Editor
-- =====================================================

-- Step 0: Drop tables if you need a clean reset (optional)
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Step 1: Create user_profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  city TEXT,
  state TEXT,
  sport TEXT,
  position TEXT,
  matches_played INTEGER,
  age INTEGER,
  bio TEXT,
  profile_image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 2: Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_user_profiles_updated_at();

-- Step 3: Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Step 4: Development-friendly RLS policies
-- (Tighten these for production use)
CREATE POLICY "Public read user profiles" ON user_profiles
FOR SELECT USING (true);

CREATE POLICY "Public upsert user profiles" ON user_profiles
FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update user profiles" ON user_profiles
FOR UPDATE USING (true);

-- Step 5: Helpful indexes (optional but recommended)
CREATE INDEX idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_email ON user_profiles(email);

-- Step 6: Verification helpers
-- SELECT table_name, column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'user_profiles'
-- ORDER BY ordinal_position;
-- SELECT COUNT(*) FROM user_profiles;
-- =====================================================
-- COMPLETE SQL SCRIPT: USER PROFILES
-- Run in Supabase Dashboard > SQL Editor (public schema)
-- =====================================================

-- Step 0: Drop table if you need a fresh start (optional)
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Step 1: Create user_profiles table
CREATE TABLE user_profiles (
  id BIGSERIAL PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  sport TEXT NOT NULL,
  position TEXT,
  age INTEGER CHECK (age BETWEEN 10 AND 100),
  matches_played INTEGER DEFAULT 0,
  bio TEXT,
  profile_image TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Step 2: Helpful indexes
CREATE INDEX idx_user_profiles_city ON user_profiles(city);
CREATE INDEX idx_user_profiles_state ON user_profiles(state);
CREATE INDEX idx_user_profiles_sport ON user_profiles(sport);

-- Step 3: Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_user_profiles_updated_at
BEFORE UPDATE ON user_profiles
FOR EACH ROW
EXECUTE FUNCTION update_user_profiles_updated_at();

-- Step 4: Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Step 5: Development-friendly policies (adjust for production)
CREATE POLICY "Public read user profiles" ON user_profiles
FOR SELECT USING (true);

CREATE POLICY "Public upsert user profiles" ON user_profiles
FOR INSERT WITH CHECK (true);

CREATE POLICY "Public update user profiles" ON user_profiles
FOR UPDATE USING (true);

-- Step 6: Verification helpers
-- SELECT table_name, column_name, data_type
-- FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'user_profiles'
-- ORDER BY ordinal_position;

-- SELECT COUNT(*) FROM user_profiles;

