# 🔴 URGENT: API Key Not Detected in Vercel

The debug endpoint shows: `"exists": false` - This means the API key is **NOT set in Vercel** or wasn't set correctly.

## Your API Key:

Get it from your `.env.local` file (it starts with `sk-ant-api03-...`)

## Fix Steps (Do This Now):

### 1. Go to Vercel Dashboard
- Visit: **https://vercel.com/dashboard**
- Click on **spawnify-mvp** project

### 2. Check if Variable Exists
- Click **Settings** → **Environment Variables**
- Look for `ANTHROPIC_API_KEY` in the list
- **If it exists**: Click on it and verify the value is correct
- **If it doesn't exist**: Continue to step 3

### 3. Add/Update the Variable
- Click **"Add New"** (or edit existing)
- **Name**: `ANTHROPIC_API_KEY` (exactly this, case-sensitive)
- **Value**: Paste the key above (full key, no spaces)
- **Environments**: Check ALL THREE:
  - ☑ Production
  - ☑ Preview
  - ☑ Development
- Click **Save**

### 4. CRITICAL: Redeploy
⚠️ **MUST DO THIS** - Variables don't work until you redeploy!

1. Go to **Deployments** tab
2. Click **three dots** (⋯) on latest deployment
3. Click **Redeploy**
4. Wait 2-3 minutes for completion

### 5. Test Again
After redeployment:
1. Visit: `https://spawnify-mvp-gyf2.vercel.app/api/chat/test`
2. Should show: `"exists": true` ✅
3. Then test chat: `https://spawnify-mvp-gyf2.vercel.app/dashboard/chat`

## Common Mistakes:

❌ **Variable name wrong**: Must be exactly `ANTHROPIC_API_KEY`
❌ **Not redeploying**: Variables only work after redeployment
❌ **Wrong environment**: Must check Production, Preview, AND Development
❌ **Extra spaces**: Copy key exactly, no spaces before/after
❌ **Old deployment**: Make sure you're testing the NEW deployment

## Verification Checklist:

- [ ] Variable exists in Vercel Environment Variables list
- [ ] Name is exactly: `ANTHROPIC_API_KEY`
- [ ] Value is correct (starts with `sk-ant-api03-`)
- [ ] All 3 environments checked
- [ ] Saved successfully
- [ ] Redeployed after adding/updating
- [ ] New deployment completed successfully
- [ ] Debug endpoint shows `"exists": true`

## Still Not Working?

If after all steps you still see `"exists": false`:

1. **Delete and re-add** the variable:
   - Delete `ANTHROPIC_API_KEY` from Vercel
   - Add it again with exact same name
   - Redeploy

2. **Check Vercel logs**:
   - Deployments → Latest → Functions → `/api/chat/test`
   - Look for any error messages

3. **Verify key format**:
   - Should start with `sk-ant-api03-`
   - Should be about 123 characters long
   - No extra spaces or line breaks

## Quick Test:

After redeployment, visit:
```
https://spawnify-mvp-gyf2.vercel.app/api/chat/test
```

**Should show:**
```json
{
  "status": "configured",
  "keyStatus": {
    "exists": true,
    "isValidFormat": true
  }
}
```

If you see this, the chat will work! 🎉

