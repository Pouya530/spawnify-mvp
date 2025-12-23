import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

export async function GET() {
  const apiKey = process.env.ANTHROPIC_API_KEY
  const hasKey = !!apiKey
  const keyPrefix = apiKey?.substring(0, 15) || 'MISSING'
  const keyLength = apiKey?.length || 0
  
  // Test the API key if it exists
  let apiTest: { works?: boolean; error?: string } = {}
  if (hasKey && apiKey) {
    try {
      const anthropic = new Anthropic({ apiKey })
      const response = await anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'hi' }]
      })
      apiTest.works = !!response.content[0]
    } catch (error: any) {
      apiTest.error = error.message || error.type || 'Unknown error'
      apiTest.works = false
    }
  }
  
  return NextResponse.json({
    hasAnthropicKey: hasKey,
    keyPrefix,
    keyLength,
    keyFormatValid: keyPrefix.startsWith('sk-ant-api03-'),
    expectedLength: '~219 characters',
    nodeEnv: process.env.NODE_ENV,
    allEnvKeys: Object.keys(process.env).filter(k => k.includes('ANTHROPIC')),
    apiTest: hasKey ? apiTest : { note: 'No API key to test' }
  })
}

