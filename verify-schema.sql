-- Quick verification queries to check if database schema is set up
-- Run these in Supabase SQL Editor to verify your setup

-- 1. Check if tables exist
SELECT 
  table_name,
  CASE 
    WHEN table_name IN ('user_profiles', 'grow_logs', 'admin_users') THEN '✓ Exists'
    ELSE '✗ Missing'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'grow_logs', 'admin_users')
ORDER BY table_name;

-- 2. Check if trigger function exists
SELECT 
  proname as function_name,
  CASE 
    WHEN proname = 'handle_new_user' THEN '✓ Exists'
    ELSE '✗ Missing'
  END as status
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- 3. Check if trigger exists
SELECT 
  tgname as trigger_name,
  CASE 
    WHEN tgname = 'on_auth_user_created' THEN '✓ Exists'
    ELSE '✗ Missing'
  END as status
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- 4. Check RLS is enabled
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('user_profiles', 'grow_logs', 'admin_users');

