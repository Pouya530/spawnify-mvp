'use client'

import { Card } from '@/components/ui/Card'
import { cn } from '@/lib/utils/cn'

interface AdminStatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  color: 'blue' | 'primary' | 'success' | 'purple'
}

const colorClasses = {
  blue: 'bg-blue-100 text-blue-600',
  primary: 'bg-primary-100 text-primary-600',
  success: 'bg-success-100 text-success-600',
  purple: 'bg-purple-100 text-purple-600'
}

export function AdminStatCard({ title, value, icon, color }: AdminStatCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-neutral-600 font-medium">{title}</p>
          <p className="text-3xl font-bold text-neutral-900 tracking-tight">
            {value}
          </p>
        </div>
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0',
          colorClasses[color]
        )}>
          {icon}
        </div>
      </div>
    </Card>
  )
}

