'use client'

import { usePathname } from 'next/navigation'
import { FloatingChatWidget } from './FloatingChatWidget'

export function FloatingChatProvider() {
  const pathname = usePathname()
  
  // Hide floating widget on dedicated chat page
  if (pathname === '/dashboard/chat') {
    return null
  }

  return <FloatingChatWidget />
}

