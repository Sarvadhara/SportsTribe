-- =====================================================
-- COMPLETE SQL SCRIPT TO CREATE COMMUNITY_HIGHLIGHTS TABLE
-- Run this in Supabase Dashboard > SQL Editor
-- =====================================================

-- Step 1: Drop table if it exists (to start fresh)
DROP TABLE IF EXISTS community_highlights CASCADE;

-- Step 2: Create the community_highlights table with all required columns
CREATE TABLE community_highlights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video')),
  description TEXT,
  date TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create indexes for better query performance
CREATE INDEX idx_community_highlights_media_type ON community_highlights(media_type);
CREATE INDEX idx_community_highlights_created_at ON community_highlights(created_at);

-- Step 4: Create function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_community_highlights_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Step 5: Create trigger to automatically update updated_at
CREATE TRIGGER update_community_highlights_updated_at
    BEFORE UPDATE ON community_highlights
    FOR EACH ROW
    EXECUTE FUNCTION update_community_highlights_updated_at_column();

-- Step 6: Enable Row Level Security
ALTER TABLE community_highlights ENABLE ROW LEVEL SECURITY;

-- Step 7: Create RLS policies for PUBLIC ACCESS (for testing)
-- This allows anyone to read, insert, update, and delete
-- ⚠️ WARNING: For production, you should restrict these policies!

-- Policy for SELECT (read) - Public access
CREATE POLICY "Allow public read access" ON community_highlights
FOR SELECT USING (true);

-- Policy for INSERT (create) - Public access
CREATE POLICY "Allow public insert" ON community_highlights
FOR INSERT WITH CHECK (true);

-- Policy for UPDATE (edit) - Public access
CREATE POLICY "Allow public update" ON community_highlights
FOR UPDATE USING (true);

-- Policy for DELETE - Public access
CREATE POLICY "Allow public delete" ON community_highlights
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
--   AND table_name = 'community_highlights'
-- ORDER BY ordinal_position;

-- =====================================================
-- SUCCESS MESSAGE
-- If you see "Success. No rows returned" after running this script,
-- the table has been created successfully!
-- =====================================================

