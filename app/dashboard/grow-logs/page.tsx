import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { GrowLogsFilters } from '@/components/grow-logs/GrowLogsFilters'
import { ClickableTableRow } from '@/components/grow-logs/ClickableTableRow'
import { ViewButton } from '@/components/grow-logs/ViewButton'
import Link from 'next/link'
import { format } from 'date-fns'
import { Plus, Package } from 'lucide-react'
import { Database } from '@/lib/types/database'

type GrowLog = Database['public']['Tables']['grow_logs']['Row']

interface PageProps {
  searchParams: { stage?: string; search?: string; page?: string }
}

export default async function GrowLogsPage({ searchParams }: PageProps) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const page = parseInt(searchParams.page || '1')
  const perPage = 20
  const offset = (page - 1) * perPage

  // Build query
  let query = supabase
    .from('grow_logs')
    .select('*', { count: 'exact' })
    .eq('user_id', user.id)
    .order('log_date', { ascending: false })
    .range(offset, offset + perPage - 1)

  // Apply filters
  if (searchParams.stage) {
    query = query.eq('growth_stage', searchParams.stage)
  }

  if (searchParams.search) {
    query = query.ilike('strain', `%${searchParams.search}%`)
  }

  const { data: logs, count, error } = await query

  if (error) {
    console.error('Error fetching logs:', error)
  }

  // Type guard: ensure logs is an array
  const logsTyped: GrowLog[] = logs || []
  const totalPages = Math.ceil((count || 0) / perPage)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">
            Grow Logs
          </h1>
          <p className="text-neutral-600 mt-1">
            Track and manage your mushroom cultivation logs
          </p>
        </div>
        <Link href="/dashboard/grow-logs/new">
          <Button variant="primary" size="medium">
            <Plus className="w-4 h-4 mr-2" />
            New Log
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <GrowLogsFilters />

      {/* Table or Empty State */}
      {logsTyped.length > 0 ? (
        <>
          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-600">Date</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-600">Strain</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-600">Stage</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-600">Method</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-600">Completeness</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-neutral-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {logsTyped.map((log) => (
                    <ClickableTableRow key={log.id} href={`/dashboard/grow-logs/${log.id}`}>
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
                      <td className="px-6 py-4 text-right">
                        <ViewButton href={`/dashboard/grow-logs/${log.id}`} />
                      </td>
                    </ClickableTableRow>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-neutral-600">
                Showing {offset + 1}-{Math.min(offset + perPage, count || 0)} of {count} logs
              </p>
              <div className="flex gap-2">
                {page > 1 && (
                  <Link href={`/dashboard/grow-logs?${new URLSearchParams({ ...searchParams, page: String(page - 1) }).toString()}`}>
                    <Button variant="secondary" size="small">
                      Previous
                    </Button>
                  </Link>
                )}
                {page < totalPages && (
                  <Link href={`/dashboard/grow-logs?${new URLSearchParams({ ...searchParams, page: String(page + 1) }).toString()}`}>
                    <Button variant="secondary" size="small">
                      Next
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <Card>
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              No grow logs yet
            </h3>
            <p className="text-neutral-600 mb-6">
              Start tracking your mushroom cultivation journey by creating your first grow log.
            </p>
            <Link href="/dashboard/grow-logs/new">
              <Button variant="primary">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Log
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  )
}

