'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { X } from 'lucide-react'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface QuickAddEntryModalProps {
  isOpen: boolean
  date: Date
  growId: string | null
  onClose: () => void
  onSubmit?: () => void
}

export function QuickAddEntryModal({
  isOpen,
  date,
  growId,
  onClose,
  onSubmit
}: QuickAddEntryModalProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Redirect to new log page with pre-filled date
      const dateStr = format(date, 'yyyy-MM-dd')
      router.push(`/dashboard/grow-logs/new?date=${dateStr}`)
      onClose()
      onSubmit?.()
    } catch (error) {
      console.error('Error creating entry:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()}>
        <Card className="max-w-md w-full">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-neutral-900 mb-1">Add Grow Log</h2>
            <p className="text-sm text-neutral-600">
              {format(date, 'EEEE, MMMM d, yyyy')}
            </p>
          </div>
          <Button variant="ghost" size="small" onClick={onClose} className="p-2">
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <p className="text-sm text-neutral-600">
              You&apos;ll be redirected to the full grow log form with the date pre-filled.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="flex-1"
            >
              Continue to Form
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
            >
              Cancel
            </Button>
          </div>
        </form>
        </Card>
      </div>
    </div>
  )
}

