'use client'

import { useState, KeyboardEvent, useRef } from 'react'
import { Send, Loader2, Image as ImageIcon, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface ChatInputProps {
  onSend: (message: string, images?: File[]) => void
  disabled?: boolean
  placeholder?: string
}

export function ChatInput({ onSend, disabled = false, placeholder = 'Ask about mushroom cultivation, troubleshooting, or techniques...' }: ChatInputProps) {
  const [message, setMessage] = useState('')
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSend = () => {
    if ((message.trim() || selectedImages.length > 0) && !disabled) {
      onSend(message.trim(), selectedImages.length > 0 ? selectedImages : undefined)
      setMessage('')
      setSelectedImages([])
      setImagePreviews([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const imageFiles = files.filter(file => file.type.startsWith('image/'))
    
    // Limit to 5 images max
    const newImages = imageFiles.slice(0, 5 - selectedImages.length)
    setSelectedImages(prev => [...prev, ...newImages])
    
    // Create previews
    newImages.forEach(file => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
    setImagePreviews(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="border-t border-neutral-200 bg-white p-4">
      {/* Image Previews */}
      {imagePreviews.length > 0 && (
        <div className="mb-3 flex gap-2 overflow-x-auto pb-2">
          {imagePreviews.map((preview, index) => (
            <div key={index} className="relative flex-shrink-0">
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="w-20 h-20 object-cover rounded-lg border border-neutral-300"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                disabled={disabled}
              >
                <X className="w-4 h-4" />
              </button>
              <span className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs px-1 py-0.5 rounded-b-lg truncate">
                {selectedImages[index]?.name || `Image ${index + 1}`}
              </span>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-3 items-end">
        {/* Image Upload Button */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageSelect}
          className="hidden"
          id="chat-image-upload"
          disabled={disabled || selectedImages.length >= 5}
        />
        <label htmlFor="chat-image-upload">
          <Button
            type="button"
            variant="ghost"
            size="medium"
            className="flex-shrink-0"
            disabled={disabled || selectedImages.length >= 5}
            title={selectedImages.length >= 5 ? 'Maximum 5 images' : 'Upload image'}
          >
            <ImageIcon className="w-5 h-5" />
          </Button>
        </label>

        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="flex-1 resize-none rounded-xl border border-neutral-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-neutral-50 disabled:text-neutral-500"
          style={{
            minHeight: '48px',
            maxHeight: '200px'
          }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement
            target.style.height = 'auto'
            target.style.height = `${Math.min(target.scrollHeight, 200)}px`
          }}
        />
        <Button
          onClick={handleSend}
          disabled={disabled || (!message.trim() && selectedImages.length === 0)}
          variant="primary"
          size="medium"
          className="flex-shrink-0"
        >
          {disabled ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Send className="w-5 h-5" />
          )}
        </Button>
      </div>
      <div className="flex items-center justify-between mt-2">
        <p className="text-xs text-neutral-500">
          Press Enter to send, Shift+Enter for new line
        </p>
        {selectedImages.length > 0 && (
          <p className="text-xs text-neutral-500">
            {selectedImages.length} image{selectedImages.length !== 1 ? 's' : ''} attached
          </p>
        )}
      </div>
    </div>
  )
}

