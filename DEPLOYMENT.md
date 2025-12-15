# Deployment Guide - Spawnify MVP

## Quick Deployment Checklist

### ✅ Pre-Deployment (Completed)
- [x] All code committed to git
- [x] Build passes (`npm run build`)
- [x] TypeScript errors resolved
- [x] Environment variables documented

### 📋 Next Steps

#### 1. Create GitHub Repository

```bash
# If you haven't already, create a repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/spawnify-mvp.git
git branch -M main
git push -u origin main
```

#### 2. Set Up Supabase Production

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Name: `spawnify-production` (or your choice)
   - Set database password
   - Choose region closest to your users

2. **Run Database Schema**
   - Go to SQL Editor in Supabase Dashboard
   - Copy entire contents of `database-schema.sql`
   - Paste and click "Run"
   - Verify success (should see "Success. No rows returned")

3. **Create Storage Bucket**
   - Go to Storage in Supabase Dashboard
   - Click "New bucket"
   - Name: `grow-photos`
   - Public bucket: ✅ Yes
   - Click "Create bucket"
   - Storage policies are already in `database-schema.sql`

4. **Get Credentials**
   - Go to Project Settings → API
   - Copy:
     - Project URL
     - `anon` public key
     - `service_role` key (keep secret!)

#### 3. Deploy to Vercel

**Option A: Via Vercel Dashboard (Recommended)**

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./`
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)
5. **Add Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL` = [your-supabase-url]
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = [your-anon-key]
   - `SUPABASE_SERVICE_ROLE_KEY` = [your-service-role-key]
   - Select all environments: Production, Preview, Development
6. Click "Deploy"
7. Wait for build (~2-5 minutes)

**Option B: Via Vercel CLI**

```bash
npm i -g vercel
vercel login
vercel
# Follow prompts, then:
vercel --prod
```

#### 4. Configure Supabase Redirect URLs

After deployment:

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. **Site URL**: `https://your-app.vercel.app`
3. **Redirect URLs**: Add:
   - `https://your-app.vercel.app/**`
   - `http://localhost:3000/**` (for local dev)

#### 5. Create Admin User

1. Sign up via your deployed app: `https://your-app.vercel.app/signup`
2. Go to Supabase Dashboard → Authentication → Users
3. Find your user and copy the User ID (UUID)
4. Go to SQL Editor and run:
   ```sql
   INSERT INTO admin_users (user_id, role)
   VALUES ('your-user-uuid-here', 'admin');
   ```
5. Verify admin access: `https://your-app.vercel.app/admin/login`

#### 6. Post-Deployment Verification

**Smoke Tests:**
- [ ] Landing page loads
- [ ] Can sign up new user
- [ ] Can log in
- [ ] Dashboard displays correctly
- [ ] Can create grow log
- [ ] Can upload photos
- [ ] Can view/edit/delete logs
- [ ] Admin login works
- [ ] Admin dashboard loads
- [ ] CSV export works

**Check Logs:**
- Vercel Dashboard → Deployments → [Your Deployment] → Logs
- Look for any errors or warnings

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxxxx.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anonymous key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (secret) | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

### Where to Add

**Local Development**: `.env.local` file (not committed to git)

**Vercel**: Project Settings → Environment Variables

## Troubleshooting

### Build Fails
- Check build logs in Vercel Dashboard
- Verify all environment variables are set
- Run `npm run build` locally to catch errors early

### Database Connection Issues
- Verify Supabase URL is correct (no trailing slash)
- Check API keys are valid
- Ensure RLS policies don't block queries

### Photo Upload Fails
- Verify `grow-photos` bucket exists
- Check storage policies are set correctly
- Verify file size limits (10MB max)

### Admin Can't Login
- Verify admin user exists in `admin_users` table
- Check admin role is 'admin'
- Verify middleware checks admin correctly

### Authentication Redirect Issues
- Check redirect URLs in Supabase Dashboard
- Ensure Site URL matches your Vercel URL
- Verify redirect URLs include `/**` wildcard

## Rollback Procedure

If something goes wrong:

1. **Vercel Rollback**:
   - Go to Vercel Dashboard → Deployments
   - Find previous working deployment
   - Click "..." → "Promote to Production"

2. **Database Rollback**:
   - Export current database first (backup)
   - Restore from previous backup if needed
   - Re-run migration if schema changed

## Monitoring

### Vercel Analytics
- Built-in analytics available in Vercel Dashboard
- Monitor page views, performance, errors

### Supabase Dashboard
- Monitor database usage
- Check storage usage
- Review auth metrics
- Set up alerts for high usage

## Next Steps After Deployment

1. **Monitor for 24-48 hours**
   - Check error logs daily
   - Monitor performance
   - Track user signups

2. **Gather Feedback**
   - Set up feedback collection
   - Monitor user behavior
   - Identify improvements

3. **Plan Phase 2**
   - Review analytics
   - Prioritize features
   - Plan next iteration

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Next.js Docs**: https://nextjs.org/docs

## Success Criteria

- [x] Code committed to git
- [x] Build passes successfully
- [ ] Deployed to Vercel
- [ ] Supabase production database configured
- [ ] Environment variables set
- [ ] Admin user created
- [ ] All features working in production
- [ ] Monitoring active

---

**Ready to deploy?** Follow the steps above and you'll be live in ~15 minutes! 🚀
