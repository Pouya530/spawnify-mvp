# AI Chat Agent - Spawnify Grow Assistant

## Role
You are the AI Chat Agent responsible for implementing an intelligent chat interface that connects to grow logs and provides personalized tutorials, troubleshooting advice, and step-by-step guidance for mushroom cultivation using Claude.ai API.

## Primary Objectives
1. Create AI-powered chat interface using Claude.ai API
2. Connect chat to user's grow logs for personalized advice
3. Provide contextual tutorials based on growth stage
4. Offer troubleshooting assistance for common issues
5. Generate step-by-step guidance for cultivation techniques
6. Maintain conversation history per user
7. Ensure secure API key management

## Tech Stack
- **AI Provider**: Anthropic Claude API (claude-3-5-sonnet-20241022)
- **Framework**: Next.js 14.2+ (App Router)
- **Database**: Supabase (PostgreSQL) for chat history
- **API Routes**: Next.js API routes for secure Claude API calls
- **UI**: React components with real-time messaging
- **State Management**: React hooks for chat state

## Architecture Overview

```
User → Chat UI → Next.js API Route → Claude API → Response → Chat UI
                ↓
         Supabase (Store chat history)
                ↓
         Fetch user's grow logs
                ↓
         Build context for AI
```

## Database Schema

### Tables Created

1. **chat_conversations**
   - `id` (UUID, Primary Key)
   - `user_id` (UUID, Foreign Key to auth.users)
   - `title` (TEXT, Default: 'New Conversation')
   - `created_at` (TIMESTAMP)
   - `updated_at` (TIMESTAMP)

2. **chat_messages**
   - `id` (UUID, Primary Key)
   - `conversation_id` (UUID, Foreign Key to chat_conversations)
   - `role` (TEXT, CHECK: 'user' | 'assistant' | 'system')
   - `content` (TEXT)
   - `metadata` (JSONB, for storing grow log references)
   - `created_at` (TIMESTAMP)

### RLS Policies
- Users can only view/create/update/delete their own conversations
- Messages inherit conversation permissions
- Auto-update conversation timestamp when messages are added

## API Routes

### POST `/api/chat`
**Purpose**: Send a message and get AI response

**Request Body**:
```json
{
  "conversationId": "uuid-or-null",
  "message": "user message text",
  "isNewConversation": boolean
}
```

**Response**:
```json
{
  "conversationId": "uuid",
  "message": "AI response text",
  "usage": {
    "inputTokens": number,
    "outputTokens": number
  }
}
```

**Features**:
- Creates new conversation if needed
- Fetches user's grow logs for context
- Builds system prompt with grow log data
- Maintains conversation history
- Saves both user and assistant messages

### GET `/api/chat`
**Purpose**: Fetch conversations or specific conversation with messages

**Query Params**:
- `conversationId` (optional): Fetch specific conversation with messages

**Response** (with conversationId):
```json
{
  "conversation": { ... },
  "messages": [ ... ]
}
```

**Response** (without conversationId):
```json
{
  "conversations": [ ... ]
}
```

### DELETE `/api/chat?conversationId=uuid`
**Purpose**: Delete a conversation and all its messages

**Response**:
```json
{
  "success": true
}
```

## Components

### 1. ChatInterface (`components/chat/ChatInterface.tsx`)
**Purpose**: Main chat container component

**Features**:
- Manages conversation state
- Handles message sending/receiving
- Integrates ConversationList and ChatInput
- Displays messages with MessageBubble
- Error handling and loading states

**Props**:
```typescript
interface ChatInterfaceProps {
  initialConversations?: ChatConversation[]
}
```

### 2. MessageBubble (`components/chat/MessageBubble.tsx`)
**Purpose**: Display individual chat messages

**Features**:
- Different styling for user vs assistant
- Avatar icons (User/Bot)
- Timestamp display
- Proper text formatting

**Props**:
```typescript
interface MessageBubbleProps {
  message: ChatMessage
}
```

### 3. ChatInput (`components/chat/ChatInput.tsx`)
**Purpose**: Message input field with send button

**Features**:
- Auto-resizing textarea
- Enter to send, Shift+Enter for new line
- Loading state during API calls
- Disabled state handling

**Props**:
```typescript
interface ChatInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
}
```

### 4. ConversationList (`components/chat/ConversationList.tsx`)
**Purpose**: Sidebar showing conversation history

**Features**:
- List of all conversations
- Select conversation to view messages
- Delete conversation button
- New conversation button
- Empty state handling

**Props**:
```typescript
interface ConversationListProps {
  conversations: ChatConversation[]
  selectedConversationId: string | null
  onSelectConversation: (id: string) => void
  onNewConversation: () => void
  onDeleteConversation: (id: string) => void
  loading?: boolean
}
```

## Pages

### `/dashboard/chat` (`app/dashboard/chat/page.tsx`)
**Purpose**: Chat page with full interface

**Features**:
- Server-side conversation fetching
- Full-height chat interface
- Page header with description

## Utilities

### `lib/utils/chatContext.ts`

#### `getUserGrowLogs(userId: string): Promise<GrowLog[]>`
Fetches user's recent grow logs for AI context

#### `buildGrowLogsContext(logs: GrowLog[]): string`
Converts grow logs array into formatted context string for AI prompt

#### `buildSystemPrompt(growLogsContext: string): string`
Creates comprehensive system prompt for Claude AI with:
- Role definition (expert mushroom cultivation assistant)
- User's grow log context
- Guidelines for responses
- Legal compliance (UK legal varieties only)

## System Prompt Structure

The AI assistant is configured with:
1. **Role**: Expert AI assistant for Spawnify
2. **Capabilities**: Tutorials, troubleshooting, personalized advice
3. **Context**: User's grow log history
4. **Guidelines**:
   - Friendly and educational tone
   - Reference specific grow log data
   - Provide actionable step-by-step advice
   - UK legal mushroom varieties only
   - Format responses clearly

## Environment Variables

Required in `.env.local`:
```env
ANTHROPIC_API_KEY=sk-ant-api03-...
```

Required in Vercel:
- Add `ANTHROPIC_API_KEY` to environment variables

## Security Considerations

1. **API Key Protection**:
   - Never expose API key in client-side code
   - All Claude API calls happen server-side
   - API key stored in environment variables only

2. **Authentication**:
   - All API routes verify user authentication
   - RLS policies ensure users only see their own data

3. **Rate Limiting**:
   - Claude API has rate limits
   - Error handling for 429 responses
   - Consider implementing client-side rate limiting

4. **Input Validation**:
   - Message content validation
   - Conversation ID validation
   - User ownership verification

## Error Handling

### API Errors
- **401 Unauthorized**: User not authenticated
- **429 Rate Limit**: Too many requests
- **500 Server Error**: API key issues or other errors

### UI Error States
- Display error messages to user
- Retry mechanisms for failed requests
- Graceful degradation

## Usage Flow

1. User navigates to `/dashboard/chat`
2. Sees conversation list (or empty state)
3. Clicks "New Chat" or selects existing conversation
4. Types message and sends
5. API route:
   - Verifies authentication
   - Creates/updates conversation
   - Fetches user's grow logs
   - Builds context and system prompt
   - Calls Claude API
   - Saves messages to database
   - Returns response
6. UI displays assistant response
7. Conversation continues with full history

## Testing Checklist

- [ ] Create new conversation
- [ ] Send message and receive response
- [ ] View conversation history
- [ ] Switch between conversations
- [ ] Delete conversation
- [ ] Error handling (invalid API key)
- [ ] Error handling (rate limit)
- [ ] Error handling (network error)
- [ ] Grow log context is included
- [ ] System prompt is correct
- [ ] RLS policies work correctly
- [ ] Mobile responsiveness

## Future Enhancements

1. **Streaming Responses**: Implement streaming for real-time token display
2. **Message Editing**: Allow users to edit/delete their messages
3. **Conversation Sharing**: Share conversations with other users
4. **AI Model Selection**: Let users choose Claude model (Sonnet/Opus/Haiku)
5. **Context Window Management**: Smart truncation of long conversations
6. **File Uploads**: Allow users to upload photos for troubleshooting
7. **Voice Input**: Speech-to-text for messages
8. **Suggested Questions**: Show common questions based on grow stage
9. **Knowledge Base**: Pre-built responses for common issues
10. **Analytics**: Track popular questions and response quality

## Dependencies

```json
{
  "@anthropic-ai/sdk": "^0.24.0"
}
```

## Implementation Files

- `chat-schema.sql` - Database schema
- `app/api/chat/route.ts` - API routes
- `components/chat/ChatInterface.tsx` - Main component
- `components/chat/MessageBubble.tsx` - Message display
- `components/chat/ChatInput.tsx` - Input component
- `components/chat/ConversationList.tsx` - Sidebar
- `app/dashboard/chat/page.tsx` - Chat page
- `lib/utils/chatContext.ts` - Context utilities
- `lib/types/chat.ts` - Type definitions

## Next Steps After Implementation

1. **Run Database Schema**:
   ```sql
   -- Run chat-schema.sql in Supabase SQL Editor
   ```

2. **Set Environment Variable**:
   ```env
   ANTHROPIC_API_KEY=your-key-here
   ```

3. **Test Locally**:
   ```bash
   npm run dev
   # Visit http://localhost:3000/dashboard/chat
   ```

4. **Deploy to Vercel**:
   - Add `ANTHROPIC_API_KEY` to Vercel environment variables
   - Redeploy

5. **Verify**:
   - Test creating conversations
   - Test sending messages
   - Verify grow log context is included
   - Check error handling

## Troubleshooting

### "Invalid API key" Error
- Verify `ANTHROPIC_API_KEY` is set correctly
- Check API key hasn't expired
- Ensure key starts with `sk-ant-api03-`

### "Rate limit exceeded" Error
- Claude API has rate limits based on plan
- Implement exponential backoff
- Consider upgrading Anthropic plan

### Messages Not Saving
- Check RLS policies are correct
- Verify database schema was run
- Check Supabase connection

### No Grow Log Context
- Verify `getUserGrowLogs` function works
- Check user has created grow logs
- Verify system prompt includes context

## Support

For issues or questions:
1. Check Anthropic API documentation
2. Verify environment variables
3. Check Supabase logs
4. Review API route logs in Vercel


