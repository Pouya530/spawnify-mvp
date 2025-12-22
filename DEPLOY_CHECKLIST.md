# Deployment Checklist

## ✅ Pre-Deployment (Completed)

- [x] All code committed to git
- [x] Build passes successfully (`npm run build`)
- [x] TypeScript errors resolved
- [x] Environment variables configured (`.env.local`)
- [x] `.next/` directory excluded from git
- [x] Documentation created (README.md, DEPLOYMENT.md, QUICK_DEPLOY.md)

## 📋 Next Steps

### Step 1: Verify Supabase Database

**Run `verify-database.sql` in Supabase Dashboard → SQL Editor:**

1. Go to your Supabase project: https://supabase.com/dashboard/project/oxdknvkltvigixofxpab
2. Click "SQL Editor" in left sidebar
3. Copy and paste queries from `verify-database.sql`
4. Click "Run"

**Expected Results:**
- ✅ 3 tables exist: `user_profiles`, `grow_logs`, `admin_users`
- ✅ 5 functions exist: `add_user_points`, `calculate_completeness_score`, `handle_new_user`, `handle_updated_at`, `is_admin`
- ✅ RLS enabled on all tables

**If tables are missing:**
- Copy entire `database-schema.sql` file
- Paste in SQL Editor
- Click "Run"
- Verify success

**Check Storage:**
- Go to Storage → Verify `grow-photos` bucket exists
- If missing: Create new bucket named `grow-photos` (public)

### Step 2: Push to GitHub

**Option A: Create new repository on GitHub first**
1. Go to https://github.com/new
2. Repository name: `spawnify-mvp`
3. Choose public or private
4. **Don't** initialize with README (we already have one)
5. Click "Create repository"

**Then run:**
```bash
git remote add origin https://github.com/YOUR_USERNAME/spawnify-mvp.git
git push -u origin main
```

**Option B: If repository already exists**
```bash
git remote add origin https://github.com/YOUR_USERNAME/spawnify-mvp.git
git push -u origin main
```

### Step 3: Deploy to Vercel

1. **Go to Vercel**: https://vercel.com
2. **Sign in** (or create account)
3. **Click "New Project"**
4. **Import GitHub repository**:
   - Select `spawnify-mvp` repository
   - Click "Import"
5. **Configure Project**:
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)
6. **Add Environment Variables**:
   - Click "Environment Variables"
   - Add these 3 variables (copy from `.env.local`):
     ```
     NEXT_PUBLIC_SUPABASE_URL=https://oxdknvkltvigixofxpab.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94ZGtudmtsdHZpZ2l4b2Z4cGFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1ODc4NDgsImV4cCI6MjA4MTE2Mzg0OH0.1n3IerXktp8nyc_whCadO972Q9fy5e5U4aM-5cJdzlE
     SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im94ZGtudmtsdHZpZ2l4b2Z4cGFiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU4Nzg0OCwiZXhwIjoyMDgxMTYzODQ4fQ.X7RuhQFzMwfUbCvIWF18sNR-lJqrsT4A9Q7t61A5Tzs
     ```
   - For each variable, select: **Production**, **Preview**, **Development**
7. **Click "Deploy"**
8. **Wait for build** (~2-5 minutes)

### Step 4: Update Supabase Redirect URLs

**After Vercel deployment:**

1. Get your Vercel URL (e.g., `https://spawnify-mvp.vercel.app`)
2. Go to Supabase Dashboard → Authentication → URL Configuration
3. **Site URL**: `https://your-app.vercel.app`
4. **Redirect URLs**: Add:
   - `https://your-app.vercel.app/**`
   - `http://localhost:3000/**` (for local dev)
5. Click "Save"

### Step 5: Create Admin User

1. **Sign up via deployed app**: `https://your-app.vercel.app/signup`
2. **Get User ID**:
   - Go to Supabase Dashboard → Authentication → Users
   - Find your user email
   - Copy the User ID (UUID)
3. **Run SQL**:
   ```sql
   INSERT INTO admin_users (user_id, role)
   VALUES ('your-user-uuid-here', 'admin');
   ```
4. **Verify**: Try logging in at `https://your-app.vercel.app/admin/login`

## ✅ Post-Deployment Verification

Test these features:

- [ ] Landing page loads (`/`)
- [ ] Can sign up (`/signup`)
- [ ] Can log in (`/login`)
- [ ] Dashboard displays (`/dashboard`)
- [ ] Can create grow log (`/dashboard/grow-logs/new`)
- [ ] Can upload photos
- [ ] Can view log (`/dashboard/grow-logs/[id]`)
- [ ] Can edit log (`/dashboard/grow-logs/[id]/edit`)
- [ ] Can delete log
- [ ] Admin login works (`/admin/login`)
- [ ] Admin dashboard loads (`/admin/dashboard`)
- [ ] CSV export works

## 🐛 Troubleshooting

### Build Fails on Vercel
- Check build logs in Vercel Dashboard
- Verify all environment variables are set correctly
- Ensure no TypeScript errors (run `npm run build` locally)

### Database Connection Issues
- Verify Supabase URL has no trailing slash
- Check API keys are correct
- Ensure RLS policies allow queries

### Authentication Redirect Issues
- Verify redirect URLs in Supabase Dashboard
- Check Site URL matches Vercel URL
- Ensure redirect URLs include `/**` wildcard

### Photo Upload Fails
- Verify `grow-photos` bucket exists
- Check bucket is public
- Verify storage policies are set

---

**Ready to deploy?** Follow steps 1-5 above! 🚀



