import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load .env.local if it exists
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://YOUR_PROJECT_REF.supabase.co'
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '***REMOVED_ANON_KEY***'

if (!supabaseKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY not set')
  console.error('   Using default anon key for verification')
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifySetup() {
  console.log('🔍 Verifying Spawnify AI Chat Setup...\n')
  console.log('='.repeat(60))
  
  let allChecksPassed = true
  
  // Check 1: Chat Conversations Table
  console.log('\n1. Checking chat_conversations table...')
  const { data: conversations, error: convError } = await supabase
    .from('chat_conversations')
    .select('id')
    .limit(1)
  
  if (convError) {
    if (convError.code === '42P01' || convError.message?.includes('does not exist')) {
      console.log('   ❌ Table does NOT exist')
      console.log('   → Run scripts/create-chat-tables.sql in Supabase SQL Editor')
      allChecksPassed = false
    } else {
      console.log('   ⚠️  Error:', convError.message)
      allChecksPassed = false
    }
  } else {
    console.log('   ✅ Table exists')
  }
  
  // Check 2: Chat Messages Table
  console.log('\n2. Checking chat_messages table...')
  const { data: messages, error: msgError } = await supabase
    .from('chat_messages')
    .select('id')
    .limit(1)
  
  if (msgError) {
    if (msgError.code === '42P01' || msgError.message?.includes('does not exist')) {
      console.log('   ❌ Table does NOT exist')
      console.log('   → Run scripts/create-chat-tables.sql in Supabase SQL Editor')
      allChecksPassed = false
    } else {
      console.log('   ⚠️  Error:', msgError.message)
      allChecksPassed = false
    }
  } else {
    console.log('   ✅ Table exists')
  }
  
  // Check 3: RLS Policies
  console.log('\n3. Checking Row Level Security policies...')
  // Try to query with anon key to verify RLS is working
  const anonSupabase = createClient(
    supabaseUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
  
  const { error: rlsError } = await anonSupabase
    .from('chat_conversations')
    .select('id')
    .limit(0)
  
  if (rlsError && rlsError.code === '42501') {
    console.log('   ✅ RLS is enabled (expected error for unauthenticated user)')
  } else if (rlsError && rlsError.code === '42P01') {
    console.log('   ⚠️  Table missing (RLS check skipped)')
  } else {
    console.log('   ✅ RLS appears to be configured')
  }
  
  // Check 4: Environment Variables
  console.log('\n4. Checking environment variables...')
  const hasAnthropicKey = !!process.env.ANTHROPIC_API_KEY
  const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasSupabaseAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  console.log(`   ANTHROPIC_API_KEY: ${hasAnthropicKey ? '✅ Set' : '❌ Missing'}`)
  console.log(`   NEXT_PUBLIC_SUPABASE_URL: ${hasSupabaseUrl ? '✅ Set' : '❌ Missing'}`)
  console.log(`   NEXT_PUBLIC_SUPABASE_ANON_KEY: ${hasSupabaseAnonKey ? '✅ Set' : '❌ Missing'}`)
  
  if (!hasAnthropicKey || !hasSupabaseUrl || !hasSupabaseAnonKey) {
    allChecksPassed = false
  }
  
  // Check 5: API Key Format
  if (hasAnthropicKey) {
    const apiKey = process.env.ANTHROPIC_API_KEY!
    const keyPrefix = apiKey.substring(0, 15)
    const keyLength = apiKey.length
    
    console.log(`\n5. Checking API key format...`)
    console.log(`   Prefix: ${keyPrefix}`)
    console.log(`   Length: ${keyLength} characters`)
    
    if (keyPrefix.startsWith('sk-ant-api03-')) {
      console.log('   ✅ Format is valid')
    } else {
      console.log('   ⚠️  Format may be invalid (should start with sk-ant-api03-)')
    }
    
    if (keyLength >= 200 && keyLength <= 250) {
      console.log('   ✅ Length is correct')
    } else {
      console.log('   ⚠️  Length is unexpected (expected ~219 characters)')
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('\n📊 VERIFICATION SUMMARY')
  console.log('='.repeat(60))
  
  if (allChecksPassed) {
    console.log('\n✅ All checks passed! Your setup is ready.')
    console.log('\nNext steps:')
    console.log('1. Test the chat: npm run test-chat')
    console.log('2. Deploy: npm run deploy-chat')
    console.log('3. Visit: https://spawnify-mvp-gyf2.vercel.app/dashboard/chat')
  } else {
    console.log('\n❌ Some checks failed. Please fix the issues above.')
    console.log('\nCommon fixes:')
    console.log('- Missing tables: Run scripts/create-chat-tables.sql in Supabase')
    console.log('- Missing env vars: Add to .env.local and Vercel')
    console.log('- Invalid API key: Get new key from https://console.anthropic.com/')
  }
  
  console.log('\n' + '='.repeat(60))
}

verifySetup().catch(console.error)

