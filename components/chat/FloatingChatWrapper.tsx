'use client'

import { usePathname } from 'next/navigation'
import { FloatingChatWidget } from './FloatingChatWidget'

export function FloatingChatWrapper() {
  const pathname = usePathname()
  
  // Hide floating widget on dedicated chat page and auth pages
  if (
    pathname === '/dashboard/chat' ||
    pathname?.startsWith('/login') ||
    pathname?.startsWith('/signup') ||
    pathname?.startsWith('/admin/login')
  ) {
    return null
  }

  return <FloatingChatWidget />
}


