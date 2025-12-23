import { NextResponse } from 'next/server'

/**
 * Enhanced debug endpoint to check ALL environment variables
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
    allRelevantEnvVars: allEnvVars,
    instructions: {
      step1: 'Go to Vercel Dashboard → Settings → Environment Variables',
      step2: 'Add variable: Name = ANTHROPIC_API_KEY, Value = your-api-key',
      step3: 'Check ALL environments: Production, Preview, Development',
      step4: 'Save and REDEPLOY',
      step5: 'Wait 2-3 minutes, then test again'
    }
  })
}

