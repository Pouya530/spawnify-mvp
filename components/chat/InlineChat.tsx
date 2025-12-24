'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageBubble } from './MessageBubble'
import { ChatInput } from './ChatInput'
import { Card } from '@/components/ui/Card'
import { ChatMessage } from '@/lib/types/database'
import { Bot, Loader2 } from 'lucide-react'

interface InlineChatProps {
  conversationId?: string | null
}

export function InlineChat({ conversationId: initialConversationId = null }: InlineChatProps) {
  const [conversationId, setConversationId] = useState<string | null>(initialConversationId)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch messages when conversation is selected
  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId)
    } else {
      setMessages([])
    }
  }, [conversationId])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchMessages = async (convId: string) => {
    try {
      const response = await fetch(`/api/chat?conversationId=${convId}`)
      if (!response.ok) throw new Error('Failed to fetch messages')
      const data = await response.json()
      setMessages(data.messages || [])
    } catch (err: any) {
      console.error('Error fetching messages:', err)
      setError('Failed to load conversation')
    }
  }

  const handleSendMessage = async (message: string, images?: File[]) => {
    if (!message.trim() && (!images || images.length === 0)) return

    setLoading(true)
    setError(null)

    // Add user message optimistically
    const userMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      conversation_id: conversationId || '',
      role: 'user',
      content: message || (images && images.length > 0 ? `[${images.length} image(s) attached]` : ''),
      metadata: {},
      created_at: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])

    try {
      // Convert images to base64 if provided
      const imageDataPromises = images?.map(async (file) => {
        return new Promise<{ base64: string; mediaType: string }>((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => {
            const base64 = (reader.result as string).split(',')[1] // Remove data:image/...;base64, prefix
            resolve({ base64, mediaType: file.type })
          }
          reader.onerror = reject
          reader.readAsDataURL(file)
        })
      }) || []

      const imageData = await Promise.all(imageDataPromises)

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          conversationId,
          message: message || '',
          images: imageData.length > 0 ? imageData : undefined,
          isNewConversation: !conversationId
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send message')
      }

      const data = await response.json()

      // Update conversation ID if it's a new conversation
      if (!conversationId && data.conversationId) {
        setConversationId(data.conversationId)
      }

      // Add assistant message
      const assistantMessage: ChatMessage = {
        id: `temp-assistant-${Date.now()}`,
        conversation_id: data.conversationId,
        role: 'assistant',
        content: data.message,
        metadata: {},
        created_at: new Date().toISOString()
      }

      setMessages(prev => [...prev, assistantMessage])

      // Refresh messages to get real IDs from database
      if (data.conversationId) {
        await fetchMessages(data.conversationId)
      }
    } catch (err: any) {
      console.error('Error sending message:', err)
      
      // Handle specific error types
      let errorMessage = 'Failed to send message. Please try again.'
      if (err.message) {
        errorMessage = err.message
      } else if (typeof err === 'string') {
        errorMessage = err
      }
      
      // Check for API key missing error
      const errorData = err.response ? await err.response.json().catch(() => null) : null
      if (errorData?.code === 'API_KEY_MISSING') {
        errorMessage = 'AI service is not configured. Please contact support.'
      } else if (errorData?.code === 'TABLE_NOT_FOUND') {
        errorMessage = 'Database setup required. Please run chat-schema.sql in Supabase.'
      }
      
      setError(errorMessage)
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== userMessage.id))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 && !loading ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mb-3">
              <Bot className="w-6 h-6 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">
              AI Grow Assistant
            </h3>
            <p className="text-sm text-neutral-600 mb-4">
              Ask me anything about mushroom cultivation!
            </p>
            <div className="text-xs text-neutral-500 space-y-1">
              <p>• Step-by-step tutorials</p>
              <p>• Troubleshooting help</p>
              <p>• Personalized advice</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-neutral-700" />
                </div>
                <div className="bg-neutral-100 rounded-2xl px-4 py-3">
                  <Loader2 className="w-5 h-5 animate-spin text-neutral-400" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}

        {error && (
          <div className="mt-4">
            <Card className="p-3 bg-red-50 border-red-200">
              <p className="text-xs text-red-600">{error}</p>
            </Card>
          </div>
        )}
      </div>

      {/* Input Area */}
      <ChatInput
        onSend={handleSendMessage}
        disabled={loading}
        placeholder="Ask about mushroom cultivation..."
      />
    </div>
  )
}

