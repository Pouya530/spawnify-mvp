import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { GrowLogsPageContent } from '@/components/grow-logs/GrowLogsPageContent'
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

  return (
    <GrowLogsPageContent
      userId={user.id}
      initialLogs={logsTyped}
      totalCount={count || 0}
      currentPage={page}
      searchParams={searchParams}
    />
  )
}

