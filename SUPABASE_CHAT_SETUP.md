# Supabase Chat Tables Setup

## Quick Fix: Run SQL in Supabase

The error `Could not find the table 'public.chat_conversations'` means the chat tables haven't been created yet.

### Steps:

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project: `oxdknvkltvigixofxpab`

2. **Open SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New query"

3. **Run the Schema**
   - Copy the entire contents of `chat-schema.sql` file
   - Paste into the SQL Editor
   - Click "Run" (or press Cmd/Ctrl + Enter)

4. **Verify**
   - Go to "Table Editor" in left sidebar
   - You should see:
     - `chat_conversations` ✅
     - `chat_messages` ✅

5. **Test**
   - Visit: https://spawnify-mvp-gyf2.vercel.app/dashboard/chat
   - Should work now! 🎉

## What the Schema Creates:

- ✅ `chat_conversations` table (stores conversation history)
- ✅ `chat_messages` table (stores individual messages)
- ✅ Indexes for performance
- ✅ Row Level Security (RLS) policies
- ✅ Auto-update trigger for conversation timestamps

## Alternative: Copy-Paste Ready SQL

If you prefer, here's the SQL ready to paste:

```sql
-- Spawnify AI Chat - Database Schema Additions
CREATE TABLE IF NOT EXISTS chat_conversations (
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
  EXECUTE FUNCTION update_chat_conversation_updated_at();
```

## After Running:

1. ✅ Tables created
2. ✅ Security policies enabled
3. ✅ Indexes created
4. ✅ Triggers set up
5. ✅ Chat feature ready!

Test at: https://spawnify-mvp-gyf2.vercel.app/dashboard/chat


