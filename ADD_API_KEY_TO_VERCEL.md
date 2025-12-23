# 🔴 URGENT: Add API Key to Vercel

You're seeing "AI service is not configured" because the API key is **only set locally**, not on Vercel (production).

## Quick Fix - Follow These Steps:

### Step 1: Go to Vercel Dashboard
1. Visit: **https://vercel.com/dashboard**
2. Click on your project: **spawnify-mvp**

### Step 2: Add Environment Variable
1. Click **Settings** (top menu bar)
2. Click **Environment Variables** (left sidebar)
3. Click **Add New** button

### Step 3: Enter Your API Key
Fill in the form:
- **Name**: `ANTHROPIC_API_KEY` (exactly this, case-sensitive)
- **Value**: `your-anthropic-api-key-here` (get from your `.env.local` file or Anthropic Console)
- **Environments**: Check ALL THREE boxes:
  - ☑ Production
  - ☑ Preview
  - ☑ Development

### Step 4: Save
- Click **Save** button
- You should see the variable appear in the list

### Step 5: REDEPLOY (CRITICAL!)
⚠️ **This step is REQUIRED** - Environment variables only take effect after redeployment!

1. Go to **Deployments** tab (top menu)
2. Find the **latest deployment**
3. Click the **three dots** (⋯) on the right
4. Click **Redeploy**
5. Wait 2-3 minutes for deployment to complete

### Step 6: Test
After redeployment completes:
1. Visit: `https://spawnify-mvp-gyf2.vercel.app/dashboard/chat`
2. Send a test message: "Hello"
3. You should receive an AI response ✅

## Common Mistakes:

❌ **Adding the variable but forgetting to redeploy**
- Environment variables only work after redeployment

❌ **Wrong variable name**
- Must be exactly: `ANTHROPIC_API_KEY` (case-sensitive)

❌ **Not selecting all environments**
- Make sure Production, Preview, and Development are all checked

❌ **Extra spaces in the value**
- Copy the key exactly, no spaces before/after

## Still Not Working?

1. **Double-check the variable name**: Should be `ANTHROPIC_API_KEY`
2. **Verify redeployment completed**: Check Deployments tab for success status
3. **Check Vercel logs**: Go to Deployments → Latest → Functions → `/api/chat` → Check logs
4. **Try again**: Sometimes it takes a minute for environment variables to propagate

## Where to Find Your API Key:

1. **From your local `.env.local` file** (if you have it set up locally)
2. **From Anthropic Console**: https://console.anthropic.com/ → Settings → API Keys

**Remember**: Never commit API keys to git or share them publicly!

