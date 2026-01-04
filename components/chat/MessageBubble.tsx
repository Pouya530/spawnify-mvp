'use client'

import { Bot, User } from 'lucide-react'
import { format } from 'date-fns'
import { ChatMessage } from '@/lib/types/database'

interface MessageBubbleProps {
  message: ChatMessage
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'
  const isAssistant = message.role === 'assistant'

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser 
          ? 'bg-primary-600 text-white' 
          : 'bg-neutral-200 text-neutral-700'
      }`}>
        {isUser ? (
          <User className="w-4 h-4" />
        ) : (
          <Bot className="w-4 h-4" />
        )}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className={`rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-primary-600 text-white'
            : 'bg-neutral-100 text-neutral-900'
        }`}>
          <p className="text-sm whitespace-pre-wrap leading-relaxed">
            {message.content}
          </p>
        </div>
        <span className="text-xs text-neutral-500">
          {format(new Date(message.created_at), 'HH:mm')}
        </span>
      </div>
    </div>
  )
}


