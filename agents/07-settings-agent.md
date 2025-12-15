# Settings Agent

## Role
You are the Settings Agent responsible for implementing the user settings page, profile management, password changes, and data privacy preferences for Spawnify MVP.

## Primary Objectives
1. Create user settings page
2. Implement profile editing (full name)
3. Implement password change functionality
4. Display gamification stats (points, tier, account info)
5. Manage data privacy preferences
6. Ensure data validation and security

## Tech Stack
- Next.js 14.2+ (App Router)
- Supabase client (auth + database)
- React Hook Form (form management)
- Lucide React icons
- Tailwind CSS

## Route Structure

```
/dashboard/settings → User settings page
```

## Settings Page Layout

### File: `app/(dashboard)/settings/page.tsx`

**Purpose:** User profile settings and account management

**Sections:**
1. Profile Information
2. Gamification Stats
3. Security (Password Change)
4. Data Privacy
5. Account Information

```tsx
export default async function SettingsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user?.id)
    .single();
  
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-neutral-900 tracking-tight">
          Settings
        </h1>
        <p className="text-neutral-600 mt-2">
          Manage your account and preferences
        </p>
      </div>
      
      {/* Profile Section */}
      <ProfileSettings profile={profile} />
      
      {/* Gamification Stats */}
      <GamificationStats profile={profile} />
      
      {/* Password Change */}
      <PasswordSettings />
      
      {/* Data Privacy */}
      <DataPrivacySettings />
      
      {/* Account Info */}
      <AccountInfo user={user} profile={profile} />
    </div>
  );
}
```

## 1. Profile Settings Component

### File: `components/settings/ProfileSettings.tsx`

**Purpose:** Edit user profile information

**Editable Fields:**
- Full Name

**Read-only Fields:**
- Email (display only, cannot change)

```tsx
'use client';

interface ProfileSettingsProps {
  profile: UserProfile | null;
}

export function ProfileSettings({ profile }: ProfileSettingsProps) {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      full_name: profile?.full_name || ''
    }
  });
  
  async function onSubmit(data: { full_name: string }) {
    setLoading(true);
    
    try {
      const supabase = createClient();
      
      const { error } = await supabase
        .from('user_profiles')
        .update({ full_name: data.full_name })
        .eq('id', profile?.id);
      
      if (error) throw error;
      
      setEditing(false);
      router.refresh();
      
    } catch (error) {
      console.error(error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <Card className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-neutral-900">
          Profile Information
        </h2>
        {!editing && (
          <Button 
            variant="ghost" 
            onClick={() => setEditing(true)}
          >
            <Edit className="w-4 h-4" />
            Edit
          </Button>
        )}
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email (read-only) */}
        <div>
          <label className="block text-sm font-medium text-neutral-900 mb-2">
            Email
          </label>
          <Input
            type="email"
            value={profile?.email || ''}
            disabled
            icon={<Mail />}
          />
          <p className="text-xs text-neutral-500 mt-1">
            Email cannot be changed
          </p>
        </div>
        
        {/* Full Name */}
        <Input
          label="Full Name"
          placeholder="John Doe"
          disabled={!editing}
          error={errors.full_name?.message}
          icon={<User />}
          {...register('full_name')}
        />
        
        {/* Action Buttons */}
        {editing && (
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setEditing(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
            >
              Save Changes
            </Button>
          </div>
        )}
      </form>
    </Card>
  );
}
```

## 2. Gamification Stats Component

### File: `components/settings/GamificationStats.tsx`

**Purpose:** Display user's gamification stats

**Stats:**
- Current Tier (with badge)
- Total Points
- Progress to next tier

```tsx
interface GamificationStatsProps {
  profile: UserProfile | null;
}

export function GamificationStats({ profile }: GamificationStatsProps) {
  const tierInfo = getTierInfo(profile?.verification_level || 'bronze');
  const nextTierPoints = getNextTierPoints(profile?.total_points || 0);
  const progressPercentage = calculateTierProgress(
    profile?.total_points || 0,
    profile?.verification_level || 'bronze'
  );
  
  return (
    <Card className="p-8">
      <h2 className="text-xl font-bold text-neutral-900 mb-6">
        Your Progress
      </h2>
      
      <div className="space-y-6">
        {/* Current Tier */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-600 mb-2">Current Tier</p>
            <Badge variant={profile?.verification_level as any} className="text-base px-4 py-2">
              {tierInfo.icon} {tierInfo.name}
            </Badge>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-neutral-600 mb-1">Total Points</p>
            <p className="text-3xl font-bold text-neutral-900">
              {profile?.total_points || 0}
            </p>
          </div>
        </div>
        
        {/* Progress to Next Tier */}
        {nextTierPoints && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-600">
                Progress to {getNextTierName(profile?.verification_level || 'bronze')}
              </span>
              <span className="font-medium text-neutral-900">
                {profile?.total_points || 0} / {nextTierPoints} points
              </span>
            </div>
            
            <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary-500 transition-all"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            
            <p className="text-xs text-neutral-500">
              {nextTierPoints - (profile?.total_points || 0)} points until {getNextTierName(profile?.verification_level || 'bronze')}
            </p>
          </div>
        )}
        
        {/* Tier Benefits */}
        <div className="pt-4 border-t border-neutral-200">
          <p className="text-sm font-medium text-neutral-900 mb-3">
            How to Earn Points
          </p>
          <div className="space-y-2 text-sm text-neutral-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success-500" />
              <span>Create a basic log: +10 points</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success-500" />
              <span>Complete log (≥80% completeness): +25 points</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success-500" />
              <span>Add detailed TEK notes: +15 points</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success-500" />
              <span>Upload photos: +10 points</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

function getTierInfo(tier: string) {
  const tiers = {
    bronze: { name: 'Bronze', icon: '🥉' },
    silver: { name: 'Silver', icon: '🥈' },
    gold: { name: 'Gold', icon: '🥇' }
  };
  return tiers[tier as keyof typeof tiers] || tiers.bronze;
}

function getNextTierPoints(currentPoints: number) {
  if (currentPoints < 100) return 100; // Bronze → Silver
  if (currentPoints < 500) return 500; // Silver → Gold
  return null; // Already Gold
}

function getNextTierName(currentTier: string) {
  const next = {
    bronze: 'Silver',
    silver: 'Gold',
    gold: 'Gold'
  };
  return next[currentTier as keyof typeof next] || 'Silver';
}

function calculateTierProgress(points: number, tier: string) {
  if (tier === 'bronze') {
    return Math.min((points / 100) * 100, 100);
  }
  if (tier === 'silver') {
    return Math.min(((points - 100) / 400) * 100, 100);
  }
  return 100; // Gold
}
```

## 3. Password Settings Component

### File: `components/settings/PasswordSettings.tsx`

**Purpose:** Allow users to change their password

**Security:**
- Require current password (Supabase best practice)
- Minimum 8 characters for new password
- Confirm new password

```tsx
'use client';

export function PasswordSettings() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    defaultValues: {
      newPassword: '',
      confirmPassword: ''
    }
  });
  
  const newPassword = watch('newPassword');
  
  async function onSubmit(data: { newPassword: string }) {
    setLoading(true);
    setError('');
    setSuccess(false);
    
    try {
      const supabase = createClient();
      
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword
      });
      
      if (error) throw error;
      
      setSuccess(true);
      reset();
      
      // Auto-hide success message
      setTimeout(() => setSuccess(false), 3000);
      
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <Card className="p-8">
      <h2 className="text-xl font-bold text-neutral-900 mb-6">
        Change Password
      </h2>
      
      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-success-50 border border-success-200 rounded-xl">
          <p className="text-sm text-success-700">
            Password updated successfully!
          </p>
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          type="password"
          label="New Password"
          placeholder="••••••••"
          error={errors.newPassword?.message}
          icon={<Lock />}
          {...register('newPassword', {
            required: 'Password is required',
            minLength: {
              value: 8,
              message: 'Password must be at least 8 characters'
            }
          })}
        />
        
        <Input
          type="password"
          label="Confirm New Password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          icon={<Lock />}
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: value => 
              value === newPassword || 'Passwords do not match'
          })}
        />
        
        <div className="flex justify-end">
          <Button 
            type="submit" 
            variant="primary"
            loading={loading}
          >
            Update Password
          </Button>
        </div>
      </form>
    </Card>
  );
}
```

## 4. Data Privacy Component

### File: `components/settings/DataPrivacySettings.tsx`

**Purpose:** Manage data sharing preferences

**Note:** For MVP, this is informational only. In Phase 2, add opt-in/opt-out functionality.

```tsx
'use client';

export function DataPrivacySettings() {
  const [optIn, setOptIn] = useState(true);
  
  return (
    <Card className="p-8">
      <h2 className="text-xl font-bold text-neutral-900 mb-6">
        Data Privacy
      </h2>
      
      <div className="space-y-6">
        {/* Information Banner */}
        <div className="p-4 bg-primary-50 border border-primary-200 rounded-xl">
          <div className="flex gap-3">
            <Info className="w-5 h-5 text-primary-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-primary-900">
              <p className="font-medium mb-2">
                Contributing to Mushroom Science
              </p>
              <p>
                Your anonymized cultivation data helps advance research in:
              </p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>AI-driven analysis of optimal growing conditions</li>
                <li>Scientific research papers</li>
                <li>Smart grow kit development and optimization</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Opt-in Checkbox (MVP: display only) */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="data-sharing"
            checked={optIn}
            onChange={(e) => setOptIn(e.target.checked)}
            disabled
            className="mt-1 w-4 h-4 text-primary-600 rounded border-neutral-300"
          />
          <label htmlFor="data-sharing" className="text-sm text-neutral-600">
            <span className="font-medium text-neutral-900">
              Share my anonymized data for scientific research
            </span>
            <br />
            Your personal information (email, photos, notes) is never included.
            Only anonymized cultivation data is used.
          </label>
        </div>
        
        <p className="text-xs text-neutral-500">
          Note: Opt-out functionality will be available in a future update.
        </p>
        
        {/* Privacy Policy Link */}
        <div className="pt-4 border-t border-neutral-200">
          <a 
            href="/privacy" 
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            View Privacy Policy →
          </a>
        </div>
      </div>
    </Card>
  );
}
```

## 5. Account Info Component

### File: `components/settings/AccountInfo.tsx`

**Purpose:** Display read-only account information

```tsx
interface AccountInfoProps {
  user: any;
  profile: UserProfile | null;
}

export function AccountInfo({ user, profile }: AccountInfoProps) {
  return (
    <Card className="p-8">
      <h2 className="text-xl font-bold text-neutral-900 mb-6">
        Account Information
      </h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          <InfoRow 
            label="Account Created" 
            value={format(new Date(profile?.created_at || ''), 'MMMM dd, yyyy')} 
          />
          <InfoRow 
            label="User ID" 
            value={user?.id.slice(0, 8) + '...'} 
          />
          <InfoRow 
            label="Email Verified" 
            value={user?.email_confirmed_at ? 'Yes' : 'No'} 
          />
          <InfoRow 
            label="Last Sign In" 
            value={user?.last_sign_in_at ? format(new Date(user.last_sign_in_at), 'MMM dd, yyyy') : 'N/A'} 
          />
        </div>
      </div>
    </Card>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-neutral-600 mb-1">{label}</p>
      <p className="text-sm font-medium text-neutral-900">{value}</p>
    </div>
  );
}
```

## Utility Functions

### File: `lib/utils/tierProgress.ts`

```tsx
export function getTierThresholds() {
  return {
    bronze: { min: 0, max: 99 },
    silver: { min: 100, max: 499 },
    gold: { min: 500, max: Infinity }
  };
}

export function getNextTier(currentTier: string): string | null {
  const tiers = ['bronze', 'silver', 'gold'];
  const currentIndex = tiers.indexOf(currentTier);
  if (currentIndex === -1 || currentIndex === tiers.length - 1) {
    return null;
  }
  return tiers[currentIndex + 1];
}

export function getPointsToNextTier(currentPoints: number, currentTier: string): number | null {
  const nextTier = getNextTier(currentTier);
  if (!nextTier) return null;
  
  const thresholds = getTierThresholds();
  return thresholds[nextTier as keyof typeof thresholds].min - currentPoints;
}
```

## Form Validation

### Password Requirements
- Minimum 8 characters
- Must match confirmation
- Cannot be empty

### Profile Requirements
- Full name: Optional, any string
- Email: Read-only (cannot be changed)

## Success States

### Profile Update
- Show success message briefly
- Refresh page data
- Close edit mode

### Password Update
- Show success message for 3 seconds
- Clear form fields
- Auto-hide success message

## Error Handling

### Common Errors
- "Failed to update profile" → Database error
- "Failed to update password" → Auth error
- "Passwords do not match" → Validation error

### Display
- Red background for errors
- Green background for success
- Clear, user-friendly messages

## Loading States

### Profile Edit
- Disable form during save
- Show loading spinner in button
- Prevent double submissions

### Password Change
- Disable form during update
- Show loading spinner in button
- Prevent double submissions

## Implementation Checklist
- [ ] Install React Hook Form
- [ ] Create settings page layout
- [ ] Implement ProfileSettings component
- [ ] Implement GamificationStats component
- [ ] Implement PasswordSettings component
- [ ] Implement DataPrivacySettings component
- [ ] Implement AccountInfo component
- [ ] Create tier utility functions
- [ ] Add form validation
- [ ] Add loading states
- [ ] Add success/error messages
- [ ] Test profile update
- [ ] Test password change
- [ ] Test tier progress display
- [ ] Verify responsive design

## Dependencies
```json
{
  "react-hook-form": "^7.48.0",
  "date-fns": "^3.6.0"
}
```

## Responsive Design

### Mobile (375px - 767px)
- Single column layout
- Full-width cards
- Stack form fields vertically

### Tablet (768px - 1023px)
- Two-column grid for info rows
- Full-width cards

### Desktop (1024px+)
- Max-width container (4xl)
- Two-column grid for stats
- Comfortable spacing

## Success Criteria
- Users can edit their full name
- Users can change their password
- Gamification stats display correctly
- Tier progress shows accurately
- Data privacy info is clear
- Account info displays correctly
- Forms have proper validation
- Loading states prevent double submissions
- Success/error messages are user-friendly
- Responsive on all devices

## Files to Create
1. `app/(dashboard)/settings/page.tsx`
2. `components/settings/ProfileSettings.tsx`
3. `components/settings/GamificationStats.tsx`
4. `components/settings/PasswordSettings.tsx`
5. `components/settings/DataPrivacySettings.tsx`
6. `components/settings/AccountInfo.tsx`
7. `lib/utils/tierProgress.ts`

## Handoff to Other Agents
- **Authentication Agent:** Password update via Supabase Auth
- **Database Agent:** Profile updates to user_profiles table
- **Dashboard Agent:** Uses same gamification logic
- **Design System Agent:** Uses all UI components
