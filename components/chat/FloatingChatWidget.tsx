'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, X, Minimize2 } from 'lucide-react'
import { InlineChat } from './InlineChat'

export function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
        setIsMinimized(false)
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  // Prevent body scroll when chat is open (mobile)
  useEffect(() => {
    if (isOpen && !isMinimized) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen, isMinimized])

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-all duration-200 flex items-center justify-center group hover:scale-110 active:scale-95 md:hover:scale-110"
        aria-label="Open AI Assistant"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
      </button>
    )
  }

  return (
    <>
      {/* Mobile Overlay */}
      {!isMinimized && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden backdrop-blur-sm"
          onClick={() => {
            setIsOpen(false)
            setIsMinimized(false)
          }}
        />
      )}

      {/* Chat Widget */}
      <div className={`fixed z-50 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-neutral-200 transition-all duration-300 ${
        isMinimized 
          ? 'bottom-6 right-6 w-80 h-16' 
          : 'bottom-0 right-0 md:bottom-6 md:right-6 w-full md:w-full md:max-w-md h-[100vh] md:h-[600px] md:max-h-[85vh] rounded-t-2xl md:rounded-2xl'
      }`}>
        {/* Header */}
        <div className="bg-primary-600 text-white p-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            {!isMinimized && (
              <div>
                <h3 className="font-semibold text-sm">AI Grow Assistant</h3>
                <p className="text-xs text-primary-100">Ask me anything</p>
              </div>
            )}
            {isMinimized && (
              <div>
                <h3 className="font-semibold text-sm">AI Assistant</h3>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsMinimized(!isMinimized)
              }}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              aria-label={isMinimized ? 'Expand' : 'Minimize'}
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setIsOpen(false)
                setIsMinimized(false)
              }}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chat Content */}
        {!isMinimized && (
          <div className="flex-1 overflow-hidden min-h-0">
            <InlineChat />
          </div>
        )}
      </div>
    </>
  )
}

