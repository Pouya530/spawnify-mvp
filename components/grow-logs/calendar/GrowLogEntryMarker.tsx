'use client'

import { GrowLog } from '@/lib/types/calendar'
import { getStageColor } from '@/lib/utils/calendar-utils'
import { cn } from '@/lib/utils/cn'

interface GrowLogEntryMarkerProps {
  entry: GrowLog
  size?: 'sm' | 'md' | 'lg'
  onClick?: (entry: GrowLog) => void
  showCount?: boolean
  count?: number
}

export function GrowLogEntryMarker({
  entry,
  size = 'md',
  onClick,
  showCount = false,
  count
}: GrowLogEntryMarkerProps) {
  const color = getStageColor(entry.growth_stage)
  
  const sizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5'
  }

  if (showCount && count && count > 1) {
    return (
      <div
        onClick={() => onClick?.(entry)}
        className={cn(
          'flex items-center justify-center rounded-full text-xs font-semibold text-white cursor-pointer transition-standard hover:scale-110',
          size === 'sm' && 'w-5 h-5 text-[10px]',
          size === 'md' && 'w-6 h-6 text-xs',
          size === 'lg' && 'w-7 h-7 text-sm'
        )}
        style={{ backgroundColor: color }}
        title={`${count} entries`}
      >
        {count}
      </div>
    )
  }

  return (
    <div
      onClick={() => onClick?.(entry)}
      className={cn(
        'rounded-full cursor-pointer transition-standard hover:scale-110',
        sizeClasses[size]
      )}
      style={{ backgroundColor: color }}
      title={`${entry.growth_stage}: ${entry.strain}`}
    />
  )
}

