import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { AdminStatCard } from '@/components/admin/AdminStatCard'
import { ExportDataButton } from '@/components/admin/ExportDataButton'
import Link from 'next/link'
import { Users, FileText, Activity, TrendingUp } from 'lucide-react'
import { Database } from '@/lib/types/database'

type GrowLog = Database['public']['Tables']['grow_logs']['Row']

export default async function AdminDashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  // Verify admin access
  const { data: adminData } = await supabase
    .from('admin_users')
    .select('role')
    .eq('user_id', user.id)
    .single()

  if (!adminData) {
    redirect('/dashboard')
  }

  // Fetch stats
  const { count: totalUsers } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true })

  const { count: totalLogs } = await supabase
    .from('grow_logs')
    .select('*', { count: 'exact', head: true })

  // Active users (logs in last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: activeLogs } = await supabase
    .from('grow_logs')
    .select('user_id')
    .gte('created_at', thirtyDaysAgo.toISOString())

  const activeLogsTyped: GrowLog[] = activeLogs || []
  const activeUserIds = new Set(activeLogsTyped.map(log => log.user_id))
  const activeUsers = activeUserIds.size

  // Average completeness
  const { data: allLogs } = await supabase
    .from('grow_logs')
    .select('data_completeness_score')

  const allLogsTyped: GrowLog[] = allLogs || []

  const avgCompleteness = allLogsTyped.length > 0
    ? Math.round(
        allLogsTyped.reduce((sum, log) => sum + log.data_completeness_score, 0) / allLogsTyped.length
      )
    : 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">
          Admin Dashboard
        </h1>
        <p className="text-neutral-600 mt-2">
          System overview and statistics
        </p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatCard
          title="Total Users"
          value={totalUsers || 0}
          icon={<Users className="w-6 h-6" />}
          color="blue"
        />
        <AdminStatCard
          title="Total Grow Logs"
          value={totalLogs || 0}
          icon={<FileText className="w-6 h-6" />}
          color="primary"
        />
        <AdminStatCard
          title="Active Users (30d)"
          value={activeUsers}
          icon={<Activity className="w-6 h-6" />}
          color="success"
        />
        <AdminStatCard
          title="Avg Completeness"
          value={`${avgCompleteness}%`}
          icon={<TrendingUp className="w-6 h-6" />}
          color="purple"
        />
      </div>
      
      {/* Quick Actions */}
      <Card className="p-8">
        <h2 className="text-xl font-bold text-neutral-900 mb-6">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/admin/users">
            <Button variant="secondary" className="w-full">
              <Users className="w-4 h-4 mr-2" />
              Manage Users
            </Button>
          </Link>
          <Link href="/admin/grow-logs">
            <Button variant="secondary" className="w-full">
              <FileText className="w-4 h-4 mr-2" />
              View All Logs
            </Button>
          </Link>
          <ExportDataButton logs={allLogsTyped} variant="secondary" />
        </div>
      </Card>
    </div>
  )
}

