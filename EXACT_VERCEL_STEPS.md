# 🔴 EXACT Steps to Add API Key to Vercel

The debug endpoint confirms: **API key is NOT set in Vercel**. Follow these exact steps:

## Your API Key:

Get it from your `.env.local` file (starts with `sk-ant-api03-...`)

## Step-by-Step (Follow Exactly):

### 1. Open Vercel Dashboard
- Go to: **https://vercel.com/dashboard**
- Sign in if needed
- Click on project: **spawnify-mvp**

### 2. Navigate to Environment Variables
- Click **"Settings"** (top menu bar, next to "Deployments")
- In left sidebar, click **"Environment Variables"**
- You should see a list of variables (or empty if none)

### 3. Add the Variable
- Click the **"Add New"** button (usually top-right, blue button)
- A form will appear

### 4. Fill in the Form EXACTLY:

**Key** (variable name):
```
ANTHROPIC_API_KEY
```
⚠️ Must be EXACTLY this - case-sensitive, no spaces

**Value**: 
Get from your `.env.local` file - copy the ENTIRE key (starts with `sk-ant-api03-...`)
⚠️ No spaces before/after the key

**Environment** (check ALL THREE):
- ☑ **Production** (must check this!)
- ☑ **Preview** (must check this!)
- ☑ **Development** (must check this!)

### 5. Save
- Click **"Save"** button
- You should see the variable appear in the list

### 6. Verify It's There
- Look at the list - you should see:
  - Name: `ANTHROPIC_API_KEY`
  - Environments: Production, Preview, Development
  - Value: (hidden, but should be there)

### 7. REDEPLOY (CRITICAL!)
⚠️ **THIS IS REQUIRED** - Variables don't work until you redeploy!

**Method 1: From Deployments Tab**
1. Click **"Deployments"** tab (top menu)
2. Find the **latest deployment** (top of list)
3. Click the **three dots** (⋯) on the right
4. Click **"Redeploy"**
5. Click **"Redeploy"** again to confirm
6. Wait 2-3 minutes

**Method 2: From Environment Variables Page**
- After saving the variable, Vercel may show a banner saying "Redeploy to apply changes"
- Click that button if it appears

### 8. Wait for Deployment
- Watch the deployment status
- Should go: Building → Ready ✅
- Takes 2-3 minutes

### 9. Test
After deployment shows "Ready":
1. Visit: `https://spawnify-mvp-gyf2.vercel.app/api/chat/test`
2. Should show: `"exists": true` ✅
3. Then test chat: `https://spawnify-mvp-gyf2.vercel.app/dashboard/chat`

## Common Mistakes to Avoid:

❌ **Wrong variable name**: Must be `ANTHROPIC_API_KEY` (not `ANTHROPIC_API_KEY ` with space, not lowercase)
❌ **Not checking Production**: Must check Production environment
❌ **Forgetting to redeploy**: Variables only work after redeployment
❌ **Extra spaces**: No spaces before/after the key value
❌ **Testing old deployment**: Make sure you're testing the NEW deployment

## Verification Checklist:

Before testing, verify:
- [ ] Variable exists in Vercel Environment Variables list
- [ ] Name is exactly: `ANTHROPIC_API_KEY` (no typos)
- [ ] Value is correct (starts with `sk-ant-api03-`)
- [ ] Production environment is checked ✅
- [ ] Preview environment is checked ✅
- [ ] Development environment is checked ✅
- [ ] Variable is saved
- [ ] Application is redeployed
- [ ] Latest deployment shows "Ready" ✅

## Still Not Working?

If after all steps you still see `"exists": false`:

1. **Double-check the variable name**: Copy-paste `ANTHROPIC_API_KEY` exactly
2. **Delete and re-add**: Sometimes helps
   - Delete the variable
   - Add it again
   - Redeploy
3. **Check Vercel logs**: 
   - Deployments → Latest → Functions → `/api/chat/test`
   - Look for any errors
4. **Try a different browser**: Sometimes caching issues
5. **Wait 5 minutes**: Sometimes takes time to propagate

## Quick Test:

After completing all steps, the debug endpoint should show:
```json
{
  "status": "configured",
  "keyStatus": {
    "exists": true,
    "length": 123,
    "startsWith": "sk-ant-api03-...",
    "isValidFormat": true
  }
}
```

If you see this, you're all set! 🎉

