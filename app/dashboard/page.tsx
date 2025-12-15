import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { format } from 'date-fns'
import { Plus, TrendingUp, Package, CheckCircle } from 'lucide-react'
import { ClickableTableRow } from '@/components/grow-logs/ClickableTableRow'
import { ViewButton } from '@/components/grow-logs/ViewButton'
import { Database } from '@/lib/types/database'

type GrowLog = Database['public']['Tables']['grow_logs']['Row']
type UserProfile = Database['public']['Tables']['user_profiles']['Row']

export default async function DashboardPage() {
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

  // Fetch all user's logs
  const { data: allLogs } = await supabase
    .from('grow_logs')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  // Type guard: ensure allLogs is an array
  const logs: GrowLog[] = allLogs || []

  // Calculate stats
  const totalLogs = logs.length
  const inProgress = logs.filter(log => log.growth_stage !== 'Harvest').length
  const completed = logs.filter(log => log.growth_stage === 'Harvest').length
  const totalYield = logs.reduce((sum, log) => sum + (log.weight || 0), 0)

  // Get recent logs (last 10)
  const recentLogs = logs.slice(0, 10)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Dashboard</h1>
          <p className="text-neutral-600 mt-1">
            Welcome back, {(profile as UserProfile | null)?.full_name || user.email}
          </p>
        </div>
        <Link href="/dashboard/grow-logs/new">
          <Button variant="primary" size="medium">
            <Plus className="w-4 h-4 mr-2" />
            New Grow Log
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Total Logs</p>
              <p className="text-3xl font-bold text-neutral-900 mt-1">{totalLogs}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">In Progress</p>
              <p className="text-3xl font-bold text-neutral-900 mt-1">{inProgress}</p>
            </div>
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-primary-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Completed</p>
              <p className="text-3xl font-bold text-neutral-900 mt-1">{completed}</p>
            </div>
            <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-success-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-600">Total Yield</p>
              <p className="text-3xl font-bold text-neutral-900 mt-1">
                {totalYield > 0 ? totalYield.toFixed(1) : '0.0'}
              </p>
              <p className="text-xs text-neutral-500 mt-1">grams</p>
            </div>
            <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-success-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-neutral-900">Recent Activity</h2>
          <Link href="/dashboard/grow-logs">
            <Button variant="ghost" size="small">
              View All
            </Button>
          </Link>
        </div>

        {recentLogs.length === 0 ? (
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
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-600">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-600">Strain</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-600">Stage</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-600">Method</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-neutral-600">Completeness</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-neutral-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.map((log) => (
                  <ClickableTableRow 
                    key={log.id} 
                    href={`/dashboard/grow-logs/${log.id}`}
                    className="border-b border-neutral-100"
                  >
                    <td className="py-3 px-4 text-sm text-neutral-900">
                      {format(new Date(log.log_date), 'MMM dd, yyyy')}
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-neutral-900">{log.strain}</td>
                    <td className="py-3 px-4">
                      <Badge variant="default">{log.growth_stage}</Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-neutral-600">{log.growing_method}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-neutral-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary-500 transition-all"
                            style={{ width: `${log.data_completeness_score}%` }}
                          />
                        </div>
                        <span className="text-xs text-neutral-600">{log.data_completeness_score}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <ViewButton href={`/dashboard/grow-logs/${log.id}`} />
                    </td>
                  </ClickableTableRow>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}

