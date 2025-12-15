-- Fix infinite recursion in admin_users RLS policy
-- Run this SQL in Supabase SQL Editor to fix the issue

-- Step 1: Create helper function to check admin status (bypasses RLS)
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = is_admin.user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Drop the problematic admin_users policy
DROP POLICY IF EXISTS "Admins can view admin users" ON admin_users;

-- Step 3: Create new policy that doesn't cause recursion
-- Allow authenticated users to view admin_users (it's just role info)
CREATE POLICY "Authenticated users can view admin users"
  ON admin_users FOR SELECT
  USING (auth.role() = 'authenticated');

-- Step 4: Update other policies to use the helper function
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "Admins can view all logs" ON grow_logs;
CREATE POLICY "Admins can view all logs"
  ON grow_logs FOR SELECT
  USING (is_admin(auth.uid()));

