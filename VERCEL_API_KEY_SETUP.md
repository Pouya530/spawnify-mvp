# Vercel API Key Setup - Quick Guide

## ✅ Local Setup Complete
Your API key has been added to `.env.local` for local development.

## 🔴 IMPORTANT: Add to Vercel (Required for Production)

Your API key is currently only set up locally. To make it work on your live site (`spawnify-mvp-gyf2.vercel.app`), you MUST add it to Vercel:

### Steps:

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Click on your `spawnify-mvp` project

2. **Navigate to Environment Variables**
   - Click **Settings** (top menu)
   - Click **Environment Variables** (left sidebar)

3. **Add New Variable**
   - Click **Add New** button
   - **Name**: `ANTHROPIC_API_KEY`
   - **Value**: `your-anthropic-api-key-here` (get from Anthropic Console at https://console.anthropic.com/)
   - **Environments**: Select all three:
     - ☑ Production
     - ☑ Preview  
     - ☑ Development
   - Click **Save**

4. **Redeploy Application** ⚠️ CRITICAL STEP
   - Go to **Deployments** tab
   - Click the **three dots** (⋯) on the latest deployment
   - Click **Redeploy**
   - Wait for deployment to complete (2-3 minutes)

## ✅ Verify It's Working

After redeployment:

1. Visit: https://spawnify-mvp-gyf2.vercel.app/dashboard/chat
2. Send a test message: "Hello"
3. You should receive an AI response

If you see "AI service is not configured", the API key wasn't added correctly or you need to redeploy.

## 🔒 Security Notes

- ✅ `.env.local` is in `.gitignore` - your key won't be committed
- ✅ Never share your API key publicly
- ✅ If key is exposed, regenerate it at https://console.anthropic.com/

## 🧪 Test Locally

To test locally first:

```bash
npm run dev
```

Then visit: http://localhost:3000/dashboard/chat

Send a test message to verify it works locally before deploying to Vercel.

