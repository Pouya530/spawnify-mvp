'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageBubble } from './MessageBubble'
import { ChatInput } from './ChatInput'
import { ConversationList } from './ConversationList'
import { Card } from '@/components/ui/Card'
import { ChatMessage, ChatConversation } from '@/lib/types/database'
import { Bot, Loader2 } from 'lucide-react'

interface ChatInterfaceProps {
  initialConversations?: ChatConversation[]
}

export function ChatInterface({ initialConversations = [] }: ChatInterfaceProps) {
  const [conversations, setConversations] = useState<ChatConversation[]>(initialConversations)
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingConversations, setLoadingConversations] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations()
  }, [])

  // Fetch messages when conversation is selected
  useEffect(() => {
    if (selectedConversationId) {
      fetchMessages(selectedConversationId)
    } else {
      setMessages([])
    }
  }, [selectedConversationId])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchConversations = async () => {
    setLoadingConversations(true)
    try {
      const response = await fetch('/api/chat')
      if (!response.ok) throw new Error('Failed to fetch conversations')
      const data = await response.json()
      setConversations(data.conversations || [])
    } catch (err: any) {
      console.error('Error fetching conversations:', err)
    } finally {
      setLoadingConversations(false)
    }
  }

  const fetchMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/chat?conversationId=${conversationId}`)
      if (!response.ok) throw new Error('Failed to fetch messages')
      const data = await response.json()
      setMessages(data.messages || [])
    } catch (err: any) {
      console.error('Error fetching messages:', err)
      setError('Failed to load conversation')
    }
  }

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return

    setLoading(true)
    setError(null)

    // Add user message optimistically
    const userMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      conversation_id: selectedConversationId || '',
      role: 'user',
      content: message,
      metadata: {},
      created_at: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          conversationId: selectedConversationId,
          message,
          isNewConversation: !selectedConversationId
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to send message')
      }

      const data = await response.json()

      // Update conversation ID if it's a new conversation
      if (!selectedConversationId && data.conversationId) {
        setSelectedConversationId(data.conversationId)
        await fetchConversations()
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
      try {
        const errorData = err.response ? await err.response.json().catch(() => null) : null
        if (errorData?.code === 'API_KEY_MISSING') {
          errorMessage = 'AI service is not configured. Please set ANTHROPIC_API_KEY environment variable.'
        } else if (errorData?.code === 'TABLE_NOT_FOUND') {
          errorMessage = 'Database setup required. Please run chat-schema.sql in Supabase SQL Editor.'
        } else if (errorData?.error) {
          errorMessage = errorData.error
        } else if (err.message) {
          errorMessage = err.message
        }
      } catch (parseError) {
        // If we can't parse the error, use default message
        if (err.message) {
          errorMessage = err.message
        }
      }
      
      setError(errorMessage)
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== userMessage.id))
    } finally {
      setLoading(false)
    }
  }

  const handleNewConversation = () => {
    setSelectedConversationId(null)
    setMessages([])
    setError(null)
  }

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id)
    setError(null)
  }

  const handleDeleteConversation = async (id: string) => {
    try {
      const response = await fetch(`/api/chat?conversationId=${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete conversation')

      setConversations(prev => prev.filter(c => c.id !== id))
      if (selectedConversationId === id) {
        setSelectedConversationId(null)
        setMessages([])
      }
    } catch (err: any) {
      console.error('Error deleting conversation:', err)
      setError('Failed to delete conversation')
    }
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <ConversationList
        conversations={conversations}
        selectedConversationId={selectedConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        loading={loadingConversations}
      />

      {/* Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-white">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {messages.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                <Bot className="w-8 h-8 text-primary-600" />
              </div>
              <h2 className="text-xl font-bold text-neutral-900 mb-2">
                Spawnify AI Assistant
              </h2>
              <p className="text-neutral-600 max-w-md">
                Ask me anything about mushroom cultivation! I can help with:
              </p>
              <ul className="mt-4 text-sm text-neutral-600 space-y-2">
                <li>• Step-by-step tutorials for growing techniques</li>
                <li>• Troubleshooting common growing problems</li>
                <li>• Personalized advice based on your grow logs</li>
                <li>• TEK method explanations and modifications</li>
              </ul>
            </div>
          ) : (
            <div className="space-y-4 max-w-4xl mx-auto">
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
            <div className="max-w-4xl mx-auto mt-4">
              <Card className="p-4 bg-red-50 border-red-200">
                <p className="text-sm text-red-600">{error}</p>
              </Card>
            </div>
          )}
        </div>

        {/* Input Area */}
        <ChatInput
          onSend={handleSendMessage}
          disabled={loading}
        />
      </div>
    </div>
  )
}

