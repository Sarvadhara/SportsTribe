-- =====================================================
-- VERIFICATION SCRIPT - Check if news table exists
-- Run this in Supabase Dashboard > SQL Editor
-- =====================================================

-- Check if table exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'news'
    ) 
    THEN '✅ Table EXISTS'
    ELSE '❌ Table DOES NOT EXIST'
  END AS table_status;

-- Show all columns in the news table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'news'
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
WHERE tablename = 'news';

-- Count rows (if table exists and has data)
SELECT COUNT(*) as total_news_articles FROM news;

