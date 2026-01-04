# 🔧 Fix: Chat Tables Missing Error

## Error Message
```
Could not find the table 'public.chat_conversations' in the schema cache
```

## ✅ Solution: Run SQL in Supabase

### Step 1: Open Supabase Dashboard
1. Go to: **https://supabase.com/dashboard**
2. Sign in to your account
3. Select project: **oxdknvkltvigixofxpab** (or your project name)

### Step 2: Open SQL Editor
1. Click **"SQL Editor"** in the left sidebar
2. Click **"New query"** button (top right)

### Step 3: Copy & Paste This SQL

**Copy the ENTIRE SQL below and paste into the SQL Editor:**

```sql
-- Spawnify AI Chat - Database Schema
-- Run this SQL to create chat tables

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

### Step 4: Run the SQL
1. Click **"Run"** button (or press `Cmd+Enter` / `Ctrl+Enter`)
2. Wait for execution to complete
3. You should see: **"Success. No rows returned"** ✅

### Step 5: Verify Tables Created
1. Go to **"Table Editor"** in left sidebar
2. Look for these tables:
   - ✅ `chat_conversations`
   - ✅ `chat_messages`

If you see both tables, you're done! 🎉

### Step 6: Test the Chat Feature
1. Wait 1-2 minutes for cache to clear
2. Visit: **https://spawnify-mvp-gyf2.vercel.app/dashboard/chat**
3. Should work now! ✅

---

## 🔍 Verification Endpoints

After deployment completes (~2 minutes), test these endpoints:

### Check Setup Status
```
https://spawnify-mvp-gyf2.vercel.app/api/chat/setup-check
```

Expected response if tables exist:
```json
{
  "status": "ready",
  "tables": {
    "chat_conversations": { "exists": true },
    "chat_messages": { "exists": true }
  }
}
```

### Debug Endpoint
```
https://spawnify-mvp-gyf2.vercel.app/api/chat/debug
```

---

## ❌ Common Errors & Fixes

### Error: "relation already exists"
**Fix:** Tables already exist! You're good to go. The `IF NOT EXISTS` clause prevents errors.

### Error: "permission denied"
**Fix:** Make sure you're running the SQL as the project owner/admin in Supabase.

### Error: "function uuid_generate_v4() does not exist"
**Fix:** Run this first:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Error: "schema cache" still showing
**Fix:** Wait 1-2 minutes after running SQL. Supabase caches schema changes.

---

## 📋 What This SQL Creates

✅ **Tables:**
- `chat_conversations` - Stores conversation history
- `chat_messages` - Stores individual messages

✅ **Indexes:**
- User ID index for fast lookups
- Timestamp indexes for sorting

✅ **Security:**
- Row Level Security (RLS) enabled
- Policies ensure users only see their own data

✅ **Functions:**
- Auto-update conversation timestamp when messages added

---

## 🚀 After Setup

Once tables are created:
1. ✅ Chat feature will work
2. ✅ Conversations will save
3. ✅ Messages will persist
4. ✅ Users can have multiple conversations

Test it: https://spawnify-mvp-gyf2.vercel.app/dashboard/chat


