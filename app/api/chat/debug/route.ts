import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Enhanced debug endpoint to check ALL environment variables AND database tables
 * Visit: /api/chat/debug
 */
export async function GET() {
  // Check for the API key
  const apiKey = process.env.ANTHROPIC_API_KEY
  
  // Get all environment variables that contain "ANTHROPIC" or "API"
  const allEnvVars = Object.keys(process.env)
    .filter(key => 
      key.includes('ANTHROPIC') || 
      key.includes('API') || 
      key.includes('KEY')
    )
    .reduce((acc, key) => {
      const value = process.env[key]
      acc[key] = {
        exists: !!value,
        length: value?.length || 0,
        startsWith: value?.substring(0, 20) + '...' || 'N/A',
        fullValue: value || 'NOT SET'
      }
      return acc
    }, {} as Record<string, any>)

  // Check if database tables exist
  let tableStatus = {
    chat_conversations: { exists: false, error: null as string | null },
    chat_messages: { exists: false, error: null as string | null }
  }

  try {
    const supabase = createClient()
    
    // Try to query chat_conversations table
    const { error: convError } = await supabase
      .from('chat_conversations')
      .select('id')
      .limit(1)
    
    if (convError) {
      tableStatus.chat_conversations.error = convError.message
      if (convError.code === '42P01' || convError.message?.includes('does not exist')) {
        tableStatus.chat_conversations.exists = false
      }
    } else {
      tableStatus.chat_conversations.exists = true
    }

    // Try to query chat_messages table
    const { error: msgError } = await supabase
      .from('chat_messages')
      .select('id')
      .limit(1)
    
    if (msgError) {
      tableStatus.chat_messages.error = msgError.message
      if (msgError.code === '42P01' || msgError.message?.includes('does not exist')) {
        tableStatus.chat_messages.exists = false
      }
    } else {
      tableStatus.chat_messages.exists = true
    }
  } catch (error: any) {
    tableStatus.chat_conversations.error = error.message || 'Unknown error'
    tableStatus.chat_messages.error = error.message || 'Unknown error'
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    apiKeyStatus: {
      exists: !!apiKey,
      length: apiKey?.length || 0,
      startsWith: apiKey?.substring(0, 15) + '...' || 'N/A',
      isValidFormat: apiKey?.startsWith('sk-ant-api03-') || false
    },
    databaseTables: tableStatus,
    allRelevantEnvVars: allEnvVars,
    instructions: {
      step1: 'Go to Vercel Dashboard → Settings → Environment Variables',
      step2: 'Add variable: Name = ANTHROPIC_API_KEY, Value = your-api-key',
      step3: 'Check ALL environments: Production, Preview, Development',
      step4: 'Save and REDEPLOY',
      step5: 'Wait 2-3 minutes, then test again',
      step6: 'If tables missing: Run chat-schema.sql in Supabase SQL Editor'
    }
  })
}

