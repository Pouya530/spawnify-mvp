-- Quick Database Verification Queries
-- Run these in Supabase Dashboard → SQL Editor

-- 1. Check if all required tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'grow_logs', 'admin_users')
ORDER BY table_name;

-- Expected result: 3 rows (user_profiles, grow_logs, admin_users)

-- 2. Check if functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN (
  'add_user_points',
  'calculate_completeness_score',
  'handle_new_user',
  'handle_updated_at',
  'is_admin'
)
ORDER BY routine_name;

-- Expected result: 5 rows

-- 3. Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('user_profiles', 'grow_logs', 'admin_users');

-- Expected result: rowsecurity = true for all tables

-- 4. Check storage bucket exists (run in Storage section, not SQL Editor)
-- Go to Storage → Check if 'grow-photos' bucket exists

-- 5. Quick test: Count existing data (if any)
SELECT 
  (SELECT COUNT(*) FROM user_profiles) as user_count,
  (SELECT COUNT(*) FROM grow_logs) as log_count,
  (SELECT COUNT(*) FROM admin_users) as admin_count;



