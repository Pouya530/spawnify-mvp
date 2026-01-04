'use client'

import { GrowLog } from '@/lib/types/calendar'
import { getEntriesForDate } from '@/lib/utils/calendar-utils'
import { GrowLogEntryMarker } from './GrowLogEntryMarker'
import { cn } from '@/lib/utils/cn'
import { isSameDay } from 'date-fns'

interface CalendarDayCellProps {
  date: Date
  entries: GrowLog[]
  isToday: boolean
  isCurrentMonth: boolean
  onClick: (date: Date) => void
  onEntryClick?: (entry: GrowLog) => void
}

export function CalendarDayCell({
  date,
  entries,
  isToday,
  isCurrentMonth,
  onClick,
  onEntryClick
}: CalendarDayCellProps) {
  const dayEntries = getEntriesForDate(entries, date)
  const entryCount = dayEntries.length
  
  // Group entries by stage for display
  const entriesByStage = dayEntries.reduce((acc, entry) => {
    const stage = entry.growth_stage
    if (!acc[stage]) {
      acc[stage] = []
    }
    acc[stage].push(entry)
    return acc
  }, {} as Record<string, GrowLog[]>)

  const handleClick = () => {
    onClick(date)
  }

  return (
    <div
      onClick={handleClick}
      className={cn(
        'min-h-[80px] md:min-h-[100px] p-2 border border-neutral-200 bg-white cursor-pointer transition-standard hover:bg-neutral-50 hover:border-primary-300',
        !isCurrentMonth && 'bg-neutral-50 opacity-50',
        isToday && 'ring-2 ring-primary-500 ring-offset-1'
      )}
    >
      <div className="flex items-start justify-between mb-1">
        <span
          className={cn(
            'text-sm font-semibold',
            isToday && 'text-primary-600',
            !isCurrentMonth && 'text-neutral-400'
          )}
        >
          {date.getDate()}
        </span>
        
        {entryCount > 0 && (
          <span className="text-xs text-neutral-500 font-medium">
            {entryCount}
          </span>
        )}
      </div>

      {/* Entry markers */}
      {entryCount > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {Object.entries(entriesByStage).slice(0, 3).map(([stage, stageEntries]) => (
            <GrowLogEntryMarker
              key={stage}
              entry={stageEntries[0]}
              size="sm"
              onClick={() => {
                onEntryClick?.(stageEntries[0])
              }}
              showCount={stageEntries.length > 1}
              count={stageEntries.length}
            />
          ))}
          {Object.keys(entriesByStage).length > 3 && (
            <div className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
          )}
        </div>
      )}
    </div>
  )
}

