import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminNav } from '@/components/admin/AdminNav'

export default async function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // Verify admin access (middleware handles /admin/login separately)
  if (user) {
    const { data: adminData } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', user.id)
      .single()
    
    if (!adminData) {
      // Not an admin - redirect to user dashboard
      redirect('/dashboard')
    }
  } else {
    // Not logged in - middleware will handle redirect to /admin/login
    // But we still need to show login page, so don't redirect here
  }
  
  return (
    <div className="min-h-screen bg-neutral-50">
      {user && <AdminNav />}
      <main className={`container mx-auto px-6 py-8 md:px-8 lg:px-12 ${!user ? 'flex items-center justify-center min-h-screen' : ''}`}>
        {children}
      </main>
    </div>
  )
}

