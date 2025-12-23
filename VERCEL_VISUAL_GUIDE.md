# 🔴 CRITICAL: API Key Still Missing in Vercel

## Current Status:
The debug endpoint shows `ANTHROPIC_API_KEY` is **NOT** in your Vercel environment variables.

**Evidence:**
- ✅ `SUPABASE_SERVICE_ROLE_KEY` exists
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` exists  
- ❌ `ANTHROPIC_API_KEY` is MISSING

## Your API Key:
```
[YOUR_API_KEY_HERE]
```
⚠️ **Get your API key from**: https://console.anthropic.com/settings/keys

## EXACT Steps to Fix (Follow Carefully):

### Step 1: Open Vercel Dashboard
1. Go to: **https://vercel.com/dashboard**
2. Sign in
3. Click on project: **spawnify-mvp**

### Step 2: Go to Environment Variables
1. Click **"Settings"** tab (top menu bar)
2. In left sidebar, click **"Environment Variables"**
3. You should see a list - look for `SUPABASE_SERVICE_ROLE_KEY` (you have this)
4. You should NOT see `ANTHROPIC_API_KEY` (this is missing)

### Step 3: Add the Missing Variable
1. Click the **"Add New"** button (usually blue, top-right)
2. A form will appear with 3 fields

### Step 4: Fill in the Form

**Field 1: Key**
- Type exactly: `ANTHROPIC_API_KEY`
- ⚠️ Case-sensitive, no spaces

**Field 2: Value**  
- Paste your API key from Anthropic Console
- ⚠️ Should start with `sk-ant-api03-`
- ⚠️ No spaces before or after

**Field 3: Environment**
- Check ALL THREE boxes:
  - ☑ **Production** (MUST CHECK!)
  - ☑ **Preview**
  - ☑ **Development**

### Step 5: Save
- Click **"Save"** button
- Variable should appear in the list

### Step 6: Verify It's There
- Look at the environment variables list
- You should now see:
  - `SUPABASE_SERVICE_ROLE_KEY` ✅
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✅
  - `ANTHROPIC_API_KEY` ✅ (NEW!)

### Step 7: REDEPLOY (MANDATORY!)
⚠️ **CRITICAL** - Variables don't work until you redeploy!

**Option A: From Deployments Tab**
1. Click **"Deployments"** tab (top menu)
2. Find **latest deployment** (top of list)
3. Click **three dots** (⋯) on the right
4. Click **"Redeploy"**
5. Click **"Redeploy"** again to confirm
6. Wait 2-3 minutes

**Option B: From Environment Variables Page**
- After saving, Vercel may show a banner: "Redeploy to apply changes"
- Click that button if it appears

### Step 8: Wait for Deployment
- Watch the deployment status
- Should show: "Building" → "Ready" ✅
- Takes 2-3 minutes

### Step 9: Test Again
After deployment shows "Ready":
1. Visit: `https://spawnify-mvp-gyf2.vercel.app/api/chat/debug`
2. Look for `ANTHROPIC_API_KEY` in the `allRelevantEnvVars` object
3. Should show: `"apiKeyStatus": {"exists": true}` ✅

## What Success Looks Like:

After adding and redeploying, the debug endpoint should show:

```json
{
  "apiKeyStatus": {
    "exists": true,
    "length": 123,
    "startsWith": "sk-ant-api03-...",
    "isValidFormat": true
  },
  "allRelevantEnvVars": {
    "ANTHROPIC_API_KEY": {
      "exists": true,
      "startsWith": "sk-ant-api03-..."
    },
    "SUPABASE_SERVICE_ROLE_KEY": {...},
    ...
  }
}
```

## Common Mistakes:

❌ **Typo in variable name**: Must be exactly `ANTHROPIC_API_KEY`
❌ **Forgot to check Production**: Must check Production environment
❌ **Didn't redeploy**: Variables only work after redeployment
❌ **Extra spaces**: No spaces in the key value
❌ **Testing old deployment**: Make sure you're testing the NEW deployment

## Still Not Working?

If after all steps you still don't see `ANTHROPIC_API_KEY` in the debug output:

1. **Double-check Vercel**:
   - Go back to Settings → Environment Variables
   - Verify `ANTHROPIC_API_KEY` is in the list
   - Click on it to verify the value is correct
   - Make sure Production is checked

2. **Delete and Re-add**:
   - Delete `ANTHROPIC_API_KEY` from Vercel
   - Add it again with exact same name
   - Check all environments
   - Redeploy

3. **Check Vercel Logs**:
   - Deployments → Latest → Functions → `/api/chat/debug`
   - Look for any error messages

## The Bottom Line:

The variable `ANTHROPIC_API_KEY` needs to be **manually added** to Vercel's Environment Variables. I can't do this for you - you need to:

1. ✅ Add it in Vercel Dashboard
2. ✅ Make sure Production is checked
3. ✅ Save it
4. ✅ Redeploy
5. ✅ Test again

Once you see `"exists": true` in the debug endpoint, the chat will work! 🚀

