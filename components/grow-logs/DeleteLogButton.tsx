'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Trash2, AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { deletePhotos } from '@/lib/utils/deletePhotos'

interface DeleteLogButtonProps {
  logId: string
  photoUrls?: string[] | null
  userId: string
}

export function DeleteLogButton({ logId, photoUrls, userId }: DeleteLogButtonProps) {
  const router = useRouter()
  const supabase = createClient()
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleDelete() {
    setLoading(true)
    setError('')

    try {
      // Delete photos from storage first
      if (photoUrls && photoUrls.length > 0) {
        await deletePhotos(photoUrls, userId)
      }

      // Delete the log from database
      const { error: deleteError } = await supabase
        .from('grow_logs')
        .delete()
        .eq('id', logId)

      if (deleteError) {
        throw deleteError
      }

      // Success - redirect to logs list
      router.push('/dashboard/grow-logs')
      router.refresh()

    } catch (err: any) {
      console.error('Delete error:', err)
      setError(err.message || 'Failed to delete grow log. Please try again.')
      setLoading(false)
    }
  }

  if (showConfirm) {
    return (
      <Card className="p-6 bg-red-50 border-red-200">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Delete Grow Log?
            </h3>
            <p className="text-sm text-red-800 mb-4">
              This action cannot be undone. All photos and data associated with this log will be permanently deleted.
            </p>
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowConfirm(false)
                  setError('')
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleDelete}
                loading={loading}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Permanently
              </Button>
            </div>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Button
      variant="ghost"
      size="medium"
      onClick={() => setShowConfirm(true)}
      className="text-red-600 hover:text-red-700 hover:bg-red-50"
    >
      <Trash2 className="w-4 h-4 mr-2" />
      Delete
    </Button>
  )
}

