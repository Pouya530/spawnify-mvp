import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { UserFilters } from '@/components/admin/UserFilters'
import { UserRow } from '@/components/admin/UserRow'
import { Database } from '@/lib/types/database'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']

interface PageProps {
  searchParams: { search?: string; level?: string; sort?: string }
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
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

  // Build query
  let query = supabase
    .from('user_profiles')
    .select('*', { count: 'exact' })

  // Apply filters
  if (searchParams.search) {
    query = query.ilike('email', `%${searchParams.search}%`)
  }

  if (searchParams.level) {
    query = query.eq('verification_level', searchParams.level)
  }

  // Apply sorting
  const sortField = searchParams.sort || 'created_at'
  const ascending = sortField === 'email' // Sort email ascending, others descending
  query = query.order(sortField, { ascending })

  const { data: users, count } = await query

  // Type guard: ensure users is an array
  const usersTyped: UserProfile[] = users || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">
            User Management
          </h1>
          <p className="text-neutral-600 mt-1">
            Manage and view all platform users
          </p>
        </div>
        <div className="text-sm text-neutral-600">
          {count || 0} total users
        </div>
      </div>
      
      {/* Filters */}
      <UserFilters />
      
      {/* Users Table */}
      {usersTyped.length > 0 ? (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-600">Email</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-600">Full Name</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-600">Tier</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-600">Points</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-600">Joined</th>
                  <th className="text-right px-6 py-4 text-sm font-semibold text-neutral-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {usersTyped.map(user => (
                  <UserRow key={user.id} user={user} />
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="p-12 text-center">
          <p className="text-neutral-600">No users found</p>
        </Card>
      )}
    </div>
  )
}

