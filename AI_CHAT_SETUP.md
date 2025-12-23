# AI Chat Feature Setup Guide

This guide will help you set up the AI Chat feature for Spawnify using Claude.ai API.

## Prerequisites

1. ✅ Anthropic API account with API key
2. ✅ Supabase project set up
3. ✅ Next.js application running

## Step 1: Get Claude.ai API Key

1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Navigate to **Settings → API Keys**
4. Click **"Create Key"**
5. Name it (e.g., "Spawnify Production")
6. **Copy the key immediately** (starts with `sk-ant-api03-...`)
7. Store it securely - you won't see it again!

## Step 2: Set Up Database Schema

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Open the file `chat-schema.sql`
4. Copy the entire contents
5. Paste into SQL Editor
6. Click **Run** or press `Cmd/Ctrl + Enter`
7. Verify tables were created:
   - `chat_conversations`
   - `chat_messages`

## Step 3: Configure Environment Variables

### Local Development (`.env.local`)

Add this line to your `.env.local` file:

```env
ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here
```

### Vercel Deployment

1. Go to your Vercel project dashboard
2. Navigate to **Settings → Environment Variables**
3. Click **Add New**
4. Name: `ANTHROPIC_API_KEY`
5. Value: Your API key from Step 1
6. Select environments: Production, Preview, Development
7. Click **Save**
8. **Redeploy** your application

## Step 4: Verify Installation

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Visit: nhttp://localhost:3000/dashboard/chat

3. You should see:
   - Chat interface with sidebar
   - "New Chat" button
   - Empty state with welcome message

4. Test sending a message:
   - Type: "How do I start growing mushrooms?"
   - Click Send or press Enter
   - You should receive an AI response

## Step 5: Test Features

### ✅ Create New Conversation
- Click "New Chat"
- Send a message
- Verify conversation appears in sidebar

### ✅ View Conversation History
- Click on a conversation in sidebar
- Verify messages load

### ✅ Delete Conversation
- Hover over conversation in sidebar
- Click trash icon
- Verify conversation is deleted

### ✅ Grow Log Context
- Create a grow log first
- Ask AI: "What should I do next with my current grow?"
- Verify AI references your grow log data

## Troubleshooting

### Error: "Invalid API key"
- ✅ Verify `ANTHROPIC_API_KEY` is set correctly
- ✅ Check key starts with `sk-ant-api03-`
- ✅ Ensure no extra spaces in `.env.local`
- ✅ Restart dev server after adding env var

### Error: "Rate limit exceeded"
- ✅ You've hit Claude API rate limits
- ✅ Wait a few minutes and try again
- ✅ Consider upgrading Anthropic plan

### Error: "Failed to create conversation"
- ✅ Verify database schema was run
- ✅ Check Supabase connection
- ✅ Verify RLS policies are correct

### No AI Response
- ✅ Check browser console for errors
- ✅ Check Vercel/terminal logs
- ✅ Verify API key is correct
- ✅ Check Anthropic API status

### Messages Not Saving
- ✅ Verify `chat_messages` table exists
- ✅ Check RLS policies allow INSERT
- ✅ Verify user is authenticated

## API Usage & Costs

### Claude 3.5 Sonnet Pricing (as of 2024)
- **Input**: ~$3 per 1M tokens
- **Output**: ~$15 per 1M tokens

### Typical Usage
- Average conversation: ~500-2000 tokens
- Cost per conversation: ~$0.01-0.05

### Monitoring Usage
1. Go to https://console.anthropic.com/
2. View usage dashboard
3. Set up billing alerts

## Security Best Practices

1. ✅ **Never commit API keys to Git**
   - `.env.local` should be in `.gitignore`
   - Use environment variables only

2. ✅ **Use server-side API routes only**
   - All Claude API calls happen server-side
   - Never expose API key in client code

3. ✅ **Implement rate limiting** (future enhancement)
   - Prevent abuse
   - Control costs

4. ✅ **Monitor usage**
   - Track API calls
   - Set up alerts for unusual activity

## Next Steps

1. ✅ Test all features locally
2. ✅ Deploy to Vercel
3. ✅ Add API key to Vercel env vars
4. ✅ Test in production
5. ✅ Monitor usage and costs
6. ✅ Gather user feedback

## Support

- **Anthropic Docs**: https://docs.anthropic.com/
- **API Status**: https://status.anthropic.com/
- **Supabase Docs**: https://supabase.com/docs

## Feature Checklist

- [x] Database schema created
- [x] API routes implemented
- [x] UI components built
- [x] Chat page created
- [x] Navigation link added
- [x] Grow log context integration
- [x] Error handling
- [x] Documentation complete

## Ready to Use! 🚀

Your AI Chat feature is now ready. Users can:
- Ask questions about mushroom cultivation
- Get personalized advice based on their grow logs
- Access tutorials and troubleshooting help
- Maintain conversation history

Enjoy your AI-powered grow assistant!

