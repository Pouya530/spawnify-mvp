'use client'

import { VirtualGrow } from '@/lib/types/calendar'
import { cn } from '@/lib/utils/cn'
import { getStageColor } from '@/lib/utils/calendar-utils'
import { Calendar, ChevronRight } from 'lucide-react'

interface GrowSelectorProps {
  grows: VirtualGrow[]
  currentGrowId: string | null
  onGrowChange: (growId: string | null) => void
  layout?: 'tabs' | 'cards' | 'dropdown'
}

export function GrowSelector({
  grows,
  currentGrowId,
  onGrowChange,
  layout = 'tabs'
}: GrowSelectorProps) {
  if (grows.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-500">
        <Calendar className="w-12 h-12 mx-auto mb-3 text-neutral-300" />
        <p className="text-sm">No grow logs yet. Create your first log to see it on the calendar.</p>
      </div>
    )
  }

  if (layout === 'cards') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <button
          onClick={() => onGrowChange(null)}
          className={cn(
            'p-4 rounded-xl border-2 text-left transition-standard',
            currentGrowId === null
              ? 'border-primary-500 bg-primary-50'
              : 'border-neutral-200 hover:border-neutral-300 bg-white'
          )}
        >
          <div className="font-semibold text-neutral-900 mb-1">All Grows</div>
          <div className="text-sm text-neutral-500">View all logs together</div>
        </button>
        
        {grows.map((grow) => (
          <button
            key={grow.id}
            onClick={() => onGrowChange(grow.id)}
            className={cn(
              'p-4 rounded-xl border-2 text-left transition-standard',
              currentGrowId === grow.id
                ? 'border-primary-500 bg-primary-50'
                : 'border-neutral-200 hover:border-neutral-300 bg-white'
            )}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="font-semibold text-neutral-900 mb-1">{grow.strain}</div>
                <div className="text-xs text-neutral-500">{grow.substrate}</div>
              </div>
              {grow.currentStage && (
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
                  style={{ backgroundColor: getStageColor(grow.currentStage) }}
                />
              )}
            </div>
            <div className="flex items-center justify-between text-xs text-neutral-500">
              <span>{grow.logs.length} log{grow.logs.length !== 1 ? 's' : ''}</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </button>
        ))}
      </div>
    )
  }

  // Tabs layout (default)
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
      <button
        onClick={() => onGrowChange(null)}
        className={cn(
          'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-standard',
          currentGrowId === null
            ? 'bg-primary-500 text-white'
            : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
        )}
      >
        All Grows
      </button>
      
      {grows.map((grow) => (
        <button
          key={grow.id}
          onClick={() => onGrowChange(grow.id)}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-standard flex items-center gap-2',
            currentGrowId === grow.id
              ? 'bg-primary-500 text-white'
              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
          )}
        >
          <span>{grow.strain}</span>
          {grow.currentStage && (
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: getStageColor(grow.currentStage) }}
            />
          )}
        </button>
      ))}
    </div>
  )
}

