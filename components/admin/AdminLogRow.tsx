'use client'

import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Database } from '@/lib/types/database'

type GrowLog = Database['public']['Tables']['grow_logs']['Row']

interface AdminLogRowProps {
  log: GrowLog & {
    user_profile?: {
      email: string
      full_name?: string
    }
  }
}

export function AdminLogRow({ log }: AdminLogRowProps) {
  const router = useRouter()
  
  return (
    <tr 
      className="hover:bg-neutral-50 transition-colors cursor-pointer"
      onClick={() => router.push(`/dashboard/grow-logs/${log.id}`)}
    >
      <td className="px-6 py-4 text-sm text-neutral-900">
        <div>
          <p className="font-medium">{log.user_profile?.email || 'Unknown'}</p>
          {log.user_profile?.full_name && (
            <p className="text-xs text-neutral-500">{log.user_profile.full_name}</p>
          )}
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-neutral-900">
        {format(new Date(log.log_date), 'MMM dd, yyyy')}
      </td>
      <td className="px-6 py-4 text-sm font-medium text-neutral-900">
        {log.strain}
      </td>
      <td className="px-6 py-4">
        <Badge variant="default">{log.growth_stage}</Badge>
      </td>
      <td className="px-6 py-4 text-sm text-neutral-600">
        {log.growing_method}
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-20 h-2 bg-neutral-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 transition-all"
              style={{ width: `${log.data_completeness_score}%` }}
            />
          </div>
          <span className="text-xs text-neutral-600 w-12">
            {log.data_completeness_score}%
          </span>
        </div>
      </td>
      <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
        <Button
          variant="ghost"
          size="small"
          onClick={() => router.push(`/dashboard/grow-logs/${log.id}`)}
        >
          View
        </Button>
      </td>
    </tr>
  )
}

