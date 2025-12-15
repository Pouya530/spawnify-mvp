import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { AdminGrowLogsFilters } from '@/components/admin/AdminGrowLogsFilters'
import { AdminLogRow } from '@/components/admin/AdminLogRow'
import { ExportDataButton } from '@/components/admin/ExportDataButton'
import { Database } from '@/lib/types/database'

type GrowLog = Database['public']['Tables']['grow_logs']['Row']

interface PageProps {
  searchParams: { 
    search?: string
    stage?: string
    user?: string
  }
}

export default async function AdminGrowLogsPage({ searchParams }: PageProps) {
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

  // Build query - fetch logs and user profiles separately for better compatibility
  let query = supabase
    .from('grow_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  // Apply filters
  if (searchParams.search) {
    // Search in strain or user email
    query = query.or(`strain.ilike.%${searchParams.search}%`)
  }

  if (searchParams.stage) {
    query = query.eq('growth_stage', searchParams.stage)
  }

  if (searchParams.user) {
    query = query.eq('user_id', searchParams.user)
  }

  const { data: logs, count } = await query

  // Type guard: ensure logs is an array
  const logsTyped: GrowLog[] = logs || []

  // Fetch user profiles for all logs
  const userIds = [...new Set(logsTyped.map(log => log.user_id))]
  const { data: userProfiles } = await supabase
    .from('user_profiles')
    .select('id, email, full_name')
    .in('id', userIds)

  // Type guard for user profiles
  type UserProfile = Database['public']['Tables']['user_profiles']['Row']
  const userProfilesTyped: UserProfile[] = userProfiles || []

  // Create a map of user_id to profile
  const userProfileMap = new Map(
    userProfilesTyped.map(profile => [profile.id, profile])
  )

  // Enrich logs with user profile data
  const enrichedLogs = logsTyped.map(log => ({
    ...log,
    user_profile: userProfileMap.get(log.user_id)
  }))

  // Filter logs if search param exists
  let filteredLogs = enrichedLogs
  if (searchParams.search) {
    const searchLower = searchParams.search.toLowerCase()
    filteredLogs = enrichedLogs.filter(log => {
      const userEmail = (log as any).user_profile?.email?.toLowerCase() || ''
      return log.strain.toLowerCase().includes(searchLower) || userEmail.includes(searchLower)
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">
            All Grow Logs
          </h1>
          <p className="text-neutral-600 mt-1">
            {count || 0} total logs
          </p>
        </div>
        
        <ExportDataButton logs={filteredLogs} />
      </div>
      
      {/* Filters */}
      <AdminGrowLogsFilters />
      
      {/* Logs Table */}
      {filteredLogs && filteredLogs.length > 0 ? (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-600">User</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-600">Date</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-600">Strain</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-600">Stage</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-600">Method</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-600">Completeness</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-neutral-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredLogs.map(log => (
                  <AdminLogRow key={log.id} log={log as any} />
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-neutral-600">No grow logs found</p>
        </Card>
      )}
    </div>
  )
}

