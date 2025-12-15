/**
 * Supabase Client for Server Components
 * Use this in server components and API routes
 */
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/types/database'

export const createClient = () => {
  return createServerComponentClient<Database>({ cookies })
}

