-- =====================================================
-- VERIFICATION SCRIPT - Check if live_matches table exists
-- Run this in Supabase Dashboard > SQL Editor
-- =====================================================

-- Check if table exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'live_matches'
    ) 
    THEN '✅ Table EXISTS'
    ELSE '❌ Table DOES NOT EXIST'
  END AS table_status;

-- Show all columns in the live_matches table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'live_matches'
ORDER BY ordinal_position;

-- Show RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'live_matches';

-- Count rows (if table exists and has data)
SELECT COUNT(*) as total_live_matches FROM live_matches;

