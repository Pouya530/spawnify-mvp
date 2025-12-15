# Quick Deployment Guide

## ✅ What's Already Done

- ✅ Code committed to git
- ✅ Build passes successfully  
- ✅ Environment variables configured in `.env.local`
- ✅ Supabase project exists

## 🚀 Deployment Steps

### Step 1: Push to GitHub

```bash
# Create a new repository on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/spawnify-mvp.git
git branch -M main
git push -u origin main
```

### Step 2: Verify Supabase Database

Since your Supabase project already exists, verify:

1. **Check Tables Exist:**
   - Go to Supabase Dashboard → SQL Editor
   - Run:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('user_profiles', 'grow_logs', 'admin_users');
   ```
   - Should return 3 rows

2. **If Tables Missing:**
   - Copy entire `database-schema.sql` file
   - Paste in SQL Editor
   - Click "Run"
   - Verify success

3. **Check Storage Bucket:**
   - Go to Storage
   - Verify `grow-photos` bucket exists
   - If not, create it (public bucket)

### Step 3: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. **Add Environment Variables** (copy from `.env.local`):
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://oxdknvkltvigixofxpab.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94ZGtudmtsdHZpZ2l4b2Z4cGFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1ODc4NDgsImV4cCI6MjA4MTE2Mzg0OH0.1n3IerXktp8nyc_whCadO972Q9fy5e5U4aM-5cJdzlE
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94ZGtudmtsdHZpZ2l4b2Z4cGFiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU4Nzg0OCwiZXhwIjoyMDgxMTYzODQ4fQ.X7RuhQFzMwfUbCvIWF18sNR-lJqrsT4A9Q7t61A5Tzs
   ```
5. Click "Deploy"

### Step 4: Update Supabase Redirect URLs

After Vercel deployment:

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. **Site URL**: `https://your-app.vercel.app`
3. **Redirect URLs**: Add:
   - `https://your-app.vercel.app/**`
   - `http://localhost:3000/**` (for local dev)

### Step 5: Create Admin User

1. Sign up via deployed app
2. Get User ID from Supabase Dashboard → Authentication → Users
3. Run SQL:
   ```sql
   INSERT INTO admin_users (user_id, role)
   VALUES ('your-user-uuid-here', 'admin');
   ```

## 🎯 You Don't Need Supabase CLI

For MVP, the Dashboard approach is simpler:
- ✅ Faster setup
- ✅ Visual verification
- ✅ No CLI installation needed
- ✅ Works perfectly for single project

**Use CLI later if:**
- Managing multiple environments
- Need version-controlled migrations
- Working with a team

## ✅ Verification Checklist

After deployment, test:
- [ ] Landing page loads
- [ ] Can sign up
- [ ] Can log in
- [ ] Dashboard displays
- [ ] Can create grow log
- [ ] Can upload photos
- [ ] Admin login works

---

**Ready?** Start with Step 1 (push to GitHub)!

