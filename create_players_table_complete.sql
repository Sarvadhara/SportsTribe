-- =====================================================
-- COMPLETE SQL SCRIPT TO CREATE PLAYERS TABLE
-- Run this in Supabase Dashboard > SQL Editor
-- =====================================================

-- Step 1: Drop table if it exists (to start fresh)
DROP TABLE IF EXISTS players CASCADE;

-- Step 2: Create the players table with all required columns
CREATE TABLE players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  sport TEXT NOT NULL,
  image TEXT NOT NULL,
  matches_played INTEGER,
  age INTEGER,
  position TEXT,
  bio TEXT,
  email TEXT,
  phone TEXT,
  user_id TEXT, -- Unique user ID for admin-created and user-created players
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create indexes for better query performance
CREATE INDEX idx_players_sport ON players(sport);
CREATE INDEX idx_players_city ON players(city);
CREATE INDEX idx_players_state ON players(state);
CREATE INDEX idx_players_user_id ON players(user_id);
CREATE INDEX idx_players_created_at ON players(created_at);

-- Step 4: Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_players_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 5: Create trigger to automatically update updated_at
CREATE TRIGGER update_players_updated_at
    BEFORE UPDATE ON players
    FOR EACH ROW
    EXECUTE FUNCTION update_players_updated_at_column();

-- Step 6: Enable Row Level Security
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

-- Step 7: Create RLS policies for PUBLIC ACCESS (for testing)
-- This allows anyone to read, insert, update, and delete
-- ⚠️ WARNING: For production, you should restrict these policies!

-- Policy for SELECT (read) - Public access
CREATE POLICY "Allow public read access" ON players
FOR SELECT USING (true);

-- Policy for INSERT (create) - Public access
CREATE POLICY "Allow public insert" ON players
FOR INSERT WITH CHECK (true);

-- Policy for UPDATE (edit) - Public access
CREATE POLICY "Allow public update" ON players
FOR UPDATE USING (true);

-- Policy for DELETE - Public access
CREATE POLICY "Allow public delete" ON players
FOR DELETE USING (true);

-- =====================================================
-- VERIFICATION QUERY
-- Run this after creating the table to verify it exists
-- =====================================================
-- SELECT 
--   table_name, 
--   column_name, 
--   data_type,
--   is_nullable
-- FROM information_schema.columns 
-- WHERE table_schema = 'public' 
--   AND table_name = 'players'
-- ORDER BY ordinal_position;

-- =====================================================
-- SUCCESS MESSAGE
-- If you see "Success. No rows returned" after running this script,
-- the table has been created successfully!
-- =====================================================

