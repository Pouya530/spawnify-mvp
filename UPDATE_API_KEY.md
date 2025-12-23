# API Key Update Guide

## ✅ Local Environment Updated

Your `.env.local` file has been updated with the new API key:
- **Key Prefix**: `sk-ant-api03-TC`
- **Status**: ✅ Verified working with `claude-3-haiku-20240307`

## 🔧 Changes Made

### Code Updates
1. ✅ Updated model to `claude-3-haiku-20240307` (verified working)
2. ✅ Updated test scripts to use correct model
3. ✅ Updated verification scripts
4. ✅ Removed hardcoded old API key from `add-api-key.sh`
5. ✅ Updated documentation references

### Files Updated
- `app/api/chat/route.ts` - Model changed to `claude-3-haiku-20240307`
- `app/api/test-env/route.ts` - Model updated
- `test-api-key.sh` - Model updated
- `verify-api-key.sh` - Model updated
- `add-api-key.sh` - Now reads from `.env.local` instead of hardcoded
- `AI_ASSISTANT_STATUS.md` - Removed old key reference

## ⚠️ IMPORTANT: Update Vercel

Your **Vercel production environment** still has the old API key. You need to update it:

### Option 1: Via Vercel Dashboard (Recommended)

1. Go to: https://vercel.com/pynos-projects/spawnify-mvp-gyf2/settings/environment-variables
2. Find `ANTHROPIC_API_KEY`
3. Click "Edit"
4. Paste your new API key from `.env.local`:
   ```
   # Get it with: cat .env.local | grep ANTHROPIC_API_KEY | cut -d= -f2
   # Or copy from your .env.local file
   ```
5. **IMPORTANT**: Select ALL environments:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
6. Click "Save"
7. Go to Deployments → Click "..." on latest → "Redeploy"

### Option 2: Via Vercel CLI

```bash
# Read API key from .env.local
API_KEY=$(cat .env.local | grep ANTHROPIC_API_KEY | cut -d= -f2)

# Add to Production
echo "$API_KEY" | vercel env add ANTHROPIC_API_KEY production

# Add to Preview
echo "$API_KEY" | vercel env add ANTHROPIC_API_KEY preview

# Add to Development
echo "$API_KEY" | vercel env add ANTHROPIC_API_KEY development

# Redeploy
vercel --prod --yes
```

### Option 3: Use Updated Script

```bash
# The script now reads from .env.local automatically
./add-api-key.sh
```

## ✅ Verification

After updating Vercel, verify it works:

### 1. Check Environment Variable
```bash
curl https://spawnify-mvp-gyf2.vercel.app/api/test-env | jq '.'
```

**Expected:**
```json
{
  "hasAnthropicKey": true,
  "keyPrefix": "sk-ant-api03-TC",
  "keyLength": 108,
  "apiTest": {
    "works": true
  }
}
```

### 2. Test Chat
1. Visit: https://spawnify-mvp-gyf2.vercel.app/dashboard/chat
2. Log in
3. Send: "hello"
4. Should receive AI response

### 3. Check Logs
```bash
vercel logs <deployment-url> | grep "API Key"
```

Should show: `🔑 API Key exists: true Prefix: sk-ant-api03-TC`

## 📝 Model Information

**Current Model**: `claude-3-haiku-20240307`

**Why This Model:**
- ✅ Verified working with your API key
- ✅ Fastest response times
- ✅ Most cost-effective
- ✅ Good for general queries

**Note**: Your API key may not have access to Sonnet or Opus models. Haiku is perfect for most use cases and is the most reliable option.

## 🎯 Next Steps

1. ✅ Local environment updated
2. ⚠️ **Update Vercel API key** (see above)
3. ✅ Code updated and committed
4. ⏳ Wait for Vercel redeploy (2-3 minutes)
5. ✅ Test chat functionality

## 🐛 Troubleshooting

### If chat still doesn't work after updating Vercel:

1. **Check API key in Vercel:**
   ```bash
   curl https://spawnify-mvp-gyf2.vercel.app/api/test-env
   ```
   Should show `hasAnthropicKey: true` with correct prefix

2. **Check deployment logs:**
   - Go to Vercel Dashboard → Deployments → Latest
   - Check Function logs for `/api/chat`
   - Look for: `🔑 API Key exists: true`

3. **Verify model:**
   - Check logs show: `model: claude-3-haiku-20240307`
   - Should not show 404 errors

4. **Test locally:**
   ```bash
   npm run dev
   # Visit http://localhost:3000/dashboard/chat
   ```

## ✅ Summary

- ✅ Local `.env.local` updated
- ✅ Code updated to use `claude-3-haiku-20240307`
- ✅ All scripts updated
- ✅ Changes committed and pushed
- ⚠️ **ACTION REQUIRED**: Update API key in Vercel Dashboard

After updating Vercel, your chat system will be fully functional! 🎉

