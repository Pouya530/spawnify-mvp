'use client'

import { useState, useRef } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils/cn'

interface PhotoUploadProps {
  photos: File[]
  onChange: (photos: File[]) => void
}

export function PhotoUpload({ photos, onChange }: PhotoUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  function validateFile(file: File): string | null {
    // Check file type
    if (!file.type.startsWith('image/')) {
      return 'File must be an image (PNG, JPG, JPEG)'
    }
    
    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return 'File size must be less than 10MB'
    }
    
    return null
  }
  
  function handleFiles(files: File[]) {
    const newErrors: string[] = []
    const validFiles: File[] = []
    
    files.forEach((file) => {
      const error = validateFile(file)
      if (error) {
        newErrors.push(`${file.name}: ${error}`)
      } else {
        validFiles.push(file)
      }
    })
    
    if (newErrors.length > 0) {
      setErrors(newErrors)
      setTimeout(() => setErrors([]), 5000)
    }
    
    if (validFiles.length > 0) {
      onChange([...photos, ...validFiles])
    }
  }
  
  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }
  
  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    handleFiles(files)
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }
  
  function removePhoto(index: number) {
    onChange(photos.filter((_, i) => i !== index))
  }
  
  return (
    <div className="space-y-4">
      {/* Error Messages */}
      {errors.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          {errors.map((error, index) => (
            <p key={index} className="text-sm text-red-600">{error}</p>
          ))}
        </div>
      )}
      
      {/* Drop Zone */}
      <div
        className={cn(
          'border-2 border-dashed rounded-xl p-12 text-center transition-standard',
          dragActive 
            ? 'border-primary-500 bg-primary-50' 
            : 'border-neutral-300 hover:border-neutral-400'
        )}
        onDragOver={(e) => { 
          e.preventDefault()
          setDragActive(true)
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
      >
        <Upload className="w-12 h-12 mx-auto text-neutral-400 mb-4" />
        <p className="text-neutral-600 mb-2 font-medium">
          Drag & drop photos here, or click to select
        </p>
        <p className="text-sm text-neutral-500 mb-4">
          PNG, JPG, JPEG up to 10MB each
        </p>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/png,image/jpeg,image/jpg"
          className="hidden"
          id="file-upload"
          onChange={handleFileInput}
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <Button 
            type="button" 
            variant="secondary" 
            className="mt-2"
            onClick={() => fileInputRef.current?.click()}
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            Select Files
          </Button>
        </label>
      </div>
      
      {/* Preview Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {photos.map((photo, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-neutral-100">
                <img
                  src={URL.createObjectURL(photo)}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                aria-label="Remove photo"
              >
                <X className="w-4 h-4" />
              </button>
              <p className="mt-1 text-xs text-neutral-500 truncate">
                {photo.name}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

