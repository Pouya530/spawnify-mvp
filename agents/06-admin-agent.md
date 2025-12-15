# Admin Agent

## Role
You are the Admin Agent responsible for implementing the complete admin dashboard, user management, grow logs management, and data export features for Spawnify MVP.

## Primary Objectives
1. Create separate admin login flow
2. Build admin dashboard with system statistics
3. Implement user management interface
4. Create grow logs management interface
5. Build data export functionality (CSV)
6. Ensure admin-only access with RLS verification

## Tech Stack
- Next.js 14.2+ (App Router)
- Supabase client with admin checks
- CSV generation library
- Lucide React icons
- Tailwind CSS

## Admin Routes Structure

```
/admin
  ├── /login              → Admin login page
  ├── /dashboard          → Admin home/stats
  ├── /users              → User management
  └── /grow-logs          → All grow logs management
```

## 1. Admin Login Page

### File: `app/admin/login/page.tsx`

**Purpose:** Separate login for admin users with role verification

```tsx
'use client';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const supabase = createClient();
      
      // 1. Login with Supabase Auth
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (authError) throw new Error('Invalid credentials');
      
      // 2. Check if user is admin
      const { data: adminData, error: adminError } = await supabase
        .from('admin_users')
        .select('role')
        .eq('user_id', data.user.id)
        .single();
      
      if (adminError || !adminData) {
        // Not an admin - sign out immediately
        await supabase.auth.signOut();
        throw new Error('Access denied. Admin privileges required.');
      }
      
      // 3. Success - redirect to admin dashboard
      router.push('/admin/dashboard');
      
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <Card className="w-full max-w-md p-8">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-neutral-900">
              Admin Login
            </h1>
            <p className="text-neutral-600 mt-2">
              Spawnify Administration
            </p>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
          
          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              label="Email"
              placeholder="admin@spawnify.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              icon={<Mail />}
            />
            
            <Input
              type="password"
              label="Password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              icon={<Lock />}
            />
            
            <Button 
              type="submit" 
              variant="primary" 
              className="w-full"
              loading={loading}
            >
              Sign In
            </Button>
          </form>
          
          {/* User Login Link */}
          <div className="text-center">
            <Link 
              href="/login"
              className="text-sm text-neutral-600 hover:text-neutral-900"
            >
              Regular user? Sign in here
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
```

## 2. Admin Layout

### File: `app/admin/layout.tsx`

**Purpose:** Shared layout for admin pages with navigation

```tsx
export default async function AdminLayout({ children }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Verify admin access
  if (user) {
    const { data: adminData } = await supabase
      .from('admin_users')
      .select('role')
      .eq('user_id', user.id)
      .single();
    
    if (!adminData) {
      redirect('/dashboard');
    }
  }
  
  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminNav />
      <main className="container mx-auto px-6 py-8 md:px-8 lg:px-12">
        {children}
      </main>
    </div>
  );
}
```

## 3. Admin Navigation

### File: `components/admin/AdminNav.tsx`

**Purpose:** Navigation bar for admin pages

```tsx
export function AdminNav() {
  return (
    <nav className="sticky top-0 z-50 bg-neutral-900 text-white">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Shield className="w-6 h-6 text-primary-400" />
          <Link href="/admin/dashboard" className="text-xl font-bold">
            Spawnify Admin
          </Link>
        </div>
        
        {/* Navigation Links */}
        <div className="flex gap-6">
          <AdminNavLink href="/admin/dashboard" icon={<BarChart />}>
            Dashboard
          </AdminNavLink>
          <AdminNavLink href="/admin/users" icon={<Users />}>
            Users
          </AdminNavLink>
          <AdminNavLink href="/admin/grow-logs" icon={<FileText />}>
            Grow Logs
          </AdminNavLink>
        </div>
        
        {/* Logout */}
        <LogoutButton />
      </div>
    </nav>
  );
}

function AdminNavLink({ href, icon, children }) {
  const pathname = usePathname();
  const isActive = pathname === href;
  
  return (
    <Link 
      href={href}
      className={cn(
        "flex items-center gap-2 text-sm transition-colors",
        isActive ? "text-primary-400 font-medium" : "text-neutral-400 hover:text-white"
      )}
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      {children}
    </Link>
  );
}
```

## 4. Admin Dashboard Home

### File: `app/admin/dashboard/page.tsx`

**Purpose:** System statistics overview

**Stats to Display:**
- Total Users
- Total Grow Logs
- Active Users (users with logs in last 30 days)
- Average Data Completeness

```tsx
export default async function AdminDashboardPage() {
  const supabase = createClient();
  
  // Fetch stats
  const { count: totalUsers } = await supabase
    .from('user_profiles')
    .select('*', { count: 'exact', head: true });
  
  const { count: totalLogs } = await supabase
    .from('grow_logs')
    .select('*', { count: 'exact', head: true });
  
  // Active users (logs in last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { data: activeLogs } = await supabase
    .from('grow_logs')
    .select('user_id')
    .gte('created_at', thirtyDaysAgo.toISOString());
  
  const activeUsers = new Set(activeLogs?.map(log => log.user_id)).size;
  
  // Average completeness
  const { data: allLogs } = await supabase
    .from('grow_logs')
    .select('data_completeness_score');
  
  const avgCompleteness = allLogs && allLogs.length > 0
    ? Math.round(
        allLogs.reduce((sum, log) => sum + log.data_completeness_score, 0) / allLogs.length
      )
    : 0;
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-neutral-900 tracking-tight">
          Admin Dashboard
        </h1>
        <p className="text-neutral-600 mt-2">
          System overview and statistics
        </p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={totalUsers || 0}
          icon={<Users />}
          color="blue"
        />
        <StatCard
          title="Total Grow Logs"
          value={totalLogs || 0}
          icon={<FileText />}
          color="primary"
        />
        <StatCard
          title="Active Users (30d)"
          value={activeUsers}
          icon={<Activity />}
          color="success"
        />
        <StatCard
          title="Avg Completeness"
          value={`${avgCompleteness}%`}
          icon={<TrendingUp />}
          color="purple"
        />
      </div>
      
      {/* Quick Actions */}
      <Card className="p-8">
        <h2 className="text-xl font-bold text-neutral-900 mb-6">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            variant="secondary"
            onClick={() => router.push('/admin/users')}
          >
            <Users className="w-4 h-4" />
            Manage Users
          </Button>
          <Button 
            variant="secondary"
            onClick={() => router.push('/admin/grow-logs')}
          >
            <FileText className="w-4 h-4" />
            View All Logs
          </Button>
          <ExportDataButton />
        </div>
      </Card>
    </div>
  );
}
```

## 5. User Management Page

### File: `app/admin/users/page.tsx`

**Purpose:** View and manage all users

**Features:**
- Table of all users
- Search by email
- Sort by points, join date
- Filter by verification level
- View user's grow logs

```tsx
export default async function AdminUsersPage({
  searchParams
}: {
  searchParams: { search?: string; level?: string; sort?: string }
}) {
  const supabase = createClient();
  
  // Build query
  let query = supabase
    .from('user_profiles')
    .select('*');
  
  // Apply filters
  if (searchParams.search) {
    query = query.ilike('email', `%${searchParams.search}%`);
  }
  
  if (searchParams.level) {
    query = query.eq('verification_level', searchParams.level);
  }
  
  // Apply sorting
  const sortField = searchParams.sort || 'created_at';
  query = query.order(sortField, { ascending: false });
  
  const { data: users } = await query;
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-neutral-900 tracking-tight">
          User Management
        </h1>
        <div className="text-sm text-neutral-600">
          {users?.length || 0} total users
        </div>
      </div>
      
      {/* Filters */}
      <UserFilters />
      
      {/* Users Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold">Email</th>
                <th className="text-left px-6 py-4 text-sm font-semibold">Full Name</th>
                <th className="text-left px-6 py-4 text-sm font-semibold">Tier</th>
                <th className="text-left px-6 py-4 text-sm font-semibold">Points</th>
                <th className="text-left px-6 py-4 text-sm font-semibold">Joined</th>
                <th className="text-right px-6 py-4 text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {users?.map(user => (
                <UserRow key={user.id} user={user} />
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
```

### UserRow Component

```tsx
function UserRow({ user }: { user: UserProfile }) {
  const router = useRouter();
  
  return (
    <tr className="hover:bg-neutral-50">
      <td className="px-6 py-4 text-sm font-medium text-neutral-900">
        {user.email}
      </td>
      <td className="px-6 py-4 text-sm text-neutral-600">
        {user.full_name || '—'}
      </td>
      <td className="px-6 py-4">
        <Badge variant={user.verification_level as any}>
          {user.verification_level.toUpperCase()}
        </Badge>
      </td>
      <td className="px-6 py-4 text-sm font-medium text-neutral-900">
        {user.total_points}
      </td>
      <td className="px-6 py-4 text-sm text-neutral-600">
        {format(new Date(user.created_at), 'MMM dd, yyyy')}
      </td>
      <td className="px-6 py-4 text-right">
        <Button
          variant="ghost"
          size="small"
          onClick={() => router.push(`/admin/grow-logs?user=${user.id}`)}
        >
          View Logs
        </Button>
      </td>
    </tr>
  );
}
```

## 6. Grow Logs Management Page

### File: `app/admin/grow-logs/page.tsx`

**Purpose:** View all grow logs from all users

**Features:**
- Table of ALL grow logs
- Search by strain, user email
- Filter by growth stage, date range
- Export to CSV
- View log details

```tsx
export default async function AdminGrowLogsPage({
  searchParams
}: {
  searchParams: { 
    search?: string; 
    stage?: string;
    user?: string;
  }
}) {
  const supabase = createClient();
  
  // Build query with user profile join
  let query = supabase
    .from('grow_logs')
    .select(`
      *,
      user_profile:user_profiles(email, full_name)
    `)
    .order('created_at', { ascending: false });
  
  // Apply filters
  if (searchParams.search) {
    query = query.or(`strain.ilike.%${searchParams.search}%,user_profile.email.ilike.%${searchParams.search}%`);
  }
  
  if (searchParams.stage) {
    query = query.eq('growth_stage', searchParams.stage);
  }
  
  if (searchParams.user) {
    query = query.eq('user_id', searchParams.user);
  }
  
  const { data: logs } = await query;
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-neutral-900 tracking-tight">
            All Grow Logs
          </h1>
          <p className="text-neutral-600 mt-2">
            {logs?.length || 0} total logs
          </p>
        </div>
        
        <ExportDataButton logs={logs} />
      </div>
      
      {/* Filters */}
      <AdminGrowLogsFilters />
      
      {/* Logs Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold">User</th>
                <th className="text-left px-6 py-4 text-sm font-semibold">Date</th>
                <th className="text-left px-6 py-4 text-sm font-semibold">Strain</th>
                <th className="text-left px-6 py-4 text-sm font-semibold">Stage</th>
                <th className="text-left px-6 py-4 text-sm font-semibold">Method</th>
                <th className="text-left px-6 py-4 text-sm font-semibold">Completeness</th>
                <th className="text-right px-6 py-4 text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {logs?.map(log => (
                <AdminLogRow key={log.id} log={log} />
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
```

## 7. Data Export Component

### File: `components/admin/ExportDataButton.tsx`

**Purpose:** Export all grow logs to CSV (anonymized)

```tsx
'use client';

export function ExportDataButton({ logs }: { logs?: any[] }) {
  const [loading, setLoading] = useState(false);
  
  async function handleExport() {
    setLoading(true);
    
    try {
      const supabase = createClient();
      
      // Fetch all logs if not provided
      const logsToExport = logs || (await supabase
        .from('grow_logs')
        .select('*')
        .order('created_at', { ascending: false })).data;
      
      if (!logsToExport || logsToExport.length === 0) {
        alert('No data to export');
        return;
      }
      
      // Generate CSV
      const csv = generateCSV(logsToExport);
      
      // Download file
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `spawnify-data-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      
    } catch (error) {
      console.error(error);
      alert('Failed to export data');
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <Button
      variant="primary"
      onClick={handleExport}
      loading={loading}
    >
      <Download className="w-4 h-4" />
      Export to CSV
    </Button>
  );
}

function generateCSV(logs: any[]): string {
  // CSV Headers (anonymized - no user_id, email, photos, personal notes)
  const headers = [
    'id',
    'growth_stage',
    'log_date',
    'strain',
    'substrate',
    'substrate_ratio',
    'inoculation_method',
    'inoculation_details',
    'growing_method',
    'tek_method',
    'temperature',
    'humidity',
    'ph_level',
    'weight',
    'light_hours_daily',
    'data_completeness_score',
    'created_at'
  ];
  
  // Build CSV rows
  const rows = logs.map(log => 
    headers.map(header => {
      const value = log[header];
      // Escape commas and quotes
      if (value === null || value === undefined) return '';
      const str = String(value);
      if (str.includes(',') || str.includes('"')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }).join(',')
  );
  
  return [headers.join(','), ...rows].join('\n');
}
```

## 8. Admin Stat Card

### File: `components/admin/AdminStatCard.tsx`

**Purpose:** Colored stat cards for admin dashboard

```tsx
interface AdminStatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: 'blue' | 'primary' | 'success' | 'purple';
}

const colorClasses = {
  blue: 'bg-blue-50 text-blue-600',
  primary: 'bg-primary-50 text-primary-600',
  success: 'bg-success-50 text-success-600',
  purple: 'bg-purple-50 text-purple-600'
};

export function AdminStatCard({ title, value, icon, color }: AdminStatCardProps) {
  return (
    <Card className="p-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-neutral-600 font-medium">{title}</p>
          <p className="text-3xl font-bold text-neutral-900 tracking-tight">
            {value}
          </p>
        </div>
        <div className={cn(
          "w-12 h-12 rounded-xl flex items-center justify-center",
          colorClasses[color]
        )}>
          {icon}
        </div>
      </div>
    </Card>
  );
}
```

## Implementation Checklist
- [ ] Create admin login page with role verification
- [ ] Create admin layout with navigation
- [ ] Implement admin dashboard with stats
- [ ] Create user management page
- [ ] Create user filters component
- [ ] Create grow logs management page
- [ ] Create admin filters component
- [ ] Implement CSV export functionality
- [ ] Test admin role verification
- [ ] Test non-admins are blocked from admin routes
- [ ] Test data export downloads correctly
- [ ] Verify anonymization in CSV (no user_id, email)
- [ ] Test filtering and sorting
- [ ] Ensure responsive design

## Security Considerations

### Admin Verification
- Verify admin role in middleware
- Verify admin role in layout (server component)
- Verify admin role in API routes (if any)
- Logout non-admins immediately after detection

### Data Export
- Anonymize user data (remove user_id, email, photos, personal notes)
- Include only scientific data
- Log export actions (future enhancement)

## RLS Policies Required

**Already implemented in Database Agent:**
- Admins can SELECT from user_profiles
- Admins can SELECT from grow_logs
- Admins can query admin_users table

## Manual Admin Creation

**After deployment:**
1. Sign up admin account via regular UI
2. Get user ID from Supabase Dashboard
3. Run SQL:
```sql
INSERT INTO admin_users (user_id, role)
VALUES ('your-user-uuid-here', 'admin');
```

## Success Criteria
- Only admins can access /admin routes
- Non-admins redirected to /dashboard
- Admin dashboard displays accurate statistics
- User management shows all users with sorting/filtering
- Grow logs management shows all logs
- CSV export works and data is anonymized
- All tables are responsive
- No console errors
- Accessible navigation

## Files to Create
1. `app/admin/login/page.tsx`
2. `app/admin/layout.tsx`
3. `app/admin/dashboard/page.tsx`
4. `app/admin/users/page.tsx`
5. `app/admin/grow-logs/page.tsx`
6. `components/admin/AdminNav.tsx`
7. `components/admin/AdminStatCard.tsx`
8. `components/admin/ExportDataButton.tsx`
9. `components/admin/UserFilters.tsx`
10. `components/admin/AdminGrowLogsFilters.tsx`

## Handoff to Other Agents
- **Authentication Agent:** Admin role verification implemented
- **Database Agent:** Using admin_users table and RLS policies
- **Design System Agent:** Using all UI components
- **Dashboard Agent:** Similar stat display patterns
