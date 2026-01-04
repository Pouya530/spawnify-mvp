# How to Redeploy on Vercel

## Option 1: Redeploy from Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Click on your **spawnify-mvp** project

2. **Go to Deployments Tab**
   - Click **"Deployments"** in the top menu

3. **Redeploy Latest**
   - Find the **latest deployment** (top of the list)
   - Click the **three dots** (⋯) on the right side
   - Click **"Redeploy"**
   - Confirm if prompted

4. **Wait for Completion**
   - Deployment takes 2-3 minutes
   - Watch for "Ready" status with green checkmark ✅

5. **Test**
   - Visit: `https://spawnify-mvp-gyf2.vercel.app/api/chat/test`
   - Should show: `"exists": true` ✅

## Option 2: Trigger Deployment via Git Push

If you want to trigger a new deployment by pushing code:

```bash
# Make a small change (like updating a comment)
# Then commit and push:
git commit --allow-empty -m "Trigger redeployment"
git push
```

This will trigger a new deployment automatically.

## Option 3: Use Vercel CLI

If you have Vercel CLI installed:

```bash
vercel --prod
```

## Important Notes:

⚠️ **Environment variables only take effect after redeployment**
- If you just added `ANTHROPIC_API_KEY`, you MUST redeploy
- Old deployments don't have the new environment variable

✅ **After redeployment:**
- Wait 2-3 minutes for completion
- Test the debug endpoint: `/api/chat/test`
- Should show `"exists": true`
- Then test chat: `/dashboard/chat`

## Quick Check:

After redeployment, verify:
1. Latest deployment shows "Ready" ✅
2. Debug endpoint shows key exists
3. Chat works without errors


