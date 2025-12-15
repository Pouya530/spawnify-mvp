/**
 * Supabase Client for Middleware
 * Use this in middleware.ts
 */
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse, NextRequest } from 'next/server'
import { Database } from '@/lib/types/database'

export async function createClient(req: NextRequest, res: NextResponse) {
  return createMiddlewareClient<Database>({ req, res })
}

