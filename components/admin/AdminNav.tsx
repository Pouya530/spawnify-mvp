'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Shield, BarChart3, Users, FileText, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils/cn'
import { createClient } from '@/lib/supabase/client'

function AdminNavLink({ href, icon, children }: { href: string; icon: React.ReactNode; children: React.ReactNode }) {
  const pathname = usePathname()
  const isActive = pathname === href
  
  return (
    <Link 
      href={href}
      className={cn(
        'flex items-center gap-2 text-sm transition-colors px-3 py-2 rounded-lg',
        isActive 
          ? 'text-primary-400 font-medium bg-neutral-800' 
          : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
      )}
    >
      {icon}
      {children}
    </Link>
  )
}

export function AdminNav() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <nav className="sticky top-0 z-50 bg-neutral-900 text-white border-b border-neutral-800">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-primary-400" />
            <Link href="/admin/dashboard" className="text-xl font-bold hover:text-primary-400 transition-colors">
              Spawnify Admin
            </Link>
          </div>
          
          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-2">
            <AdminNavLink href="/admin/dashboard" icon={<BarChart3 className="w-4 h-4" />}>
              Dashboard
            </AdminNavLink>
            <AdminNavLink href="/admin/users" icon={<Users className="w-4 h-4" />}>
              Users
            </AdminNavLink>
            <AdminNavLink href="/admin/grow-logs" icon={<FileText className="w-4 h-4" />}>
              Grow Logs
            </AdminNavLink>
          </div>
          
          {/* Logout */}
          <Button
            variant="ghost"
            size="small"
            onClick={handleLogout}
            className="text-neutral-400 hover:text-white"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </nav>
  )
}

