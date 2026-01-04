'use client'

import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { formatCalendarDate, navigateDate } from '@/lib/utils/calendar-utils'
import { CalendarView, VirtualGrow } from '@/lib/types/calendar'
import { cn } from '@/lib/utils/cn'

interface CalendarHeaderProps {
  currentDate: Date
  onDateChange: (date: Date) => void
  view: CalendarView
  onViewChange: (view: CalendarView) => void
  grow: VirtualGrow | null
}

export function CalendarHeader({
  currentDate,
  onDateChange,
  view,
  onViewChange,
  grow
}: CalendarHeaderProps) {
  const handlePrev = () => {
    onDateChange(navigateDate(currentDate, 'prev', view))
  }

  const handleNext = () => {
    onDateChange(navigateDate(currentDate, 'next', view))
  }

  const handleToday = () => {
    onDateChange(new Date())
  }

  return (
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="small"
            onClick={handlePrev}
            className="p-2"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="small"
            onClick={handleNext}
            className="p-2"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
        
        <h2 className="text-2xl font-bold text-neutral-900">
          {formatCalendarDate(currentDate, view)}
        </h2>
        
        <Button
          variant="ghost"
          size="small"
          onClick={handleToday}
          className="text-sm text-neutral-600 hover:text-neutral-900"
        >
          Today
        </Button>
      </div>

      <div className="flex items-center gap-2">
        {/* View Toggle */}
        <div className="flex items-center bg-neutral-100 rounded-lg p-1">
          {(['month', 'week', 'day'] as CalendarView[]).map((v) => (
            <button
              key={v}
              onClick={() => onViewChange(v)}
              className={cn(
                'px-3 py-1.5 text-sm font-medium rounded-md transition-standard',
                view === v
                  ? 'bg-white text-neutral-900 shadow-sm'
                  : 'text-neutral-600 hover:text-neutral-900'
              )}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Grow Info */}
      {grow && (
        <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-neutral-50 rounded-lg">
          <CalendarIcon className="w-4 h-4 text-neutral-500" />
          <div>
            <div className="text-sm font-medium text-neutral-900">{grow.strain}</div>
            <div className="text-xs text-neutral-500">{grow.substrate} • {grow.growing_method}</div>
          </div>
        </div>
      )}
    </div>
  )
}

