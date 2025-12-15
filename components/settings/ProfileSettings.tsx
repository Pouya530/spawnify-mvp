'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Edit, Mail, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Database } from '@/lib/types/database'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']

interface ProfileSettingsProps {
  profile: UserProfile | null
  userEmail?: string
}

export function ProfileSettings({ profile, userEmail }: ProfileSettingsProps) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      full_name: profile?.full_name || ''
    }
  })
  
  async function onSubmit(data: { full_name: string }) {
    setLoading(true)
    setError('')
    setSuccess(false)
    
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('You must be logged in to update your profile')
        setLoading(false)
        return
      }
      
      const { error: updateError } = await (supabase as any)
        .from('user_profiles')
        .update({ full_name: data.full_name || null })
        .eq('id', user.id)
      
      if (updateError) {
        throw updateError
      }
      
      setSuccess(true)
      setEditing(false)
      
      // Refresh page data
      router.refresh()
      
      // Auto-hide success message
      setTimeout(() => setSuccess(false), 3000)
      
    } catch (err: any) {
      console.error('Profile update error:', err)
      setError(err.message || 'Failed to update profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  function handleCancel() {
    reset({ full_name: profile?.full_name || '' })
    setEditing(false)
    setError('')
  }
  
  return (
    <Card className="p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-neutral-900">
          Profile Information
        </h2>
        {!editing && (
          <Button 
            variant="ghost" 
            onClick={() => setEditing(true)}
            size="small"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        )}
      </div>
      
      {/* Success Message */}
      {success && (
        <div className="mb-6 p-4 bg-success-50 border border-success-200 rounded-xl">
          <p className="text-sm text-success-700">
            Profile updated successfully!
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
        {/* Email (read-only) */}
        <div>
          <label className="block text-sm font-medium text-neutral-900 mb-2">
            Email
          </label>
          <Input
            type="email"
            value={userEmail || ''}
            disabled
            icon={<Mail className="w-5 h-5" />}
          />
          <p className="text-xs text-neutral-500 mt-1">
            Email cannot be changed
          </p>
        </div>
        
        {/* Full Name */}
        <Input
          label="Full Name"
          placeholder="John Doe"
          disabled={!editing}
          error={errors.full_name?.message}
          icon={<User className="w-5 h-5" />}
          {...register('full_name')}
        />
        
        {/* Action Buttons */}
        {editing && (
          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={loading}
            >
              Save Changes
            </Button>
          </div>
        )}
      </form>
    </Card>
  )
}

