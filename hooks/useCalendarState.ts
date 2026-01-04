'use client'

import { useState } from 'react'
import { CalendarView, GrowLog } from '@/lib/types/calendar'

export function useCalendarState(initialDate?: Date, initialGrowId?: string | null) {
  const [view, setView] = useState<CalendarView>('month')
  const [currentDate, setCurrentDate] = useState(initialDate || new Date())
  const [currentGrowId, setCurrentGrowId] = useState<string | null>(initialGrowId || null)
  const [selectedEntry, setSelectedEntry] = useState<GrowLog | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const goToToday = () => setCurrentDate(new Date())
  
  const switchGrow = (growId: string | null) => {
    setCurrentGrowId(growId)
    setSelectedEntry(null)
    setSelectedDate(null)
  }

  return {
    view,
    setView,
    currentDate,
    setCurrentDate,
    currentGrowId,
    setCurrentGrowId,
    selectedEntry,
    setSelectedEntry,
    selectedDate,
    setSelectedDate,
    goToToday,
    switchGrow
  }
}

