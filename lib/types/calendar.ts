import { Database } from './database'

export type GrowLog = Database['public']['Tables']['grow_logs']['Row']
export type GrowStage = GrowLog['growth_stage']
export type CalendarView = 'month' | 'week' | 'day'

/**
 * Virtual "Grow" - groups logs by strain + substrate + inoculation_method
 * Since we don't have a separate grows table, we create virtual grows
 */
export interface VirtualGrow {
  id: string // Composite key: `${strain}-${substrate}-${inoculation_method}`
  strain: string
  substrate: string
  inoculation_method: string
  growing_method: string
  logs: GrowLog[]
  firstLogDate: string
  lastLogDate: string
  currentStage: GrowStage | null
}

export interface CalendarDayCell {
  date: Date
  isToday: boolean
  isCurrentMonth: boolean
  entries: GrowLog[]
}

export interface CalendarState {
  view: CalendarView
  currentDate: Date
  selectedGrowId: string | null
  selectedEntry: GrowLog | null
}

