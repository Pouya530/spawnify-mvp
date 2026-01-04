import { GrowLog, VirtualGrow } from '@/lib/types/calendar'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from 'date-fns'

/**
 * Get calendar grid for month view (6 weeks to show full month)
 */
export function getCalendarGrid(date: Date): Date[][] {
  const monthStart = startOfMonth(date)
  const monthEnd = endOfMonth(date)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }) // Monday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd })
  
  // Group into weeks (7 days each)
  const weeks: Date[][] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }
  
  return weeks
}

/**
 * Get entries for a specific date
 */
export function getEntriesForDate(entries: GrowLog[], date: Date): GrowLog[] {
  return entries.filter(entry => {
    const entryDate = new Date(entry.log_date)
    return isSameDay(entryDate, date)
  })
}

/**
 * Get color for growth stage
 * Maps existing stages to calendar colors
 */
export function getStageColor(stage: string): string {
  const stageLower = stage.toLowerCase()
  
  // Map existing stages to calendar colors
  if (stageLower.includes('inoculation')) {
    return '#8B5CF6' // Purple
  }
  if (stageLower.includes('colonization') || stageLower.includes('colonisation')) {
    return '#3B82F6' // Blue
  }
  if (stageLower.includes('fruiting')) {
    return '#10B981' // Green
  }
  if (stageLower.includes('harvest')) {
    return '#059669' // Darker green
  }
  
  // Default
  return '#6B7280' // Gray
}

/**
 * Format date for calendar display
 */
export function formatCalendarDate(date: Date, view: 'month' | 'week' | 'day'): string {
  switch (view) {
    case 'month':
      return format(date, 'MMMM yyyy')
    case 'week':
      return format(date, 'MMM d') + ' - ' + format(addDays(date, 6), 'MMM d, yyyy')
    case 'day':
      return format(date, 'EEEE, MMMM d, yyyy')
    default:
      return format(date, 'MMMM d, yyyy')
  }
}

/**
 * Check if date has entries
 */
export function hasEntries(entries: GrowLog[], date: Date): boolean {
  return getEntriesForDate(entries, date).length > 0
}

/**
 * Create virtual grows from logs
 * Groups logs by strain + substrate + inoculation_method
 */
export function createVirtualGrows(logs: GrowLog[]): VirtualGrow[] {
  const growMap = new Map<string, GrowLog[]>()
  
  // Group logs by composite key
  logs.forEach(log => {
    const key = `${log.strain}-${log.substrate}-${log.inoculation_method}`
    if (!growMap.has(key)) {
      growMap.set(key, [])
    }
    growMap.get(key)!.push(log)
  })
  
  // Convert to VirtualGrow objects
  const grows: VirtualGrow[] = []
  growMap.forEach((logs, key) => {
    // Sort logs by date
    const sortedLogs = [...logs].sort((a, b) => 
      new Date(a.log_date).getTime() - new Date(b.log_date).getTime()
    )
    
    const firstLog = sortedLogs[0]
    const lastLog = sortedLogs[sortedLogs.length - 1]
    
    // Get current stage (most recent log's stage)
    const currentStage = lastLog.growth_stage
    
    grows.push({
      id: key,
      strain: firstLog.strain,
      substrate: firstLog.substrate,
      inoculation_method: firstLog.inoculation_method,
      growing_method: firstLog.growing_method,
      logs: sortedLogs,
      firstLogDate: firstLog.log_date,
      lastLogDate: lastLog.log_date,
      currentStage
    })
  })
  
  // Sort by most recent activity
  return grows.sort((a, b) => 
    new Date(b.lastLogDate).getTime() - new Date(a.lastLogDate).getTime()
  )
}

/**
 * Get entries for a specific grow
 */
export function getEntriesForGrow(logs: GrowLog[], growId: string): GrowLog[] {
  return logs.filter(log => {
    const key = `${log.strain}-${log.substrate}-${log.inoculation_method}`
    return key === growId
  })
}

/**
 * Navigate calendar dates
 */
export function navigateDate(currentDate: Date, direction: 'prev' | 'next', view: 'month' | 'week' | 'day'): Date {
  switch (view) {
    case 'month':
      return direction === 'next' ? addMonths(currentDate, 1) : subMonths(currentDate, 1)
    case 'week':
      return direction === 'next' ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1)
    case 'day':
      return direction === 'next' ? addDays(currentDate, 1) : subDays(currentDate, 1)
    default:
      return currentDate
  }
}

