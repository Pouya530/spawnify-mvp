import { ReactNode } from 'react'
import { cn } from '@/lib/utils/cn'

interface CardProps {
  children: ReactNode
  hover?: boolean
  padding?: 'small' | 'medium' | 'large'
  className?: string
}

export function Card({ children, hover = false, padding = 'medium', className }: CardProps) {
  const paddingClasses = {
    small: 'p-4',
    medium: 'p-6 md:p-8',
    large: 'p-8 md:p-12',
  }
  
  return (
    <div
      className={cn(
        'bg-white border border-neutral-200 rounded-2xl shadow-sm',
        paddingClasses[padding],
        hover && 'transition-standard hover:border-primary-400 hover:shadow-lg hover:shadow-primary-500/10',
        className
      )}
    >
      {children}
    </div>
  )
}

