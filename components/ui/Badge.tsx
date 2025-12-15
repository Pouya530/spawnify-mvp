import { cn } from '@/lib/utils/cn'

interface BadgeProps {
  variant: 'bronze' | 'silver' | 'gold' | 'success' | 'default'
  children: React.ReactNode
  className?: string
}

export function Badge({ variant, children, className }: BadgeProps) {
  const variants = {
    bronze: 'bg-neutral-200 text-neutral-700',
    silver: 'bg-neutral-300 text-neutral-800',
    gold: 'bg-yellow-100 text-yellow-800',
    success: 'bg-success-100 text-success-700',
    default: 'bg-neutral-100 text-neutral-700',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

