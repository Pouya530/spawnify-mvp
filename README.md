# Spawnify MVP - Node.js Backend API

Complete backend API implementation for Spawnify, a scientific mushroom cultivation tracking platform.

## Features

- ✅ User authentication (signup, login, admin login)
- ✅ User profile management
- ✅ Grow log CRUD operations
- ✅ Photo uploads to Supabase Storage
- ✅ Dashboard statistics
- ✅ Admin routes and data export
- ✅ Data completeness scoring
- ✅ Points and tier system (Bronze/Silver/Gold)

## Prerequisites

- Node.js 18+ installed
- Supabase account and project
- npm or yarn package manager

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
PORT=3000
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 3. Set Up Supabase Database

Run the database schema SQL in your Supabase SQL Editor. The schema includes:

- `user_profiles` table
- `grow_logs` table
- `admin_users` table
- Row Level Security (RLS) policies
- Database functions and triggers
- Storage bucket for photos

### 4. Create Storage Bucket

In Supabase Dashboard → Storage:

1. Create a new bucket named `grow-photos`
2. Set it to public
3. Configure storage policies (users can upload to their own folder)

### 5. Create Admin User

After signing up via the API:

1. Get your user ID from Supabase Dashboard → Authentication → Users
2. Run this SQL in the SQL Editor:

```sql
INSERT INTO admin_users (user_id, role)
VALUES ('your-user-uuid-here', 'admin');
```

### 6. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Endpoints

### Authentication

- `POST /api/auth/signup` - User signup
- `POST /api/auth/login` - User login
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/logout` - Logout

### User Profile

- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `POST /api/user/change-password` - Change password

### Dashboard

- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/recent` - Get recent activity

### Grow Logs

- `GET /api/grow-logs` - List all grow logs (with pagination, filters)
- `GET /api/grow-logs/:id` - Get single grow log
- `POST /api/grow-logs` - Create new grow log (with photo upload)
- `PUT /api/grow-logs/:id` - Update grow log
- `DELETE /api/grow-logs/:id` - Delete grow log

### Admin

- `GET /api/admin/stats` - Admin dashboard statistics
- `GET /api/admin/users` - List all users
- `GET /api/admin/grow-logs` - List all grow logs (all users)
- `GET /api/admin/export` - Export data to CSV

### Constants

- `GET /api/constants/growing-options` - Get dropdown options

### Health Check

- `GET /health` - Server health check
- `GET /` - API information

## Authentication

Most endpoints require authentication. Include the Bearer token in the Authorization header:

```
Authorization: Bearer your_jwt_token_here
```

Admin endpoints require admin role verification.

## Photo Uploads

When creating or updating grow logs, include photos using multipart/form-data:

```bash
curl -X POST http://localhost:3000/api/grow-logs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "growth_stage=Inoculation" \
  -F "log_date=2024-12-13" \
  -F "strain=Golden Teacher" \
  -F "substrate=Coco Coir" \
  -F "inoculation_method=Spore Syringe" \
  -F "growing_method=Monotub" \
  -F "photos=@photo1.jpg" \
  -F "photos=@photo2.jpg"
```

## Data Completeness Scoring

The system automatically calculates a completeness score (0-100%) based on:

- Required fields complete: 60 points
- Optional fields (substrate ratio, inoculation details, light hours, TEK method): 10 points each
- Bonus - TEK notes >100 chars: +15 points
- Bonus - General notes >50 chars: +5 points
- Bonus - Photos uploaded: +10 points

## Points System

- Base log: 10 points
- Complete log (≥80% completeness): 25 points
- Detailed TEK notes (>100 chars): +15 points
- Photos uploaded: +10 points

## User Tiers

- **Bronze**: 0-99 points
- **Silver**: 100-499 points
- **Gold**: 500+ points

## Example API Calls

### Sign Up

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "full_name": "John Doe"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

### Create Grow Log

```bash
curl -X POST http://localhost:3000/api/grow-logs \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "growth_stage": "Inoculation",
    "log_date": "2024-12-13",
    "strain": "Golden Teacher",
    "substrate": "Coco Coir",
    "inoculation_method": "Spore Syringe",
    "growing_method": "Monotub",
    "temperature": 75.5,
    "humidity": 90,
    "notes": "First grow attempt"
  }'
```

## Project Structure

```
spawnify-mvp/
├── index.js              # Main Express server
├── package.json          # Dependencies
├── .env                  # Environment variables (git ignored)
├── .env.example          # Example environment variables
├── README.md             # This file
└── uploads/              # Temporary upload directory (git ignored)
```

## Development

### Using Nodemon (Auto-reload)

```bash
npm run dev
```

### Manual Restart

```bash
npm start
```

## Production Deployment

1. Set environment variables in your hosting platform
2. Ensure Supabase production instance is configured
3. Run database migrations
4. Create admin user
5. Start server with `npm start`

## Security Notes

- Never commit `.env` file to git
- Use `SUPABASE_SERVICE_ROLE_KEY` only server-side
- RLS policies protect data at database level
- File uploads validated (images only, 10MB max)
- Authentication required for most endpoints

## Troubleshooting

### "Missing Supabase environment variables"
- Check `.env` file exists and has correct values
- Verify variable names match exactly

### "Storage bucket not found"
- Create `grow-photos` bucket in Supabase Storage
- Set bucket to public
- Configure storage policies

### "Admin access required"
- Verify user is in `admin_users` table
- Check admin role is set correctly

### Photo upload fails
- Check file size (max 10MB)
- Verify file is PNG/JPG/JPEG
- Ensure storage bucket exists and is public

## License

MIT

