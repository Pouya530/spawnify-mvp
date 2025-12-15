-- Setup Missing Database Parts
-- Run this if tables already exist but functions/triggers are missing
-- This script uses CREATE OR REPLACE and IF NOT EXISTS to avoid errors

-- ============================================================================
-- FUNCTIONS (Create or Replace - Safe to run multiple times)
-- ============================================================================

-- 1. add_user_points Function
CREATE OR REPLACE FUNCTION add_user_points(
  p_user_id UUID,
  p_points INTEGER
) RETURNS VOID AS $$
BEGIN
  UPDATE user_profiles
  SET 
    total_points = total_points + p_points,
    verification_level = CASE
      WHEN total_points + p_points >= 500 THEN 'gold'
      WHEN total_points + p_points >= 100 THEN 'silver'
      ELSE 'bronze'
    END,
    updated_at = NOW()
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. calculate_completeness_score Function
CREATE OR REPLACE FUNCTION calculate_completeness_score(
  p_log_id UUID
) RETURNS INTEGER AS $$
DECLARE
  v_score INTEGER := 0;
  v_log RECORD;
BEGIN
  SELECT * INTO v_log FROM grow_logs WHERE id = p_log_id;
  
  -- Required fields complete: 60 points (auto if record exists)
  v_score := 60;
  
  -- Optional fields (10 points each)
  IF v_log.substrate_ratio IS NOT NULL AND v_log.substrate_ratio != '' THEN
    v_score := v_score + 10;
  END IF;
  
  IF v_log.inoculation_details IS NOT NULL AND v_log.inoculation_details != '' THEN
    v_score := v_score + 10;
  END IF;
  
  IF v_log.light_hours_daily IS NOT NULL THEN
    v_score := v_score + 10;
  END IF;
  
  IF v_log.tek_method IS NOT NULL AND v_log.tek_method != '' THEN
    v_score := v_score + 10;
  END IF;
  
  -- Bonus - TEK notes >100 chars: +15 points
  IF v_log.tek_notes IS NOT NULL AND LENGTH(v_log.tek_notes) > 100 THEN
    v_score := v_score + 15;
  END IF;
  
  -- Bonus - General notes >50 chars: +5 points
  IF v_log.notes IS NOT NULL AND LENGTH(v_log.notes) > 50 THEN
    v_score := v_score + 5;
  END IF;
  
  -- Bonus - Photos uploaded: +10 points
  IF v_log.photos IS NOT NULL AND array_length(v_log.photos, 1) > 0 THEN
    v_score := v_score + 10;
  END IF;
  
  -- Cap at 100
  IF v_score > 100 THEN
    v_score := 100;
  END IF;
  
  RETURN v_score;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. handle_new_user Trigger Function (CRITICAL FOR SIGNUP)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, verification_level, total_points)
  VALUES (NEW.id, NEW.email, 'bronze', 0)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. handle_updated_at Trigger Function
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS (Drop and recreate to ensure they're correct)
-- ============================================================================

-- Drop existing triggers if they exist (to avoid duplicates)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS set_updated_at_user_profiles ON user_profiles;
DROP TRIGGER IF EXISTS set_updated_at_grow_logs ON grow_logs;

-- Trigger: Auto-create user_profile on signup (CRITICAL)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- Trigger: Auto-update updated_at on user_profiles
CREATE TRIGGER set_updated_at_user_profiles
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Trigger: Auto-update updated_at on grow_logs
CREATE TRIGGER set_updated_at_grow_logs
  BEFORE UPDATE ON grow_logs
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- ============================================================================
-- RLS POLICIES (Only create if they don't exist)
-- ============================================================================

-- Enable RLS (idempotent)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE grow_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to recreate them)
DO $$ 
BEGIN
  -- user_profiles policies
  DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
  DROP POLICY IF EXISTS "Admins can view all profiles" ON user_profiles;
  
  -- grow_logs policies
  DROP POLICY IF EXISTS "Users can view own logs" ON grow_logs;
  DROP POLICY IF EXISTS "Users can insert own logs" ON grow_logs;
  DROP POLICY IF EXISTS "Users can update own logs" ON grow_logs;
  DROP POLICY IF EXISTS "Users can delete own logs" ON grow_logs;
  DROP POLICY IF EXISTS "Admins can view all logs" ON grow_logs;
  
  -- admin_users policies
  DROP POLICY IF EXISTS "Admins can view admin users" ON admin_users;
END $$;

-- user_profiles Policies
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );

-- grow_logs Policies
CREATE POLICY "Users can view own logs"
  ON grow_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own logs"
  ON grow_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own logs"
  ON grow_logs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own logs"
  ON grow_logs FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all logs"
  ON grow_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );

-- admin_users Policies
CREATE POLICY "Admins can view admin users"
  ON admin_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- INDEXES (Create if not exists)
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_grow_logs_user_id ON grow_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_grow_logs_created_at ON grow_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_grow_logs_log_date ON grow_logs(log_date DESC);
CREATE INDEX IF NOT EXISTS idx_grow_logs_growth_stage ON grow_logs(growth_stage);
CREATE INDEX IF NOT EXISTS idx_grow_analytics ON grow_logs(strain, substrate, growing_method, growth_stage);
CREATE INDEX IF NOT EXISTS idx_user_profiles_verification_level ON user_profiles(verification_level);
CREATE INDEX IF NOT EXISTS idx_user_profiles_created_at ON user_profiles(created_at DESC);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check if everything is set up correctly
SELECT 
  'Functions' as type,
  COUNT(*) as count
FROM pg_proc 
WHERE proname IN ('add_user_points', 'calculate_completeness_score', 'handle_new_user', 'handle_updated_at')
UNION ALL
SELECT 
  'Triggers' as type,
  COUNT(*) as count
FROM pg_trigger 
WHERE tgname IN ('on_auth_user_created', 'set_updated_at_user_profiles', 'set_updated_at_grow_logs')
UNION ALL
SELECT 
  'Tables' as type,
  COUNT(*) as count
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('user_profiles', 'grow_logs', 'admin_users');

