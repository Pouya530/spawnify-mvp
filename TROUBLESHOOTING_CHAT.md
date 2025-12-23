# Troubleshooting Chat API Key Issue

## Debug Steps

### Step 1: Test the Debug Endpoint

After deploying, visit this URL to check if the API key is being read:

**Production:**
```
https://spawnify-mvp-gyf2.vercel.app/api/chat/test
```

**Local:**
```
http://localhost:3000/api/chat/test
```

**Expected Response (if key is set):**
```json
{
  "status": "configured",
  "keyStatus": {
    "exists": true,
    "length": 123,
    "startsWith": "sk-ant-api03-...",
    "isValidFormat": true
  },
  "environment": "production"
}
```

**Expected Response (if key is missing):**
```json
{
  "status": "missing",
  "keyStatus": {
    "exists": false,
    "message": "ANTHROPIC_API_KEY is not set"
  }
}
```

### Step 2: Check Vercel Environment Variables

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Settings → Environment Variables
4. Verify:
   - ✅ `ANTHROPIC_API_KEY` exists in the list
   - ✅ Value is correct (starts with `sk-ant-api03-`)
   - ✅ All environments are checked (Production, Preview, Development)

### Step 3: Check Vercel Function Logs

1. Go to: Vercel Dashboard → Deployments → Latest
2. Click **Functions** tab
3. Click on `/api/chat`
4. Check logs for:
   - `ANTHROPIC_API_KEY is not set` = Key not found
   - `Failed to initialize Anthropic client` = Key format issue
   - No errors = Should be working

### Step 4: Verify Deployment

1. Check latest deployment status
2. Should show **"Ready"** with green checkmark
3. Should be deployed AFTER you added the environment variable

## Common Issues & Fixes

### Issue 1: Key Not Found
**Symptoms:** Debug endpoint shows `"exists": false`

**Fixes:**
- Verify key is added in Vercel Settings → Environment Variables
- Check variable name is exactly: `ANTHROPIC_API_KEY` (case-sensitive)
- Make sure all environments are selected
- Redeploy after adding the variable

### Issue 2: Key Format Invalid
**Symptoms:** Debug endpoint shows `"isValidFormat": false`

**Fixes:**
- Verify key starts with `sk-ant-api03-`
- Check for extra spaces before/after the key
- Regenerate key at https://console.anthropic.com/ if needed

### Issue 3: Key Not Propagating
**Symptoms:** Key exists in Vercel but debug shows missing

**Fixes:**
- Wait 1-2 minutes after adding (sometimes takes time)
- Redeploy the application
- Check if you're testing the right environment (Production vs Preview)

### Issue 4: Still Getting Error After Fixes
**Symptoms:** Everything looks correct but still getting error

**Fixes:**
1. Double-check the debug endpoint: `/api/chat/test`
2. Check Vercel function logs for specific error messages
3. Try removing and re-adding the environment variable
4. Create a new deployment (not just redeploy)

## Your API Key:

Get it from:
- Your local `.env.local` file
- Anthropic Console: https://console.anthropic.com/ → Settings → API Keys

## Quick Verification Checklist

- [ ] API key added to Vercel Environment Variables
- [ ] Variable name is exactly: `ANTHROPIC_API_KEY`
- [ ] All environments selected (Production, Preview, Development)
- [ ] Application redeployed after adding variable
- [ ] Debug endpoint (`/api/chat/test`) shows key exists
- [ ] Latest deployment shows "Ready" status
- [ ] Chat page loads without errors
- [ ] Can send messages and get responses

## Next Steps

1. **Test the debug endpoint** first to see what's happening
2. **Check Vercel logs** for specific error messages
3. **Share the debug endpoint response** if you need more help

The debug endpoint will tell us exactly what's wrong!

