import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://YOUR_PROJECT_REF.supabase.co'
const supabaseKey = '***REMOVED_SERVICE_ROLE_KEY***'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkTables() {
  console.log('Checking database tables...\n')
  
  // Check chat_conversations
  const { data: conversations, error: convError } = await supabase
    .from('chat_conversations')
    .select('count')
    .limit(1)
  
  console.log('chat_conversations table:')
  if (convError) {
    console.log('❌ ERROR:', convError.message)
    if (convError.code === '42P01' || convError.message?.includes('does not exist')) {
      console.log('   → Table does NOT exist')
    }
  } else {
    console.log('✅ EXISTS')
  }
  
  // Check chat_messages
  const { data: messages, error: msgError } = await supabase
    .from('chat_messages')
    .select('count')
    .limit(1)
  
  console.log('\nchat_messages table:')
  if (msgError) {
    console.log('❌ ERROR:', msgError.message)
    if (msgError.code === '42P01' || msgError.message?.includes('does not exist')) {
      console.log('   → Table does NOT exist')
    }
  } else {
    console.log('✅ EXISTS')
  }
  
  // Try to list all tables using a direct query
  console.log('\n📋 Attempting to list all tables...')
  try {
    // Use a simple query to check what tables exist
    const { data: testData, error: testError } = await supabase
      .from('grow_logs')
      .select('id')
      .limit(1)
    
    if (!testError) {
      console.log('✅ Can query grow_logs (database connection works)')
    }
  } catch (e) {
    console.log('⚠️  Could not verify database connection')
  }
  
  console.log('\n' + '='.repeat(50))
  console.log('SUMMARY:')
  console.log('='.repeat(50))
  
  const convExists = !convError || (convError.code !== '42P01' && !convError.message?.includes('does not exist'))
  const msgExists = !msgError || (msgError.code !== '42P01' && !msgError.message?.includes('does not exist'))
  
  if (convExists && msgExists) {
    console.log('✅ Both chat tables exist!')
  } else {
    console.log('❌ Chat tables are MISSING')
    console.log('\n📝 Next steps:')
    console.log('1. Go to Supabase Dashboard: https://supabase.com/dashboard')
    console.log('2. Select your project')
    console.log('3. Click "SQL Editor" → "New query"')
    console.log('4. Copy and paste the SQL from RUN_THIS_SQL.sql')
    console.log('5. Click "Run"')
    console.log('6. Verify tables appear in "Table Editor"')
  }
}

checkTables().catch(console.error)


