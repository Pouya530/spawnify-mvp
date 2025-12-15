# Authentication Agent

## Role
You are the Authentication Agent responsible for implementing secure user authentication, session management, and route protection for Spawnify MVP.

## Primary Objectives
1. Implement email/password authentication using Supabase Auth
2. Create secure login and signup flows
3. Implement route protection middleware
4. Handle admin authentication separately
5. Manage user sessions and logout functionality

## Tech Stack
- **Auth Provider:** Supabase Auth
- **Client Library:** `@supabase/auth-helpers-nextjs` ^0.10.0
- **Session Storage:** Secure httpOnly cookies
- **Token Type:** JWT

## Core Features

### 1. User Signup (`/signup`)

**Page Location:** `app/(auth)/signup/page.tsx`

**Form Fields:**
- Email (required, validated)
- Password (required, min 8 characters)
- Full Name (optional)

**Implementation:**
```tsx
async function handleSignup(email: string, password: string, fullName?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName
      }
    }
  });
  
  // On success: Redirect to /dashboard
  // On error: Display user-friendly error message
}
```

**Validation Rules:**
- Email: Valid email format
- Password: Minimum 8 characters
- Display inline errors for invalid fields

**Success Flow:**
1. Create user in auth.users
2. Trigger `handle_new_user()` function (creates user_profiles row)
3. Auto-login user
4. Redirect to `/dashboard`

**Error Handling:**
- "Email already registered" → "This email is already in use"
- "Invalid email" → "Please enter a valid email address"
- "Weak password" → "Password must be at least 8 characters"
- Network error → "Connection lost. Please try again."

### 2. User Login (`/login`)

**Page Location:** `app/(auth)/login/page.tsx`

**Form Fields:**
- Email (required)
- Password (required)

**Implementation:**
```tsx
async function handleLogin(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  // On success: Redirect to /dashboard
  // On error: Display error message
}
```

**Success Flow:**
1. Verify credentials
2. Create session (JWT token in httpOnly cookie)
3. Redirect to `/dashboard`

**Error Handling:**
- Invalid credentials → "Invalid email or password"
- Account not found → "Invalid email or password" (same message for security)
- Network error → "Connection lost. Please try again."

### 3. Admin Login (`/admin/login`)

**Page Location:** `app/admin/login/page.tsx`

**Form Fields:**
- Email (required)
- Password (required)

**Implementation:**
```tsx
async function handleAdminLogin(email: string, password: string) {
  // 1. Login with Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) return;
  
  // 2. Check if user is admin
  const { data: adminData } = await supabase
    .from('admin_users')
    .select('role')
    .eq('user_id', data.user.id)
    .single();
  
  if (!adminData) {
    // Not an admin - sign out and show error
    await supabase.auth.signOut();
    return error('Access denied');
  }
  
  // 3. Redirect to admin dashboard
  router.push('/admin/dashboard');
}
```

**Security:**
- Separate login page from regular users
- Verify admin role after authentication
- Sign out non-admins immediately
- No indication that account exists (security)

### 4. Logout Functionality

**Implementation:**
```tsx
async function handleLogout() {
  await supabase.auth.signOut();
  router.push('/login');
}
```

**Triggered from:**
- Dashboard navigation logout button
- Admin navigation logout button
- Session expiration

### 5. Password Reset Flow (Optional for MVP)

**Basic Implementation:**
```tsx
async function handlePasswordReset(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`
  });
}
```

**Note:** Can be delayed to post-MVP if time is tight.

## Supabase Client Setup

### Client Component Usage (`lib/supabase/client.ts`)
```tsx
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export const createClient = () => createClientComponentClient();
```

### Server Component Usage (`lib/supabase/server.ts`)
```tsx
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export const createClient = () => createServerComponentClient({ cookies });
```

### Middleware Usage (`lib/supabase/middleware.ts`)
```tsx
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';

export async function createClient(req: NextRequest) {
  const res = NextResponse.next();
  return createMiddlewareClient({ req, res });
}
```

## Route Protection

### Middleware (`middleware.ts`)

**Protected Routes:**
- `/dashboard/*` → Requires authentication
- `/admin/*` → Requires authentication + admin role

**Public Routes:**
- `/` (landing page)
- `/login`
- `/signup`
- `/admin/login`

**Implementation:**
```tsx
export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });
  
  const { data: { session } } = await supabase.auth.getSession();
  
  // Protect /dashboard routes
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }
  
  // Protect /admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
    
    // Check admin role
    const { data: adminData } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', session.user.id)
      .single();
    
    if (!adminData) {
      // Not an admin - redirect to user dashboard
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }
  
  return res;
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*']
};
```

## Session Management

### Auto-Refresh
- Supabase handles automatic token refresh
- Refresh token stored in httpOnly cookie
- Access token expires in 1 hour (default)

### Session Persistence
- User stays logged in across browser sessions
- Session expires after 7 days of inactivity (Supabase default)

### Session Verification
```tsx
async function getUser() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  return user;
}
```

## Auth Layout (`app/(auth)/layout.tsx`)

**Purpose:** Shared layout for login/signup pages

**Features:**
- Centered form container
- Spawnify logo at top
- Link to switch between login/signup
- Minimal design, no navigation

**Example:**
```tsx
export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="w-full max-w-md p-8">
        {/* Logo */}
        <h1 className="text-3xl font-bold text-center mb-8">Spawnify</h1>
        
        {/* Form content */}
        {children}
      </div>
    </div>
  );
}
```

## Security Requirements

### Password Security
- Minimum 8 characters (enforced by Supabase)
- Hashed with bcrypt (automatic)
- Never stored in plain text
- Never sent to client

### SQL Injection Prevention
- Use Supabase client only (parameterized queries)
- Never concatenate user input into SQL

### XSS Prevention
- React escapes output by default
- Validate and sanitize email input
- No `dangerouslySetInnerHTML`

### CSRF Protection
- httpOnly cookies (not accessible to JavaScript)
- Supabase handles CSRF tokens automatically

## Environment Variables

**Required:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

**Security:**
- Never commit `.env.local` to git
- Use Vercel environment variables in production
- Anon key is safe for client-side (RLS protects data)

## Database Triggers

### Auto-Create Profile on Signup
```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, email, verification_level, total_points)
  VALUES (NEW.id, NEW.email, 'bronze', 0);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

## UI Components Needed

From Design System Agent:
- `Button` component
- `Input` component
- `Card` component

## Form Validation

### Client-Side
```tsx
const validateEmail = (email: string) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

const validatePassword = (password: string) => {
  return password.length >= 8;
};
```

### Error Display
- Inline errors below each field
- Red text (`text-red-600`)
- Red border on invalid inputs
- Show error only after user has interacted with field

## Loading States

### During Submission
- Disable form
- Show loading spinner in button
- Button text: "Signing in..." or "Creating account..."
- Prevent double submissions

### Example
```tsx
const [loading, setLoading] = useState(false);

async function handleSubmit(e) {
  e.preventDefault();
  setLoading(true);
  
  try {
    await handleLogin(email, password);
  } catch (error) {
    setError(error.message);
  } finally {
    setLoading(false);
  }
}
```

## Success States

### After Successful Login/Signup
- No success message needed
- Immediate redirect to dashboard
- Dashboard will load with user data

## Implementation Checklist
- [ ] Install Supabase auth helpers
- [ ] Create Supabase client utilities
- [ ] Implement signup page
- [ ] Implement login page
- [ ] Implement admin login page
- [ ] Create middleware for route protection
- [ ] Implement logout functionality
- [ ] Create auth layout
- [ ] Add form validation
- [ ] Add loading states
- [ ] Add error handling
- [ ] Test all auth flows
- [ ] Verify session persistence
- [ ] Test admin role verification
- [ ] Test route protection

## Testing Scenarios
- [ ] Sign up with new email → Success
- [ ] Sign up with existing email → Error shown
- [ ] Login with correct credentials → Success
- [ ] Login with wrong password → Error shown
- [ ] Access /dashboard without login → Redirect to /login
- [ ] Access /admin without admin role → Redirect to /dashboard
- [ ] Logout → Session cleared, redirect to /login
- [ ] Session persists after browser close
- [ ] Session expires after 7 days

## Files to Create
1. `lib/supabase/client.ts`
2. `lib/supabase/server.ts`
3. `lib/supabase/middleware.ts`
4. `middleware.ts`
5. `app/(auth)/layout.tsx`
6. `app/(auth)/login/page.tsx`
7. `app/(auth)/signup/page.tsx`
8. `app/admin/login/page.tsx`
9. `app/api/auth/callback/route.ts` (for OAuth, future)

## Success Criteria
- Users can sign up and login successfully
- Sessions persist across browser sessions
- Protected routes redirect unauthorized users
- Admin routes only accessible to admins
- Forms have proper validation and error handling
- Loading states prevent double submissions
- No security vulnerabilities (XSS, CSRF, SQL injection)

## Handoff to Other Agents
- **Dashboard Agent:** User session data available
- **Grow Log Agent:** User ID available for RLS
- **Admin Agent:** Admin role verification in place
- **Database Agent:** user_profiles auto-created on signup
