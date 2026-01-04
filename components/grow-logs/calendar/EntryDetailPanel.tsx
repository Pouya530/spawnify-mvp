'use client'

import { GrowLog, VirtualGrow } from '@/lib/types/calendar'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { X, Calendar as CalendarIcon, Thermometer, Droplets, Scale, Sun, FlaskConical, Image as ImageIcon } from 'lucide-react'
import { format } from 'date-fns'
import { getStageColor } from '@/lib/utils/calendar-utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface EntryDetailPanelProps {
  entry: GrowLog | null
  grow: VirtualGrow | null
  isOpen: boolean
  onClose: () => void
  onEdit?: (entry: GrowLog) => void
  onDelete?: (entryId: string) => Promise<void>
}

export function EntryDetailPanel({
  entry,
  grow,
  isOpen,
  onClose,
  onEdit,
  onDelete
}: EntryDetailPanelProps) {
  const router = useRouter()
  const supabase = createClient()

  if (!isOpen || !entry) return null

  const handleEdit = () => {
    if (onEdit) {
      onEdit(entry)
    } else {
      router.push(`/dashboard/grow-logs/${entry.id}`)
    }
    onClose()
  }

  const handleDelete = async () => {
    if (onDelete && confirm('Are you sure you want to delete this log entry?')) {
      await onDelete(entry.id)
      onClose()
    }
  }

  const stageColor = getStageColor(entry.growth_stage)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>
        <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">{entry.strain}</h2>
            <div className="flex items-center gap-2 text-sm text-neutral-600">
              <CalendarIcon className="w-4 h-4" />
              <span>{format(new Date(entry.log_date), 'MMMM d, yyyy')}</span>
            </div>
          </div>
          <Button variant="ghost" size="small" onClick={onClose} className="p-2">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Stage Badge */}
        <div className="mb-6">
          <div
            className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-semibold text-white"
            style={{ backgroundColor: stageColor }}
          >
            {entry.growth_stage}
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {entry.temperature && (
            <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
              <Thermometer className="w-5 h-5 text-neutral-500" />
              <div>
                <div className="text-xs text-neutral-500">Temperature</div>
                <div className="text-sm font-semibold text-neutral-900">{entry.temperature}°F</div>
              </div>
            </div>
          )}

          {entry.humidity && (
            <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
              <Droplets className="w-5 h-5 text-neutral-500" />
              <div>
                <div className="text-xs text-neutral-500">Humidity</div>
                <div className="text-sm font-semibold text-neutral-900">{entry.humidity}%</div>
              </div>
            </div>
          )}

          {entry.weight && (
            <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
              <Scale className="w-5 h-5 text-neutral-500" />
              <div>
                <div className="text-xs text-neutral-500">Weight</div>
                <div className="text-sm font-semibold text-neutral-900">{entry.weight}g</div>
              </div>
            </div>
          )}

          {entry.light_hours_daily && (
            <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg">
              <Sun className="w-5 h-5 text-neutral-500" />
              <div>
                <div className="text-xs text-neutral-500">Light Hours</div>
                <div className="text-sm font-semibold text-neutral-900">{entry.light_hours_daily}h/day</div>
              </div>
            </div>
          )}
        </div>

        {/* Growing Details */}
        <div className="space-y-3 mb-6">
          <div>
            <div className="text-xs text-neutral-500 mb-1">Substrate</div>
            <div className="text-sm font-medium text-neutral-900">{entry.substrate}</div>
          </div>
          <div>
            <div className="text-xs text-neutral-500 mb-1">Growing Method</div>
            <div className="text-sm font-medium text-neutral-900">{entry.growing_method}</div>
          </div>
          {entry.inoculation_method && (
            <div>
              <div className="text-xs text-neutral-500 mb-1">Inoculation Method</div>
              <div className="text-sm font-medium text-neutral-900">{entry.inoculation_method}</div>
            </div>
          )}
          {entry.tek_method && (
            <div>
              <div className="text-xs text-neutral-500 mb-1">TEK Method</div>
              <div className="text-sm font-medium text-neutral-900">{entry.tek_method}</div>
            </div>
          )}
        </div>

        {/* Notes */}
        {entry.notes && (
          <div className="mb-6">
            <div className="text-xs text-neutral-500 mb-2">Notes</div>
            <div className="text-sm text-neutral-700 bg-neutral-50 p-4 rounded-lg whitespace-pre-wrap">
              {entry.notes}
            </div>
          </div>
        )}

        {/* Photos */}
        {entry.photos && entry.photos.length > 0 && (
          <div className="mb-6">
            <div className="text-xs text-neutral-500 mb-2 flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Photos ({entry.photos.length})
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {entry.photos.map((photo, index) => (
                <img
                  key={index}
                  src={photo}
                  alt={`Grow log photo ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-neutral-200">
          <Button variant="primary" onClick={handleEdit}>
            Edit Entry
          </Button>
          {onDelete && (
            <Button variant="ghost" onClick={handleDelete}>
              Delete
            </Button>
          )}
        </div>
        </Card>
      </div>
    </div>
  )
}

