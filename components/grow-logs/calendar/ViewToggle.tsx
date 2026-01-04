'use client'

import { Calendar, List } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

interface ViewToggleProps {
  currentView: 'calendar' | 'list'
  onViewChange: (view: 'calendar' | 'list') => void
  position?: 'header' | 'floating'
}

export function ViewToggle({
  currentView,
  onViewChange,
  position = 'header'
}: ViewToggleProps) {
  const baseClasses = 'flex items-center gap-2 bg-neutral-100 rounded-lg p-1'
  const buttonClasses = (isActive: boolean) =>
    cn(
      'flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-standard',
      isActive
        ? 'bg-white text-neutral-900 shadow-sm'
        : 'text-neutral-600 hover:text-neutral-900'
    )

  if (position === 'floating') {
    return (
      <div className="fixed bottom-6 right-6 z-40 shadow-lg">
        <div className={baseClasses}>
          <button
            onClick={() => onViewChange('calendar')}
            className={buttonClasses(currentView === 'calendar')}
          >
            <Calendar className="w-4 h-4" />
            <span className="hidden sm:inline">Calendar</span>
          </button>
          <button
            onClick={() => onViewChange('list')}
            className={buttonClasses(currentView === 'list')}
          >
            <List className="w-4 h-4" />
            <span className="hidden sm:inline">List</span>
          </button>
        </div>
      </div>
    )
  }

  // Header position (default)
  return (
    <div className={baseClasses}>
      <button
        onClick={() => onViewChange('calendar')}
        className={buttonClasses(currentView === 'calendar')}
      >
        <Calendar className="w-4 h-4" />
        <span className="hidden sm:inline">Calendar</span>
      </button>
      <button
        onClick={() => onViewChange('list')}
        className={buttonClasses(currentView === 'list')}
      >
        <List className="w-4 h-4" />
        <span className="hidden sm:inline">List</span>
      </button>
    </div>
  )
}

