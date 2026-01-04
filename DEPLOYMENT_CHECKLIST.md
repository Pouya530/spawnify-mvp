# Spawnify AI Chat Deployment Checklist

## Pre-Deployment Checklist

### ✅ Database Setup
- [ ] Run `scripts/create-chat-tables.sql` in Supabase SQL Editor
- [ ] Verify `chat_conversations` table exists
- [ ] Verify `chat_messages` table exists
- [ ] Verify RLS policies are enabled
- [ ] Test database connection: `npm run verify-setup`

### ✅ Environment Variables
- [ ] `ANTHROPIC_API_KEY` set in `.env.local` (local development)
- [ ] `ANTHROPIC_API_KEY` set in Vercel (all environments)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` set in Vercel
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` set in Vercel
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set in Vercel (if needed)

### ✅ API Key Verification
- [ ] API key format is correct (starts with `sk-ant-api03-`)
- [ ] API key length is ~219 characters
- [ ] API key is active in Anthropic Console
- [ ] Test API key: `./test-api-key.sh`

### ✅ Code Verification
- [ ] All agent files exist in `.cursor/agents/`
- [ ] Scripts are executable (`chmod +x scripts/*.sh`)
- [ ] Build succeeds: `npm run build`
- [ ] No TypeScript errors
- [ ] No linting errors

## Deployment Steps

### Step 1: Verify Setup
```bash
npm run verify-setup
```

**Expected Output:**
- ✅ All tables exist
- ✅ Environment variables set
- ✅ API key format valid

### Step 2: Build Project
```bash
npm run build
```

**Expected Output:**
- ✅ Build completes successfully
- ✅ No errors or warnings

### Step 3: Deploy
```bash
npm run deploy-chat
```

**Or manually:**
```bash
git add .
git commit -m "Deploy: AI Chat system"
git push origin main
vercel --prod --yes
```

### Step 4: Test Deployment
```bash
npm run test-chat
```

**Expected Output:**
- ✅ API key exists
- ✅ Chat tables exist
- ✅ Chat page accessible
- ✅ API endpoint responds

## Post-Deployment Verification

### ✅ Functionality Tests
- [ ] Visit: `https://spawnify-mvp-gyf2.vercel.app/dashboard/chat`
- [ ] Log in to account
- [ ] Send test message: "hello"
- [ ] Receive AI response
- [ ] Verify conversation is saved
- [ ] Check message history loads

### ✅ Error Handling
- [ ] Test with invalid API key (should show error)
- [ ] Test with missing tables (should show setup message)
- [ ] Test with network error (should handle gracefully)

### ✅ Performance
- [ ] Response time < 5 seconds
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Works in different browsers

## Troubleshooting

### Issue: API Key Not Working
**Symptoms:**
- Error: "AI service is not configured"
- Test endpoint shows `hasAnthropicKey: false`

**Solutions:**
1. Check Vercel environment variables
2. Verify API key format
3. Ensure key is set for all environments
4. Redeploy after adding key

### Issue: Database Tables Missing
**Symptoms:**
- Error: "Table does not exist"
- Test shows tables missing

**Solutions:**
1. Run `scripts/create-chat-tables.sql` in Supabase
2. Verify tables in Supabase Table Editor
3. Check RLS policies are enabled
4. Test with `npm run verify-setup`

### Issue: Build Fails
**Symptoms:**
- TypeScript errors
- Build errors

**Solutions:**
1. Fix TypeScript errors
2. Check imports are correct
3. Verify all dependencies installed
4. Run `npm install`

### Issue: Deployment Fails
**Symptoms:**
- Vercel build fails
- Deployment errors

**Solutions:**
1. Check build logs in Vercel
2. Verify environment variables
3. Check for missing dependencies
4. Review error messages

## Monitoring

### Key Metrics to Monitor
- API response times
- Error rates
- User engagement
- Conversation quality
- API usage/costs

### Logs to Check
- Vercel function logs: `vercel logs <deployment-url>`
- Supabase logs: Supabase Dashboard → Logs
- Anthropic usage: Anthropic Console → Usage

## Rollback Plan

If deployment fails:
1. Check previous deployment in Vercel
2. Revert to last working commit
3. Fix issues locally
4. Redeploy after fixes

## Support Resources

- **Documentation**: `AGENT_TRAINING_GUIDE.md`
- **Setup Script**: `scripts/verify-setup.ts`
- **Test Script**: `scripts/test-ai-chat.sh`
- **SQL Script**: `scripts/create-chat-tables.sql`

## Quick Reference

### Essential Commands
```bash
# Verify setup
npm run verify-setup

# Deploy
npm run deploy-chat

# Test
npm run test-chat

# Check database
npm run check-db
```

### Important URLs
- **Chat Page**: `https://spawnify-mvp-gyf2.vercel.app/dashboard/chat`
- **Test Endpoint**: `https://spawnify-mvp-gyf2.vercel.app/api/test-env`
- **Vercel Dashboard**: `https://vercel.com/pynos-projects/spawnify-mvp-gyf2`
- **Supabase Dashboard**: `https://supabase.com/dashboard/project/oxdknvkltvigixofxpab`

## Success Criteria

✅ **Deployment is successful when:**
1. All checks pass (`npm run verify-setup`)
2. Build succeeds (`npm run build`)
3. Deployment completes (`vercel --prod`)
4. Tests pass (`npm run test-chat`)
5. Chat works in production (manual test)
6. No errors in logs
7. API responses are timely (< 5 seconds)

## Next Steps After Deployment

1. **Monitor**: Watch logs for first 24 hours
2. **Test**: Have users test the chat feature
3. **Gather Feedback**: Collect user feedback
4. **Iterate**: Improve based on usage patterns
5. **Optimize**: Fine-tune agent responses


