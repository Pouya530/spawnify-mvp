/**
 * Supabase Client for Client Components
 * Use this in 'use client' components
 */
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/types/database'

export const createClient = () => {
  // Debug: Verify environment variables are available
  if (typeof window !== 'undefined') {
    // Client-side only
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!url || !anonKey) {
      console.error('❌ Missing Supabase environment variables!')
      console.error('URL:', url ? '✓' : '✗')
      console.error('Anon Key:', anonKey ? '✓' : '✗')
      throw new Error('NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY env variables are required')
    }
  }
  
  return createClientComponentClient<Database>()
}
