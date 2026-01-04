'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { GrowLog, VirtualGrow, CalendarView } from '@/lib/types/calendar'
import { createVirtualGrows, getEntriesForGrow } from '@/lib/utils/calendar-utils'
import { useCalendarState } from '@/hooks/useCalendarState'
import { CalendarHeader } from './CalendarHeader'
import { CalendarGrid } from './CalendarGrid'
import { GrowSelector } from './GrowSelector'
import { EntryDetailPanel } from './EntryDetailPanel'
import { QuickAddEntryModal } from './QuickAddEntryModal'
import { Card } from '@/components/ui/Card'
import { Database } from '@/lib/types/database'

type GrowLogRow = Database['public']['Tables']['grow_logs']['Row']

interface GrowLogCalendarProps {
  userId: string
  initialGrowId?: string | null
}

export function GrowLogCalendar({ userId, initialGrowId }: GrowLogCalendarProps) {
  const supabase = createClient()
  const {
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
    switchGrow
  } = useCalendarState(new Date(), initialGrowId)

  const [logs, setLogs] = useState<GrowLogRow[]>([])
  const [grows, setGrows] = useState<VirtualGrow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch grow logs
  useEffect(() => {
    async function fetchLogs() {
      try {
        setLoading(true)
        const { data, error: fetchError } = await supabase
          .from('grow_logs')
          .select('*')
          .eq('user_id', userId)
          .order('log_date', { ascending: false })

        if (fetchError) throw fetchError

        setLogs(data || [])
        const virtualGrows = createVirtualGrows(data || [])
        setGrows(virtualGrows)
      } catch (err) {
        console.error('Error fetching grow logs:', err)
        setError(err instanceof Error ? err.message : 'Failed to load grow logs')
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [userId, supabase])

  // Get entries for current grow (or all if no grow selected)
  const displayedEntries = currentGrowId
    ? getEntriesForGrow(logs, currentGrowId)
    : logs

  const currentGrow = grows.find(g => g.id === currentGrowId) || null

  const handleDateClick = (date: Date) => {
    setSelectedDate(date)
  }

  const handleEntryClick = (entry: GrowLog) => {
    setSelectedEntry(entry)
  }

  const handleCloseEntry = () => {
    setSelectedEntry(null)
  }

  const handleCloseModal = () => {
    setSelectedDate(null)
  }

  if (loading) {
    return (
      <Card>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading calendar...</p>
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-primary-600 hover:text-primary-700"
          >
            Retry
          </button>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Grow Selector */}
      <GrowSelector
        grows={grows}
        currentGrowId={currentGrowId}
        onGrowChange={switchGrow}
        layout="tabs"
      />

      {/* Calendar */}
      <Card>
        <CalendarHeader
          currentDate={currentDate}
          onDateChange={setCurrentDate}
          view={view}
          onViewChange={setView}
          grow={currentGrow}
        />

        <CalendarGrid
          currentDate={currentDate}
          entries={displayedEntries}
          view={view}
          onDateClick={handleDateClick}
          onEntryClick={handleEntryClick}
        />
      </Card>

      {/* Entry Detail Panel */}
      {selectedEntry && (
        <EntryDetailPanel
          entry={selectedEntry}
          grow={currentGrow}
          isOpen={!!selectedEntry}
          onClose={handleCloseEntry}
        />
      )}

      {/* Quick Add Modal */}
      {selectedDate && (
        <QuickAddEntryModal
          isOpen={!!selectedDate}
          date={selectedDate}
          growId={currentGrowId}
          onClose={handleCloseModal}
        />
      )}
    </div>
  )
}

