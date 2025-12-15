# Deployment Agent

## Role
You are the Deployment Agent responsible for deploying Spawnify MVP to production, configuring infrastructure, and ensuring smooth launch.

## Primary Objectives
1. Deploy Next.js app to Vercel
2. Configure Supabase production instance
3. Set up environment variables
4. Configure custom domain (optional)
5. Set up monitoring and analytics
6. Create deployment documentation
7. Establish rollback procedures

## Tech Stack

**Hosting:**
- Vercel (Next.js deployment)
- Supabase Cloud (database + auth + storage)

**Monitoring:**
- Vercel Analytics (built-in)
- Supabase Dashboard (database metrics)

## Deployment Checklist

### Phase 1: Pre-Deployment Preparation

#### 1. Code Repository Setup
- [ ] Create GitHub repository (private or public)
- [ ] Push all code to main branch
- [ ] Ensure .gitignore excludes:
  - `.env.local`
  - `.env.production`
  - `node_modules/`
  - `.next/`
  - `.vercel/`
- [ ] Create README.md with setup instructions
- [ ] Tag release version (e.g., `v1.0.0`)

#### 2. Supabase Production Setup
- [ ] Create new Supabase project (Production)
- [ ] Copy Project URL and API keys
- [ ] Run database schema migration:
  ```sql
  -- Execute database-schema.sql in SQL Editor
  ```
- [ ] Verify all tables created
- [ ] Verify RLS policies enabled
- [ ] Create storage bucket: `grow-photos`
- [ ] Configure storage policies
- [ ] Verify functions and triggers work

#### 3. Create Admin User
```sql
-- 1. Sign up via UI first to create auth user
-- 2. Get user ID from Dashboard → Authentication → Users
-- 3. Run this SQL:
INSERT INTO admin_users (user_id, role)
VALUES ('your-user-uuid-here', 'admin');
```

#### 4. Environment Variables Setup

**Create `.env.production` file:**
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Optional: Analytics (if using)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

**Security Notes:**
- Never commit this file to git
- Service role key should only be used server-side
- Anon key is safe for client-side use (RLS protects data)

### Phase 2: Vercel Deployment

#### 1. Connect to Vercel

**Option A: Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

**Option B: Vercel Dashboard**
1. Go to https://vercel.com
2. Click "New Project"
3. Import GitHub repository
4. Configure settings (see below)

#### 2. Vercel Project Configuration

**Framework Preset:** Next.js

**Build Settings:**
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install`
- Development Command: `npm run dev`

**Root Directory:** `./` (unless monorepo)

**Node Version:** 20.x (recommended)

#### 3. Environment Variables in Vercel

**Add in Vercel Dashboard → Settings → Environment Variables:**

```
NEXT_PUBLIC_SUPABASE_URL = https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**For each variable:**
- Name: [Variable name]
- Value: [Variable value]
- Environments: Production, Preview, Development (all selected)

**Verify:**
- [ ] All environment variables added
- [ ] No typos in variable names
- [ ] Values are correct (copy from Supabase dashboard)

#### 4. Deploy

**Via Dashboard:**
1. Click "Deploy"
2. Wait for build to complete (~2-5 minutes)
3. Check deployment logs for errors

**Via CLI:**
```bash
vercel --prod
```

**Verify Deployment:**
- [ ] Build completed successfully
- [ ] No build errors
- [ ] Deployment URL active
- [ ] Can access landing page

### Phase 3: Post-Deployment Verification

#### 1. Smoke Tests

**Landing Page:**
- [ ] https://your-app.vercel.app loads
- [ ] No console errors
- [ ] Images load
- [ ] CTAs work
- [ ] Navigation works

**Authentication:**
- [ ] Can sign up
- [ ] Can log in
- [ ] Can log out
- [ ] Session persists

**User Dashboard:**
- [ ] Dashboard loads after login
- [ ] Stats display
- [ ] Navigation works
- [ ] No console errors

**Grow Logs:**
- [ ] Can create new log
- [ ] Can upload photos
- [ ] Photos visible after upload
- [ ] Can view log
- [ ] Can edit log
- [ ] Can delete log

**Admin:**
- [ ] Admin login works
- [ ] Admin dashboard loads
- [ ] Can view users
- [ ] Can view all logs
- [ ] Can export CSV

#### 2. Database Verification

**Check in Supabase Dashboard:**
- [ ] User profiles created on signup
- [ ] Grow logs saved correctly
- [ ] Points calculated correctly
- [ ] Photos in storage bucket
- [ ] RLS policies working

**Test Queries:**
```sql
-- Count users
SELECT COUNT(*) FROM user_profiles;

-- Count logs
SELECT COUNT(*) FROM grow_logs;

-- Check admin user
SELECT * FROM admin_users;

-- Test RLS (as user)
SELECT * FROM grow_logs WHERE user_id = auth.uid();
```

#### 3. Performance Check

**Run Lighthouse Audit:**
```bash
npx lighthouse https://your-app.vercel.app --view
```

**Target Scores:**
- Performance: >80
- Accessibility: >90
- Best Practices: >90
- SEO: >80

**Check:**
- [ ] Page load <3s
- [ ] No slow queries
- [ ] Images optimized
- [ ] No console errors

### Phase 4: Custom Domain (Optional)

#### 1. Add Domain in Vercel

**In Vercel Dashboard:**
1. Go to Project → Settings → Domains
2. Add domain: `spawnify.com`
3. Follow DNS configuration instructions

#### 2. DNS Configuration

**Add these records in your DNS provider:**

**For Apex Domain (spawnify.com):**
```
Type: A
Name: @
Value: 76.76.21.21
TTL: 3600
```

**For WWW (www.spawnify.com):**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

#### 3. Verify Domain

- [ ] Domain added in Vercel
- [ ] DNS records configured
- [ ] SSL certificate issued (automatic via Vercel)
- [ ] https://spawnify.com loads
- [ ] https://www.spawnify.com redirects to https://spawnify.com

#### 4. Update Supabase Redirect URLs

**In Supabase Dashboard → Authentication → URL Configuration:**
- Site URL: `https://spawnify.com`
- Redirect URLs: `https://spawnify.com/**`

### Phase 5: Monitoring & Analytics

#### 1. Vercel Analytics (Built-in)

**Enabled automatically:**
- [ ] Real User Monitoring (RUM)
- [ ] Web Vitals tracking
- [ ] Page view analytics

**Access:**
- Vercel Dashboard → Project → Analytics

#### 2. Supabase Dashboard

**Monitor:**
- [ ] Database usage
- [ ] Storage usage
- [ ] Auth usage
- [ ] API requests

**Set up Alerts:**
- [ ] Database size >80%
- [ ] Storage size >80%
- [ ] Error rate >5%

#### 3. Error Tracking (Optional)

**Sentry Setup (if needed):**
```bash
npm install @sentry/nextjs
npx @sentry/wizard -i nextjs
```

Add to environment variables:
```env
NEXT_PUBLIC_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

### Phase 6: Documentation

#### 1. Create DEPLOYMENT.md

```markdown
# Deployment Guide

## Production URL
https://spawnify.com

## Deployment Date
[Date]

## Environment Variables
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY

## Admin Access
Email: admin@spawnify.com
Initial setup required via SQL

## Monitoring
- Vercel Dashboard: [URL]
- Supabase Dashboard: [URL]

## Rollback Procedure
See ROLLBACK.md
```

#### 2. Create ROLLBACK.md

```markdown
# Rollback Procedure

## Quick Rollback (Vercel)
1. Go to Vercel Dashboard → Deployments
2. Find previous working deployment
3. Click "..." → Promote to Production

## Database Rollback
1. Export current database (backup)
2. Restore from previous backup if needed
3. Re-run migration if schema changed

## Storage Rollback
1. Supabase Storage has versioning
2. Restore files if needed via Dashboard

## Emergency Contact
[Your contact information]
```

#### 3. Update README.md

Add production deployment instructions:
```markdown
## Production Deployment

### Prerequisites
- Vercel account
- Supabase account
- GitHub repository

### Steps
1. Clone repository
2. Install dependencies: `npm install`
3. Set up Supabase project
4. Configure environment variables
5. Deploy to Vercel
6. Run database migrations
7. Create admin user

For detailed steps, see DEPLOYMENT.md
```

### Phase 7: Launch Preparation

#### 1. Pre-Launch Checklist
- [ ] All features tested in production
- [ ] No critical bugs
- [ ] Performance acceptable
- [ ] Security verified
- [ ] Backups configured
- [ ] Monitoring active
- [ ] Documentation complete

#### 2. Communication Plan
- [ ] Notify team of launch
- [ ] Prepare support email
- [ ] Set up feedback collection
- [ ] Create incident response plan

#### 3. Launch Day
- [ ] Final smoke test
- [ ] Monitor error logs
- [ ] Monitor performance
- [ ] Be ready for quick fixes

### Phase 8: Post-Launch

#### 1. Week 1 Monitoring
- [ ] Check error logs daily
- [ ] Monitor Vercel analytics
- [ ] Track user signups
- [ ] Gather user feedback
- [ ] Fix critical bugs immediately

#### 2. Week 2-4 Review
- [ ] Analyze usage patterns
- [ ] Review performance metrics
- [ ] Identify improvements
- [ ] Plan next iteration

#### 3. Regular Maintenance
- [ ] Weekly dependency updates
- [ ] Monthly security audits
- [ ] Quarterly feature reviews
- [ ] Database optimization

## Deployment Commands Reference

### Development
```bash
npm run dev          # Start dev server
npm run build        # Build production bundle
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Vercel CLI
```bash
vercel               # Deploy to preview
vercel --prod        # Deploy to production
vercel logs          # View deployment logs
vercel env pull      # Pull environment variables
```

### Supabase CLI (if needed)
```bash
npx supabase login
npx supabase link --project-ref xxxxxxxxxxxxx
npx supabase db push  # Push migrations
npx supabase db pull  # Pull schema
```

## Troubleshooting

### Build Fails
1. Check build logs in Vercel
2. Verify all dependencies installed
3. Check for TypeScript errors
4. Verify environment variables set

### Database Connection Issues
1. Verify Supabase URL correct
2. Check API keys are valid
3. Verify RLS policies don't block queries
4. Check network connectivity

### Photo Upload Fails
1. Verify storage bucket exists
2. Check storage policies
3. Verify file size limits
4. Check file type validation

### Admin Can't Login
1. Verify admin user in admin_users table
2. Check admin role is 'admin'
3. Verify middleware checks admin correctly

## Rollback Procedures

### Vercel Deployment Rollback
1. Go to Vercel Dashboard
2. Click on Deployments
3. Find previous working deployment
4. Click "..." → "Promote to Production"
5. Verify rollback successful

### Database Schema Rollback
1. Export current database first (backup)
2. If migration failed, manually revert in SQL editor
3. Re-deploy application with previous schema version

### Emergency Shutdown
```bash
# Pause deployments
vercel --prod --no-wait

# Or delete deployment
vercel remove [deployment-url]
```

## Success Criteria

- [ ] Application deployed to production
- [ ] Custom domain configured (if applicable)
- [ ] All features working in production
- [ ] Database accessible and secure
- [ ] Photos uploading successfully
- [ ] Admin access configured
- [ ] Monitoring active
- [ ] Documentation complete
- [ ] Team notified
- [ ] Launch successful

## Next Steps

After successful deployment:
1. Monitor for 24-48 hours
2. Gather initial user feedback
3. Fix any issues that arise
4. Plan Phase 2 features
5. Celebrate! 🎉

## Support Resources

- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **GitHub Issues:** [Your repo URL]

## Emergency Contacts

- **Technical Lead:** [Name/Email]
- **Database Admin:** [Name/Email]
- **Vercel Support:** support@vercel.com
- **Supabase Support:** support@supabase.com
