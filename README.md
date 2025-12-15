# Spawnify MVP

A scientific mushroom cultivation tracking platform built with Next.js 14+ and Supabase.

## Features

- **User Authentication**: Secure signup/login with Supabase Auth
- **Grow Log Tracking**: Comprehensive logging of mushroom cultivation data
- **Photo Documentation**: Upload and manage grow photos
- **Gamification**: Earn points and progress through Bronze, Silver, and Gold tiers
- **Data Completeness**: Real-time completeness scoring
- **Admin Dashboard**: User management and data export
- **Scientific Contribution**: Anonymized data contributes to research

## Tech Stack

- **Framework**: Next.js 14.2+ (App Router)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Charts**: Recharts
- **Forms**: React Hook Form

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd spawnify-mvp
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Add your Supabase credentials to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

4. Set up the database:
   - Go to Supabase Dashboard → SQL Editor
   - Run `database-schema.sql`
   - Create storage bucket: `grow-photos` (public)

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Add environment variables in Vercel Dashboard
5. Deploy

### Environment Variables for Production

Add these in Vercel Dashboard → Settings → Environment Variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Supabase Setup

1. Create a production Supabase project
2. Run `database-schema.sql` in SQL Editor
3. Create storage bucket: `grow-photos`
4. Update redirect URLs in Authentication settings
5. Create admin user via SQL (see database-schema.sql comments)

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth routes (login, signup)
│   ├── admin/             # Admin dashboard
│   ├── dashboard/          # User dashboard
│   └── api/                # API routes
├── components/             # React components
│   ├── ui/                # Reusable UI components
│   ├── landing/           # Landing page components
│   ├── dashboard/         # Dashboard components
│   ├── grow-logs/         # Grow log components
│   ├── settings/          # Settings components
│   └── admin/             # Admin components
├── lib/                    # Utilities and helpers
│   ├── supabase/          # Supabase client utilities
│   ├── types/             # TypeScript types
│   ├── constants/         # Constants and options
│   └── utils/             # Utility functions
└── database-schema.sql     # Complete database schema
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## License

MIT
