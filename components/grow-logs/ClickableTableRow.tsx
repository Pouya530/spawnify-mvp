'use client'

import { useRouter } from 'next/navigation'
import { ReactNode } from 'react'

interface ClickableTableRowProps {
  href: string
  children: ReactNode
  className?: string
}

export function ClickableTableRow({ href, children, className }: ClickableTableRowProps) {
  const router = useRouter()
  
  return (
    <tr 
      className={`cursor-pointer hover:bg-neutral-50 transition-colors ${className || ''}`}
      onClick={() => router.push(href)}
    >
      {children}
    </tr>
  )
}

