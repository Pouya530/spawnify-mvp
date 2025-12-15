# Spawnify MVP

A scientific mushroom cultivation tracking platform that helps growers document their journey while contributing to AI research and scientific studies.

## 🚀 Features

- **Comprehensive Grow Logging**: Track every detail from inoculation to harvest
- **Photo Documentation**: Upload photos at each growth stage
- **Gamification System**: Earn points and progress through Bronze, Silver, and Gold tiers
- **Scientific Contribution**: Anonymized data contributes to AI research
- **Admin Dashboard**: User management and data export capabilities
- **Beautiful UI**: Modern, responsive design with Tailwind CSS

## 🛠️ Tech Stack

- **Framework**: Next.js 14.2+ (App Router)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **Forms**: React Hook Form

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- Vercel account (for deployment)

## 🏗️ Setup Instructions

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd spawnify-mvp
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1. Create a new Supabase project at [supabase.com](https://supabase.com)
2. Go to SQL Editor and run `database-schema.sql`
3. Create storage bucket named `grow-photos` (public)
4. Copy your Supabase credentials:
   - Project URL
   - `anon` public key
   - `service_role` key (keep secret!)

### 4. Configure Environment Variables

Create `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 5. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 🚢 Deployment

### Vercel Deployment

1. Push code to GitHub:
   ```bash
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com) and import your GitHub repository

3. Add environment variables in Vercel Dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

4. Deploy!

5. Update Supabase redirect URLs:
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Add your Vercel URL: `https://your-app.vercel.app`
   - Add redirect URLs: `https://your-app.vercel.app/**`

### Create Admin User

After deployment, create an admin user:

1. Sign up via the UI
2. Get user ID from Supabase Dashboard → Authentication → Users
3. Run SQL:
   ```sql
   INSERT INTO admin_users (user_id, role)
   VALUES ('your-user-uuid-here', 'admin');
   ```

## 📁 Project Structure

```
spawnify-mvp/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth pages (login, signup)
│   ├── admin/             # Admin dashboard
│   ├── dashboard/         # User dashboard
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── admin/            # Admin components
│   ├── auth/             # Auth components
│   ├── dashboard/        # Dashboard components
│   ├── grow-logs/        # Grow log components
│   ├── landing/          # Landing page components
│   ├── settings/         # Settings components
│   └── ui/               # Reusable UI components
├── lib/                  # Utilities and types
│   ├── constants/        # Constants (dropdown options)
│   ├── supabase/         # Supabase client utilities
│   ├── types/            # TypeScript types
│   └── utils/            # Utility functions
├── database-schema.sql   # Complete database schema
└── middleware.ts          # Route protection middleware
```

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |

## 📝 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🎯 Key Features

### User Features
- Create and manage grow logs
- Upload photos
- Track environmental data
- View statistics and progress
- Earn points and unlock tiers
- Export data (admin only)

### Admin Features
- View all users
- Manage all grow logs
- Export anonymized CSV data
- System statistics dashboard

## 🐛 Troubleshooting

### Build Errors
- Ensure all TypeScript errors are resolved
- Check that all environment variables are set
- Verify Supabase connection

### Database Issues
- Verify `database-schema.sql` was run successfully
- Check RLS policies are enabled
- Ensure storage bucket exists

### Authentication Issues
- Verify redirect URLs in Supabase
- Check environment variables are correct
- Ensure middleware is configured properly

## 📄 License

MIT

## 🙏 Contributing

This is an MVP. Future enhancements welcome!

## 📞 Support

For issues or questions, please open an issue on GitHub.
