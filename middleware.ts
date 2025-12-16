import { NextResponse, type NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/types/database'

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabase = createMiddlewareClient<Database>({ req, res })
  
  const { data: { session } } = await supabase.auth.getSession()
  
  // Protect /dashboard routes
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }
  
  // Protect /admin routes (except /admin/login)
  if (req.nextUrl.pathname.startsWith('/admin') && !req.nextUrl.pathname.startsWith('/admin/login')) {
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
    
    // Check admin role
    const { data: adminData } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', session.user.id)
      .single()
    
    if (!adminData) {
      // Not an admin - redirect to user dashboard
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }
  
  return res
}

export const config = {
  matcher: ['/dashboard/:path*', '/dashboard', '/admin/:path*']
}
