-- Fix infinite recursion in admin_users RLS policy
-- The issue: Policy checks admin_users table, which triggers the same policy check again

-- Drop the problematic policy
DROP POLICY IF EXISTS "Admins can view admin users" ON admin_users;

-- Solution 1: Allow all authenticated users to view admin_users
-- (Since it's just role information, not sensitive personal data)
CREATE POLICY "Authenticated users can view admin users"
  ON admin_users FOR SELECT
  USING (auth.role() = 'authenticated');

-- Alternative Solution 2: Use a SECURITY DEFINER function to check admin status
-- This bypasses RLS when checking admin status
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE admin_users.user_id = is_admin.user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Now update other policies to use the function instead of direct queries
-- This prevents recursion in other tables too

-- Update user_profiles admin policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (is_admin(auth.uid()));

-- Update grow_logs admin policy  
DROP POLICY IF EXISTS "Admins can view all logs" ON grow_logs;
CREATE POLICY "Admins can view all logs"
  ON grow_logs FOR SELECT
  USING (is_admin(auth.uid()));

