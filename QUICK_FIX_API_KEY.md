# Quick Fix: Invalid API Key Error

## Problem
Getting error: "Invalid API key. Please check ANTHROPIC_API_KEY environment variable"

## Solution: Update API Key in Vercel

### Step 1: Get Your API Key
```bash
cat .env.local | grep ANTHROPIC_API_KEY | cut -d= -f2
```

Copy the output (your API key).

### Step 2: Update Vercel

**Option A: Via Dashboard (Easiest)**
1. Go to: https://vercel.com/pynos-projects/spawnify-mvp-gyf2/settings/environment-variables
2. Find `ANTHROPIC_API_KEY`
3. Click "Edit" or "Remove" then "Add New"
4. Paste your API key from Step 1
5. **CRITICAL**: Select ALL environments:
   - ✅ Production
   - ✅ Preview  
   - ✅ Development
6. Click "Save"
7. Go to Deployments → Click "..." on latest → "Redeploy"

**Option B: Via CLI**
```bash
# Get your API key
API_KEY=$(cat .env.local | grep ANTHROPIC_API_KEY | cut -d= -f2)

# Add to all environments
echo "$API_KEY" | vercel env add ANTHROPIC_API_KEY production
echo "$API_KEY" | vercel env add ANTHROPIC_API_KEY preview
echo "$API_KEY" | vercel env add ANTHROPIC_API_KEY development

# Redeploy
vercel --prod --yes
```

### Step 3: Verify

Wait 2-3 minutes for redeploy, then:

```bash
curl https://spawnify-mvp-gyf2.vercel.app/api/test-env | jq '.hasAnthropicKey'
```

Should return: `true`

### Step 4: Test Chat

1. Visit: https://spawnify-mvp-gyf2.vercel.app/dashboard/chat
2. Send: "hello"
3. Should work now! ✅

## Why This Happened

- Your local `.env.local` has the correct API key ✅
- Vercel still has the old/invalid API key ❌
- The error occurs when Vercel tries to use the old key

## Current Status

- ✅ Local API key: Working (tested)
- ✅ Code: Updated to use `claude-3-haiku-20240307`
- ⚠️ Vercel API key: Needs update

After updating Vercel, everything will work!


