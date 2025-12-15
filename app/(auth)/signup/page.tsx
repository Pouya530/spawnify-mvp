'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, User } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'

export default function SignupPage() {
  // TEMPORARY DEBUG - Remove after testing
  console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('Anon Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  console.log('Anon Key length:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length)
  
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({})
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: ''
  })

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return regex.test(email)
  }

  const validatePassword = (password: string) => {
    return password.length >= 8
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    // Client-side validation
    if (!formData.email) {
      setErrors({ email: 'Email is required' })
      setLoading(false)
      return
    }

    if (!validateEmail(formData.email)) {
      setErrors({ email: 'Please enter a valid email address' })
      setLoading(false)
      return
    }

    if (!formData.password) {
      setErrors({ password: 'Password is required' })
      setLoading(false)
      return
    }

    if (!validatePassword(formData.password)) {
      setErrors({ password: 'Password must be at least 8 characters' })
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.full_name || undefined
          },
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      })

      if (error) {
        console.error('Signup error details:', {
          message: error.message,
          status: error.status,
          name: error.name
        })
        
        // Handle specific error messages
        if (error.message.includes('already registered') || error.message.includes('already exists')) {
          setErrors({ email: 'This email is already in use' })
        } else if (error.message.includes('Invalid email')) {
          setErrors({ email: 'Please enter a valid email address' })
        } else if (error.message.includes('Password')) {
          setErrors({ password: 'Password must be at least 8 characters' })
        } else if (error.status === 500) {
          setErrors({ general: 'Server error. Please check: 1) Database schema is set up in Supabase, 2) Trigger function handle_new_user() exists, 3) user_profiles table exists' })
        } else {
          setErrors({ general: error.message || 'An error occurred during signup' })
        }
        setLoading(false)
        return
      }

      // Success - redirect to dashboard
      if (data.user) {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error: any) {
      console.error('Signup error:', error)
      setErrors({ general: 'Connection lost. Please try again.' })
      setLoading(false)
    }
  }

  return (
    <Card>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">
            Create your account
          </h2>
          <p className="text-neutral-600 mt-2 text-sm">
            Start tracking your mushroom cultivation journey
          </p>
        </div>

        {/* General Error */}
        {errors.general && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{errors.general}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            label="Email"
            placeholder="you@example.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
            icon={<Mail className="w-5 h-5" />}
            required
            disabled={loading}
          />

          <Input
            type="password"
            label="Password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            error={errors.password}
            icon={<Lock className="w-5 h-5" />}
            required
            disabled={loading}
          />

          <Input
            type="text"
            label="Full Name (Optional)"
            placeholder="John Doe"
            value={formData.full_name}
            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            icon={<User className="w-5 h-5" />}
            disabled={loading}
          />

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            loading={loading}
            disabled={loading}
          >
            Create Account
          </Button>
        </form>

        <div className="text-center text-sm text-neutral-600">
          Already have an account?{' '}
          <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
            Sign in
          </Link>
        </div>
      </div>
    </Card>
  )
}

