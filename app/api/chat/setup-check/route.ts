import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Setup check endpoint - Verifies if chat tables exist
 * Visit: /api/chat/setup-check
 */
export async function GET() {
  try {
    const supabase = createClient()
    
    const results = {
      chat_conversations: {
        exists: false,
        error: null as string | null,
        canQuery: false
      },
      chat_messages: {
        exists: false,
        error: null as string | null,
        canQuery: false
      }
    }

    // Check chat_conversations table
    try {
      const { data, error } = await supabase
        .from('chat_conversations')
        .select('id')
        .limit(1)
      
      if (error) {
        results.chat_conversations.error = error.message
        results.chat_conversations.exists = false
        
        if (error.code === '42P01' || error.message?.includes('does not exist') || error.message?.includes('schema cache')) {
          results.chat_conversations.error = 'Table does not exist. Run chat-schema.sql in Supabase SQL Editor.'
        }
      } else {
        results.chat_conversations.exists = true
        results.chat_conversations.canQuery = true
      }
    } catch (err: any) {
      results.chat_conversations.error = err.message || 'Unknown error'
    }

    // Check chat_messages table
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('id')
        .limit(1)
      
      if (error) {
        results.chat_messages.error = error.message
        results.chat_messages.exists = false
        
        if (error.code === '42P01' || error.message?.includes('does not exist') || error.message?.includes('schema cache')) {
          results.chat_messages.error = 'Table does not exist. Run chat-schema.sql in Supabase SQL Editor.'
        }
      } else {
        results.chat_messages.exists = true
        results.chat_messages.canQuery = true
      }
    } catch (err: any) {
      results.chat_messages.error = err.message || 'Unknown error'
    }

    const allTablesExist = results.chat_conversations.exists && results.chat_messages.exists

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      status: allTablesExist ? 'ready' : 'setup_required',
      tables: results,
      instructions: allTablesExist ? null : {
        step1: 'Go to Supabase Dashboard: https://supabase.com/dashboard',
        step2: 'Select your project',
        step3: 'Click "SQL Editor" → "New query"',
        step4: 'Copy and paste the SQL from chat-schema.sql',
        step5: 'Click "Run"',
        step6: 'Verify tables appear in "Table Editor"',
        sqlFile: 'chat-schema.sql',
        quickSQL: `CREATE TABLE IF NOT EXISTS chat_conversations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'New Conversation',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_conversations_user_id ON chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_updated_at ON chat_conversations(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation_id ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);

ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
  ON chat_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own conversations"
  ON chat_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations"
  ON chat_conversations FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
  ON chat_conversations FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view messages in own conversations"
  ON chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chat_conversations
      WHERE chat_conversations.id = chat_messages.conversation_id
      AND chat_conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in own conversations"
  ON chat_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chat_conversations
      WHERE chat_conversations.id = chat_messages.conversation_id
      AND chat_conversations.user_id = auth.uid()
    )
  );

CREATE OR REPLACE FUNCTION update_chat_conversation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_conversations
  SET updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_conversation_timestamp
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_conversation_updated_at();`
      }
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        error: 'Failed to check database setup',
        message: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}


