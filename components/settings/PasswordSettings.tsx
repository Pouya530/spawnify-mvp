'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Lock } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function PasswordSettings() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm({
    defaultValues: {
      newPassword: '',
      confirmPassword: ''
    }
  })
  
  const newPassword = watch('newPassword')
  
  async function onSubmit(data: { newPassword: string }) {
    setLoading(true)
    setError('')
    setSuccess(false)
    
    try {
      const supabase = createClient()
      
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword
      })
      
      if (updateError) {
        throw updateError
      }
      
      setSuccess(true)
      reset()
      
      // Auto-hide success message
      setTimeout(() => setSuccess(false), 5000)
      
    } catch (err: any) {
      console.error('Password update error:', err)
      setError(err.message || 'Failed to update password. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Card className="p-8">
      <h2 className="text-xl font-bold text-neutral-900 mb-6">
        Change Password
      </h2>
      
      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-success-50 border border-success-200 rounded-xl">
          <p className="text-sm text-success-700">
            Password updated successfully!
          </p>
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Input
          type="password"
          label="New Password"
          placeholder="••••••••"
          error={errors.newPassword?.message}
          icon={<Lock className="w-5 h-5" />}
          {...register('newPassword', {
            required: 'Password is required',
            minLength: {
              value: 8,
              message: 'Password must be at least 8 characters'
            }
          })}
        />
        
        <Input
          type="password"
          label="Confirm New Password"
          placeholder="••••••••"
          error={errors.confirmPassword?.message}
          icon={<Lock className="w-5 h-5" />}
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: value => 
              value === newPassword || 'Passwords do not match'
          })}
        />
        
        <div className="flex justify-end">
          <Button 
            type="submit" 
            variant="primary"
            loading={loading}
            disabled={loading}
          >
            Update Password
          </Button>
        </div>
      </form>
    </Card>
  )
}

