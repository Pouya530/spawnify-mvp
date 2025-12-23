'use client'

import { useState, useEffect } from 'react'
import { MessageSquare, Plus, Trash2, Loader2 } from 'lucide-react'
import { ChatConversation } from '@/lib/types/database'
import { format } from 'date-fns'
import { Button } from '@/components/ui/Button'

interface ConversationListProps {
  conversations: ChatConversation[]
  selectedConversationId: string | null
  onSelectConversation: (id: string) => void
  onNewConversation: () => void
  onDeleteConversation: (id: string) => void
  loading?: boolean
}

export function ConversationList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  loading = false
}: ConversationListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    setDeletingId(id)
    try {
      await onDeleteConversation(id)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="w-64 border-r border-neutral-200 bg-neutral-50 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-neutral-200">
        <Button
          onClick={onNewConversation}
          variant="primary"
          className="w-full"
          size="small"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-5 h-5 animate-spin text-neutral-400" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <p className="text-sm text-neutral-500">
              No conversations yet.<br />
              Start a new chat to get help!
            </p>
          </div>
        ) : (
          <div className="p-2">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => onSelectConversation(conv.id)}
                className={`group relative p-3 rounded-lg cursor-pointer transition-colors mb-1 ${
                  selectedConversationId === conv.id
                    ? 'bg-primary-100 border border-primary-300'
                    : 'hover:bg-neutral-100'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-neutral-900 truncate">
                      {conv.title}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {format(new Date(conv.updated_at), 'MMM d, HH:mm')}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, conv.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded text-red-600"
                    disabled={deletingId === conv.id}
                  >
                    {deletingId === conv.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Trash2 className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

