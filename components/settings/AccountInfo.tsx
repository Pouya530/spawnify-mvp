'use client'

import { format } from 'date-fns'
import { Card } from '@/components/ui/Card'
import { Database } from '@/lib/types/database'
import { User } from '@supabase/supabase-js'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']

interface AccountInfoProps {
  user: User | null
  profile: UserProfile | null
}

export function AccountInfo({ user, profile }: AccountInfoProps) {
  return (
    <Card className="p-8">
      <h2 className="text-xl font-bold text-neutral-900 mb-6">
        Account Information
      </h2>
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
          <InfoRow 
            label="Account Created" 
            value={profile?.created_at 
              ? format(new Date(profile.created_at), 'MMMM dd, yyyy')
              : 'N/A'
            } 
          />
          <InfoRow 
            label="User ID" 
            value={user?.id ? `${user.id.slice(0, 8)}...` : 'N/A'} 
          />
          <InfoRow 
            label="Email Verified" 
            value={user?.email_confirmed_at ? 'Yes' : 'No'} 
          />
          <InfoRow 
            label="Last Sign In" 
            value={user?.last_sign_in_at 
              ? format(new Date(user.last_sign_in_at), 'MMM dd, yyyy')
              : 'N/A'
            } 
          />
        </div>
      </div>
    </Card>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-neutral-600 mb-1">{label}</p>
      <p className="text-sm font-medium text-neutral-900">{value}</p>
    </div>
  )
}

