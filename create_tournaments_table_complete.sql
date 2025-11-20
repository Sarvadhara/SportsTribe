-- =====================================================
-- COMPLETE SQL SCRIPT TO CREATE TOURNAMENTS TABLE
-- Run this in Supabase Dashboard > SQL Editor
-- =====================================================

-- Step 1: Drop table if it exists (to start fresh)
DROP TABLE IF EXISTS tournaments CASCADE;

-- Step 2: Create the tournaments table with all required columns
CREATE TABLE tournaments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  date DATE NOT NULL,
  time TIME,
  location TEXT NOT NULL,
  venue TEXT,
  image TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'upcoming', 'completed')),
  description TEXT,
  rules TEXT,
  prize_pool TEXT,
  max_participants INTEGER,
  registration_deadline DATE,
  contact_info TEXT,
  registration_fee TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create indexes for better query performance
CREATE INDEX idx_tournaments_status ON tournaments(status);
CREATE INDEX idx_tournaments_date ON tournaments(date);
CREATE INDEX idx_tournaments_created_at ON tournaments(created_at);

-- Step 4: Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 5: Create trigger to automatically update updated_at
CREATE TRIGGER update_tournaments_updated_at
    BEFORE UPDATE ON tournaments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 6: Enable Row Level Security
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;

-- Step 7: Create RLS policies for PUBLIC ACCESS (for testing)
-- This allows anyone to read, insert, update, and delete
-- ⚠️ WARNING: For production, you should restrict these policies!

-- Policy for SELECT (read) - Public access
CREATE POLICY "Allow public read access" ON tournaments
FOR SELECT USING (true);

-- Policy for INSERT (create) - Public access
CREATE POLICY "Allow public insert" ON tournaments
FOR INSERT WITH CHECK (true);

-- Policy for UPDATE (edit) - Public access
CREATE POLICY "Allow public update" ON tournaments
FOR UPDATE USING (true);

-- Policy for DELETE - Public access
CREATE POLICY "Allow public delete" ON tournaments
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
--   AND table_name = 'tournaments'
-- ORDER BY ordinal_position;

-- =====================================================
-- SUCCESS MESSAGE
-- If you see "Success. No rows returned" after running this script,
-- the table has been created successfully!
-- =====================================================

