import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProfileSettings } from '@/components/settings/ProfileSettings'
import { GamificationStats } from '@/components/settings/GamificationStats'
import { PasswordSettings } from '@/components/settings/PasswordSettings'
import { DataPrivacySettings } from '@/components/settings/DataPrivacySettings'
import { AccountInfo } from '@/components/settings/AccountInfo'

export default async function SettingsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch user's grow logs for additional stats
  const { data: logs } = await supabase
    .from('grow_logs')
    .select('data_completeness_score')
    .eq('user_id', user.id)

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">
          Settings
        </h1>
        <p className="text-neutral-600 mt-2">
          Manage your account and preferences
        </p>
      </div>
      
      {/* Profile Section */}
      <ProfileSettings profile={profile} userEmail={user.email} />
      
      {/* Gamification Stats */}
      <GamificationStats profile={profile} logs={logs || []} />
      
      {/* Password Change */}
      <PasswordSettings />
      
      {/* Data Privacy */}
      <DataPrivacySettings />
      
      {/* Account Info */}
      <AccountInfo user={user} profile={profile} />
    </div>
  )
}

