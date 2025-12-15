'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/Button'

interface ViewButtonProps {
  href: string
}

export function ViewButton({ href }: ViewButtonProps) {
  return (
    <Link href={href} onClick={(e) => e.stopPropagation()}>
      <Button variant="ghost" size="small">
        View
      </Button>
    </Link>
  )
}

