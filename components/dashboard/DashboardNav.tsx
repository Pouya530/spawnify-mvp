import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { LogoutButton } from '@/components/auth/LogoutButton'
import { Badge } from '@/components/ui/Badge'
import { Database } from '@/lib/types/database'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']

export async function DashboardNav() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Fetch user profile for tier badge
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('verification_level, email')
    .eq('id', user.id)
    .single()

  // Type guard - create a partial type for the selected fields
  const profileTyped = profile as Pick<UserProfile, 'verification_level' | 'email'> | null
  const tier = profileTyped?.verification_level || 'bronze'

  return (
    <nav className="bg-white border-b border-neutral-200 sticky top-0 z-50">
      <div className="container mx-auto px-6 md:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="text-xl font-bold text-neutral-900">
            Spawnify
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            <Link
              href="/dashboard"
              className="text-sm font-medium text-neutral-900 hover:text-primary-600 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/grow-logs"
              className="text-sm font-medium text-neutral-600 hover:text-primary-600 transition-colors"
            >
              Grow Logs
            </Link>
            <Link
              href="/dashboard/chat"
              className="text-sm font-medium text-neutral-600 hover:text-primary-600 transition-colors"
            >
              AI Assistant
            </Link>
            <Link
              href="/dashboard/settings"
              className="text-sm font-medium text-neutral-600 hover:text-primary-600 transition-colors"
            >
              Settings
            </Link>
          </div>

          {/* User Section */}
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-neutral-500">{profileTyped?.email || user.email}</p>
                <Badge variant={tier as 'bronze' | 'silver' | 'gold'} className="mt-1">
                  {tier.charAt(0).toUpperCase() + tier.slice(1)}
                </Badge>
              </div>
            </div>
            <LogoutButton variant="ghost" size="small" />
          </div>
        </div>
      </div>
    </nav>
  )
}

