# Add API Key to Vercel - Exact Steps

## Your API Key:

Get it from your `.env.local` file or Anthropic Console.

## Step-by-Step Instructions:

### 1. Open Vercel Dashboard
- Go to: **https://vercel.com/dashboard**
- Sign in if needed

### 2. Select Your Project
- Click on: **spawnify-mvp** (or your project name)

### 3. Navigate to Settings
- Click **Settings** in the top menu bar

### 4. Go to Environment Variables
- In the left sidebar, click **Environment Variables**

### 5. Add New Variable
- Click the **"Add New"** button (usually top-right)

### 6. Fill in the Form
**Name** (exactly as shown):
```
ANTHROPIC_API_KEY
```

**Value**: Get from your `.env.local` file (starts with `sk-ant-api03-...`)

**Environments** (check ALL three):
- ☑ **Production**
- ☑ **Preview**
- ☑ **Development**

### 7. Save
- Click **"Save"** button
- You should see the variable appear in the list

### 8. REDEPLOY (CRITICAL!)
⚠️ **This is REQUIRED** - Variables only work after redeployment!

1. Click **"Deployments"** tab (top menu)
2. Find the **latest deployment** (top of the list)
3. Click the **three dots** (⋯) on the right side
4. Click **"Redeploy"**
5. Confirm if prompted
6. **Wait 2-3 minutes** for deployment to complete

### 9. Verify Deployment
- Check that the latest deployment shows **"Ready"** status
- Should have a green checkmark ✅

### 10. Test
- Visit: `https://spawnify-mvp-gyf2.vercel.app/dashboard/chat`
- Send a message: "Hello"
- Should receive AI response ✅

## Quick Copy-Paste Reference:

**Variable Name:**
```
ANTHROPIC_API_KEY
```

**Variable Value**: Get from your `.env.local` file or Anthropic Console

## Troubleshooting:

### If you see "Variable already exists"
- Click on the existing variable
- Update the value
- Make sure all environments are checked
- Save and redeploy

### If deployment fails
- Check the deployment logs
- Verify the API key is correct (no extra spaces)
- Try redeploying again

### If still getting "AI service is not configured"
1. Verify variable name is exactly: `ANTHROPIC_API_KEY`
2. Check all environments are selected
3. Confirm you redeployed AFTER adding the variable
4. Wait a few minutes and try again (sometimes takes time to propagate)

## Success Indicators:

✅ Variable appears in Environment Variables list
✅ Latest deployment completed successfully
✅ Chat page loads without errors
✅ Can send messages and get AI responses

Good luck! 🚀

