'use client'

import { TextareaHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils/cn'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`
    
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-neutral-900 mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full bg-white border border-neutral-200 rounded-xl px-4 py-3',
            'text-neutral-900 placeholder-neutral-400',
            'transition-standard',
            'focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100',
            'hover:border-neutral-300',
            'disabled:bg-neutral-100 disabled:cursor-not-allowed',
            'resize-y min-h-[6rem]',
            error && 'border-red-300 focus:border-red-400 focus:ring-red-100',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
        {props.maxLength && (
          <p className="mt-1 text-xs text-neutral-500 text-right">
            {props.value?.toString().length || 0} / {props.maxLength} characters
          </p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

export { Textarea }

