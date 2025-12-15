# Database Agent

## Role
You are the Database Agent responsible for implementing the complete database schema, Row Level Security policies, storage buckets, and database functions for Spawnify MVP.

## Primary Objectives
1. Create all database tables with proper constraints
2. Implement Row Level Security (RLS) policies
3. Set up storage buckets for photo uploads
4. Create database functions and triggers
5. Create indexes for query optimization
6. Generate TypeScript types from schema

## Tech Stack
- **Database:** Supabase PostgreSQL
- **Storage:** Supabase Storage
- **Type Generation:** Supabase CLI
- **Extensions:** uuid-ossp (for UUID generation)

## Database Schema

### 1. user_profiles Table

**Purpose:** Store user profile information and gamification data

```sql
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  verification_level TEXT DEFAULT 'bronze' CHECK (verification_level IN ('bronze', 'silver', 'gold')),
  total_points INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Admin can view all profiles
CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );
```

### 2. grow_logs Table

**Purpose:** Store all mushroom cultivation tracking data

```sql
CREATE TABLE grow_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Core fields (required)
  growth_stage TEXT NOT NULL CHECK (growth_stage IN ('Inoculation', 'Colonization', 'Fruiting', 'Harvest')),
  log_date DATE NOT NULL,
  
  -- Environmental data (optional)
  temperature DECIMAL(5,2),
  humidity DECIMAL(5,2),
  ph_level DECIMAL(3,1) CHECK (ph_level >= 0 AND ph_level <= 14),
  weight DECIMAL(8,2),
  light_hours_daily DECIMAL(3,1) CHECK (light_hours_daily >= 0 AND light_hours_daily <= 12),
  
  -- Scientific data (required)
  strain VARCHAR(100) NOT NULL,
  substrate VARCHAR(100) NOT NULL,
  substrate_ratio VARCHAR(200),
  inoculation_method VARCHAR(100) NOT NULL,
  inoculation_details VARCHAR(300),
  growing_method VARCHAR(50) NOT NULL,
  tek_method VARCHAR(100),
  tek_notes TEXT,
  
  -- Media & notes
  photos TEXT[],
  notes TEXT,
  
  -- Gamification
  data_completeness_score INTEGER DEFAULT 0 CHECK (data_completeness_score >= 0 AND data_completeness_score <= 100),
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE grow_logs ENABLE ROW LEVEL SECURITY;

-- User policies
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

-- Admin policy
CREATE POLICY "Admins can view all logs"
  ON grow_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );
```

### 3. admin_users Table

**Purpose:** Store admin user roles

```sql
CREATE TABLE admin_users (
  user_id UUID REFERENCES auth.users(id) PRIMARY KEY,
  role TEXT DEFAULT 'admin' CHECK (role IN ('admin', 'super_admin')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Only admins can query this table
CREATE POLICY "Admins can view admin users"
  ON admin_users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );
```

## Indexes

**Purpose:** Optimize common queries

```sql
-- Grow logs indexes
CREATE INDEX idx_grow_logs_user_id ON grow_logs(user_id);
CREATE INDEX idx_grow_logs_created_at ON grow_logs(created_at DESC);
CREATE INDEX idx_grow_logs_log_date ON grow_logs(log_date DESC);
CREATE INDEX idx_grow_logs_growth_stage ON grow_logs(growth_stage);

-- Analytics index (for admin queries)
CREATE INDEX idx_grow_analytics ON grow_logs(strain, substrate, growing_method, growth_stage);

-- User profiles index
CREATE INDEX idx_user_profiles_verification_level ON user_profiles(verification_level);
CREATE INDEX idx_user_profiles_created_at ON user_profiles(created_at DESC);
```

## Database Functions

### 1. add_user_points Function

**Purpose:** Add points to user and auto-update verification level

```sql
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
```

**Usage:**
```sql
SELECT add_user_points('user-uuid-here', 25);
```

### 2. calculate_completeness_score Function

**Purpose:** Calculate data completeness score for a grow log

```sql
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
```

### 3. handle_new_user Trigger Function

**Purpose:** Auto-create user_profile when new user signs up

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, verification_level, total_points)
  VALUES (NEW.id, NEW.email, 'bronze', 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

### 4. handle_updated_at Trigger Function

**Purpose:** Auto-update updated_at timestamp on row changes

```sql
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to user_profiles
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();

-- Apply to grow_logs
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON grow_logs
  FOR EACH ROW
  EXECUTE FUNCTION handle_updated_at();
```

## Supabase Storage

### grow-photos Bucket

**Purpose:** Store user-uploaded grow log photos

**Configuration:**
```sql
-- Create bucket (via Supabase Dashboard or SQL)
INSERT INTO storage.buckets (id, name, public)
VALUES ('grow-photos', 'grow-photos', true);
```

**Storage Policies:**
```sql
-- Users can upload to their own folder
CREATE POLICY "Users can upload own photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'grow-photos' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Users can view all photos (public bucket)
CREATE POLICY "Public can view photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'grow-photos');

-- Users can delete own photos
CREATE POLICY "Users can delete own photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'grow-photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

**File Path Structure:**
```
grow-photos/
  └── {user_id}/
      ├── 1702472123456.jpg
      ├── 1702472234567.png
      └── ...
```

**File Naming:**
- Format: `{timestamp}.{extension}`
- Example: `1702472123456.jpg`
- Timestamp: Unix timestamp in milliseconds

## TypeScript Type Generation

### Generate Types from Database

**Using Supabase CLI:**
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/types/database.ts
```

**Generated Type Usage:**
```tsx
import { Database } from '@/lib/types/database';

type GrowLog = Database['public']['Tables']['grow_logs']['Row'];
type UserProfile = Database['public']['Tables']['user_profiles']['Row'];
```

### Custom Types (`lib/types/growLog.ts`)

```tsx
export interface GrowLogFormData {
  growth_stage: string;
  log_date: string;
  temperature?: number;
  humidity?: number;
  ph_level?: number;
  weight?: number;
  light_hours_daily?: number;
  strain: string;
  substrate: string;
  substrate_ratio?: string;
  inoculation_method: string;
  inoculation_details?: string;
  growing_method: string;
  tek_method?: string;
  tek_notes?: string;
  photos?: string[];
  notes?: string;
}

export interface GrowLogWithUser extends GrowLog {
  user_profile?: {
    email: string;
    full_name?: string;
  };
}
```

## Constants (`lib/constants/growingOptions.ts`)

**Purpose:** Centralize dropdown options

```tsx
export const GROWTH_STAGES = [
  'Inoculation',
  'Colonization',
  'Fruiting',
  'Harvest'
] as const;

export const STRAINS = [
  'Golden Teacher',
  'B+',
  'Penis Envy',
  'PE#6',
  'Albino A+',
  'Blue Meanie',
  'Mazatapec',
  'Cambodian',
  'JMF',
  'Tidal Wave',
  'McKennaii',
  'Treasure Coast',
  'Ecuador',
  'Amazonian',
  'Other'
] as const;

export const SUBSTRATES = [
  'Coco Coir',
  'Coco+Verm',
  'CVG',
  'Manure-based',
  'Straw',
  'Hardwood',
  "Master's Mix",
  'BRF',
  'Rye Grain',
  'Wild Bird Seed',
  "Uncle Ben's",
  'Popcorn',
  'Other'
] as const;

export const INOCULATION_METHODS = [
  'Liquid Culture',
  'Spore Syringe',
  'Agar Transfer',
  'G2G',
  'Spore Print',
  'Clone',
  'Sawdust Spawn',
  'Other'
] as const;

export const GROWING_METHODS = [
  'Monotub',
  'SGFC',
  'Fruiting Bag',
  'Martha Tent',
  'Shoebox',
  'Hydroponics',
  'Open Air',
  'Other'
] as const;

export const TEK_METHODS = [
  'PF Tek',
  "Uncle Ben's",
  'G2G',
  'Agar',
  'Liquid Culture',
  'Shoebox',
  'Broke Boi',
  'BRF Cakes',
  'Bulk Substrate',
  'Monotub Tek',
  'Other'
] as const;
```

## Database Utilities (`lib/utils/dataCompleteness.ts`)

**Purpose:** Calculate completeness score client-side

```tsx
export function calculateCompletenessScore(formData: Partial<GrowLogFormData>): number {
  let score = 0;
  
  // Required fields complete (if we're calculating, assume they exist)
  score = 60;
  
  // Optional fields (10 points each)
  if (formData.substrate_ratio?.trim()) score += 10;
  if (formData.inoculation_details?.trim()) score += 10;
  if (formData.light_hours_daily !== undefined) score += 10;
  if (formData.tek_method?.trim()) score += 10;
  
  // Bonus - TEK notes >100 chars
  if (formData.tek_notes && formData.tek_notes.length > 100) score += 15;
  
  // Bonus - General notes >50 chars
  if (formData.notes && formData.notes.length > 50) score += 5;
  
  // Bonus - Photos uploaded
  if (formData.photos && formData.photos.length > 0) score += 10;
  
  return Math.min(score, 100);
}

export function getPointsForCompleteness(completeness: number): number {
  if (completeness >= 80) return 25;
  return 10;
}
```

## Manual Admin User Creation

**After Deployment:**
1. Sign up admin account via UI
2. Get user ID from Supabase Dashboard (auth.users table)
3. Run this SQL:

```sql
INSERT INTO admin_users (user_id, role)
VALUES ('your-user-uuid-here', 'admin');
```

## Migration Script

**File:** `database-schema.sql`

This file should contain ALL the SQL above in order:
1. Create tables (user_profiles, grow_logs, admin_users)
2. Enable RLS on all tables
3. Create RLS policies
4. Create indexes
5. Create functions
6. Create triggers
7. Create storage bucket policies

## Implementation Checklist
- [ ] Create database-schema.sql file with all SQL
- [ ] Run schema in Supabase SQL Editor
- [ ] Verify all tables created
- [ ] Verify RLS enabled on all tables
- [ ] Test RLS policies (users can only see own data)
- [ ] Create grow-photos storage bucket
- [ ] Apply storage policies
- [ ] Test file upload to storage
- [ ] Create admin user manually
- [ ] Generate TypeScript types
- [ ] Create constants file
- [ ] Create utility functions
- [ ] Test all database functions
- [ ] Verify triggers work (new user → auto profile)

## Testing Queries

### Test User Profile Creation
```sql
-- Should auto-create profile when user signs up
SELECT * FROM user_profiles WHERE email = 'test@example.com';
```

### Test RLS Policies
```sql
-- As regular user, should only see own logs
SELECT * FROM grow_logs;

-- As admin, should see all logs
SELECT * FROM grow_logs;
```

### Test Completeness Calculation
```sql
SELECT calculate_completeness_score('log-uuid-here');
```

### Test Points Addition
```sql
SELECT add_user_points('user-uuid-here', 25);
SELECT total_points, verification_level FROM user_profiles WHERE id = 'user-uuid-here';
```

## Success Criteria
- All tables created with correct constraints
- RLS policies protect user data
- Storage bucket accepts image uploads
- Database functions work correctly
- Triggers execute on expected events
- Indexes improve query performance
- TypeScript types generated and working
- Admin can be created manually
- No errors in Supabase logs

## Handoff to Other Agents
- **Authentication Agent:** Trigger creates user_profiles automatically
- **Grow Log Agent:** Schema ready, functions available, storage configured
- **Dashboard Agent:** Query structure documented, types available
- **Admin Agent:** Admin table ready, policies configured

## Files to Create
1. `database-schema.sql` (complete migration)
2. `lib/types/database.ts` (generated)
3. `lib/types/growLog.ts` (custom types)
4. `lib/constants/growingOptions.ts`
5. `lib/utils/dataCompleteness.ts`
