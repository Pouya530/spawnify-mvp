import { NextResponse } from 'next/server'

/**
 * Debug endpoint to check API key configuration
 * Visit: /api/chat/test
 */
export async function GET() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  
  // Don't expose the full key, just show if it exists and first few chars
  const keyStatus = apiKey 
    ? {
        exists: true,
        length: apiKey.length,
        startsWith: apiKey.substring(0, 15) + '...',
        isValidFormat: apiKey.startsWith('sk-ant-api03-')
      }
    : {
        exists: false,
        message: 'ANTHROPIC_API_KEY is not set'
      }

  return NextResponse.json({
    status: apiKey ? 'configured' : 'missing',
    keyStatus,
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  })
}

