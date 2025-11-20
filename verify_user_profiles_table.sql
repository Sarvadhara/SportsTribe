-- =====================================================
-- VERIFICATION SCRIPT: Check if user_profiles table exists
-- Run this in Supabase Dashboard > SQL Editor
-- =====================================================

-- Check if the table exists
SELECT 
  table_name,
  table_schema
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'user_profiles';

-- Show all columns in the user_profiles table (if it exists)
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_profiles'
ORDER BY ordinal_position;

-- Check for unique constraints
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.table_name = 'user_profiles'
  AND tc.constraint_type = 'UNIQUE';

-- Check for indexes
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'user_profiles';

-- Check RLS policies
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
WHERE schemaname = 'public'
  AND tablename = 'user_profiles';

-- Count existing records (if table exists)
SELECT COUNT(*) as total_profiles FROM user_profiles;

