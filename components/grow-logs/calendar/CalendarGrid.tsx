'use client'

import { GrowLog } from '@/lib/types/calendar'
import { getCalendarGrid } from '@/lib/utils/calendar-utils'
import { CalendarDayCell } from './CalendarDayCell'
import { isSameDay } from 'date-fns'

interface CalendarGridProps {
  currentDate: Date
  entries: GrowLog[]
  view: 'month' | 'week' | 'day'
  onDateClick: (date: Date) => void
  onEntryClick?: (entry: GrowLog) => void
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function CalendarGrid({
  currentDate,
  entries,
  view,
  onDateClick,
  onEntryClick
}: CalendarGridProps) {
  const weeks = getCalendarGrid(currentDate)
  const today = new Date()

  if (view === 'day') {
    // Day view - show single day
    return (
      <div className="grid grid-cols-1 gap-4">
        <CalendarDayCell
          date={currentDate}
          entries={entries}
          isToday={isSameDay(currentDate, today)}
          isCurrentMonth={true}
          onClick={onDateClick}
          onEntryClick={onEntryClick}
        />
      </div>
    )
  }

  if (view === 'week') {
    // Week view - show one week
    const weekStart = weeks[0]?.[0] || currentDate
    const weekDays = weeks.find(week => week.some(day => isSameDay(day, currentDate))) || weeks[0] || []
    
    return (
      <div className="grid grid-cols-7 gap-1">
        {/* Weekday headers */}
        {WEEKDAYS.map((day) => (
          <div key={day} className="text-center text-xs font-semibold text-neutral-600 py-2">
            {day}
          </div>
        ))}
        
        {/* Week days */}
        {weekDays.map((date) => (
          <CalendarDayCell
            key={date.toISOString()}
            date={date}
            entries={entries}
            isToday={isSameDay(date, today)}
            isCurrentMonth={isSameDay(date.getMonth(), currentDate.getMonth())}
            onClick={onDateClick}
            onEntryClick={onEntryClick}
          />
        ))}
      </div>
    )
  }

  // Month view - default
  return (
    <div className="grid grid-cols-7 gap-1">
      {/* Weekday headers */}
      {WEEKDAYS.map((day) => (
        <div key={day} className="text-center text-xs font-semibold text-neutral-600 py-2">
          {day}
        </div>
      ))}
      
      {/* Calendar days */}
      {weeks.map((week, weekIndex) =>
        week.map((date) => (
          <CalendarDayCell
            key={`${weekIndex}-${date.toISOString()}`}
            date={date}
            entries={entries}
            isToday={isSameDay(date, today)}
            isCurrentMonth={date.getMonth() === currentDate.getMonth()}
            onClick={onDateClick}
            onEntryClick={onEntryClick}
          />
        ))
      )}
    </div>
  )
}

