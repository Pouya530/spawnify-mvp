'use client'

import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Database } from '@/lib/types/database'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']

interface UserRowProps {
  user: UserProfile
}

export function UserRow({ user }: UserRowProps) {
  const router = useRouter()
  
  return (
    <tr className="hover:bg-neutral-50 transition-colors">
      <td className="px-6 py-4 text-sm font-medium text-neutral-900">
        {user.email}
      </td>
      <td className="px-6 py-4 text-sm text-neutral-600">
        {user.full_name || '—'}
      </td>
      <td className="px-6 py-4">
        <Badge variant={user.verification_level as 'bronze' | 'silver' | 'gold'}>
          {user.verification_level.charAt(0).toUpperCase() + user.verification_level.slice(1)}
        </Badge>
      </td>
      <td className="px-6 py-4 text-sm font-medium text-neutral-900">
        {user.total_points}
      </td>
      <td className="px-6 py-4 text-sm text-neutral-600">
        {format(new Date(user.created_at), 'MMM dd, yyyy')}
      </td>
      <td className="px-6 py-4 text-right">
        <Button
          variant="ghost"
          size="small"
          onClick={() => router.push(`/admin/grow-logs?user=${user.id}`)}
        >
          View Logs
        </Button>
      </td>
    </tr>
  )
}

