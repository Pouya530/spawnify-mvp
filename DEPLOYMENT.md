# Deployment Guide

## Pre-Deployment Checklist

- [x] All TypeScript errors fixed
- [x] Build passes successfully (`npm run build`)
- [x] Code committed to git
- [ ] GitHub repository created
- [ ] Supabase production project created
- [ ] Environment variables ready

## Step 1: Push to GitHub

```bash
# If you haven't created a GitHub repo yet:
# 1. Go to github.com and create a new repository
# 2. Then run:

git remote add origin https://github.com/yourusername/spawnify-mvp.git
git branch -M main
git push -u origin main
```

## Step 2: Set Up Supabase Production

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Click "New Project"
   - Fill in project details
   - Wait for provisioning (~2 minutes)

2. **Run Database Schema**
   - Go to SQL Editor in Supabase Dashboard
   - Copy contents of `database-schema.sql`
   - Paste and run
   - Verify all tables created

3. **Create Storage Bucket**
   - Go to Storage in Supabase Dashboard
   - Click "New bucket"
   - Name: `grow-photos`
   - Public: Yes
   - Click "Create"

4. **Get Credentials**
   - Go to Project Settings → API
   - Copy:
     - Project URL
     - `anon` public key
     - `service_role` key (keep secret!)

## Step 3: Deploy to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Configure:
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./`
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
5. **Add Environment Variables:**
   - Go to Settings → Environment Variables
   - Add:
     ```
     NEXT_PUBLIC_SUPABASE_URL = [your-supabase-url]
     NEXT_PUBLIC_SUPABASE_ANON_KEY = [your-anon-key]
     SUPABASE_SERVICE_ROLE_KEY = [your-service-role-key]
     ```
   - Select all environments: Production, Preview, Development
6. Click "Deploy"
7. Wait for build to complete (~2-5 minutes)

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy (will prompt for configuration)
vercel

# Deploy to production
vercel --prod
```

## Step 4: Configure Supabase Redirect URLs

After deployment, update Supabase:

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add to Redirect URLs:
   - `https://your-app.vercel.app/**`
   - `https://your-app.vercel.app/dashboard/**`
   - `https://your-app.vercel.app/admin/**`
3. Set Site URL: `https://your-app.vercel.app`

## Step 5: Create Admin User

1. Sign up via your deployed app
2. Go to Supabase Dashboard → Authentication → Users
3. Find your user and copy the User ID
4. Go to SQL Editor and run:
```sql
INSERT INTO admin_users (user_id, role)
VALUES ('your-user-uuid-here', 'admin');
```

## Step 6: Verify Deployment

Test these features:

- [ ] Landing page loads
- [ ] Can sign up
- [ ] Can log in
- [ ] Dashboard displays
- [ ] Can create grow log
- [ ] Can upload photos
- [ ] Can view/edit/delete logs
- [ ] Admin login works
- [ ] Admin dashboard displays
- [ ] CSV export works

## Troubleshooting

### Build Fails
- Check build logs in Vercel
- Verify all environment variables set
- Check for TypeScript errors locally

### Database Connection Issues
- Verify Supabase URL is correct
- Check API keys are valid
- Verify RLS policies don't block queries

### Photo Upload Fails
- Verify storage bucket exists
- Check storage policies
- Verify file size limits

### Admin Can't Login
- Verify admin user in `admin_users` table
- Check admin role is 'admin'
- Verify middleware checks admin correctly

## Post-Deployment

- Monitor error logs in Vercel Dashboard
- Check Supabase Dashboard for database metrics
- Test all features thoroughly
- Set up monitoring alerts

## Support

For issues, check:
- Vercel Dashboard → Deployments → Logs
- Supabase Dashboard → Logs
- Browser console for client-side errors

