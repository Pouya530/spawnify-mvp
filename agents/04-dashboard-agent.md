# Dashboard Agent

## Role
You are the Dashboard Agent responsible for implementing the user dashboard, statistics display, and recent activity features for Spawnify MVP.

## Primary Objectives
1. Create the main dashboard home page
2. Display user statistics (total logs, in progress, completed, yield)
3. Show recent activity table
4. Implement empty states for new users
5. Create dashboard navigation
6. Build stat card components

## Tech Stack
- Next.js 14.2+ (App Router)
- React Server Components
- Supabase client
- Lucide React icons
- Tailwind CSS

## Dashboard Structure

### Page Location: `app/(dashboard)/page.tsx`

### Layout: `app/(dashboard)/layout.tsx`

**Features:**
- Persistent navigation (DashboardNav component)
- Main content area
- Responsive container

```tsx
export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <DashboardNav />
      <main className="container mx-auto px-6 py-8 md:px-8 lg:px-12">
        {children}
      </main>
    </div>
  );
}
```

## Dashboard Navigation Component

### File: `components/dashboard/DashboardNav.tsx`

**Purpose:** Sticky top navigation for dashboard pages

**Elements:**
- Logo (left)
- Navigation links (center/left)
  - Dashboard
  - Grow Logs
  - Settings
- User section (right)
  - User email
  - Tier badge
  - Logout button

**Implementation:**
```tsx
export async function DashboardNav() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('verification_level, total_points')
    .eq('id', user?.id)
    .single();
  
  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-neutral-200">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/dashboard" className="text-xl font-bold text-neutral-900">
          Spawnify
        </Link>
        
        {/* Navigation Links */}
        <div className="flex gap-6">
          <NavLink href="/dashboard" icon={<Home />}>Dashboard</NavLink>
          <NavLink href="/dashboard/grow-logs" icon={<List />}>Grow Logs</NavLink>
          <NavLink href="/dashboard/settings" icon={<Settings />}>Settings</NavLink>
        </div>
        
        {/* User Section */}
        <div className="flex items-center gap-4">
          <span className="text-sm text-neutral-600">{user?.email}</span>
          <Badge variant={profile?.verification_level || 'bronze'}>
            {profile?.verification_level?.toUpperCase()}
          </Badge>
          <LogoutButton />
        </div>
      </div>
    </nav>
  );
}
```

**NavLink Component:**
```tsx
function NavLink({ href, icon, children }) {
  const pathname = usePathname();
  const isActive = pathname === href;
  
  return (
    <Link 
      href={href}
      className={cn(
        "flex items-center gap-2 text-sm transition-colors",
        isActive ? "text-primary-600 font-medium" : "text-neutral-600 hover:text-neutral-900"
      )}
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      {children}
    </Link>
  );
}
```

## Dashboard Home Page

### File: `app/(dashboard)/page.tsx`

**Purpose:** Main dashboard view with stats and recent activity

**Data Requirements:**
- User profile (for points/tier)
- Grow logs count (total, in progress, completed)
- Total yield (sum of weights)
- Recent 10 logs

**Implementation:**
```tsx
export default async function DashboardPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Fetch user profile
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user?.id)
    .single();
  
  // Fetch all user's logs
  const { data: allLogs } = await supabase
    .from('grow_logs')
    .select('*')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false });
  
  // Calculate stats
  const stats = calculateDashboardStats(allLogs || []);
  
  // Get recent logs (last 10)
  const recentLogs = allLogs?.slice(0, 10) || [];
  
  return (
    <div className="space-y-12">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-neutral-900 tracking-tight">
          Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}
        </h1>
        <p className="text-neutral-600 mt-2">
          Track your mushroom cultivation journey
        </p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Logs"
          value={stats.totalLogs}
          icon={<FileText />}
          trend={stats.totalLogs > 0 ? 'neutral' : undefined}
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          icon={<Activity />}
          trend={stats.inProgress > 0 ? 'positive' : undefined}
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon={<CheckCircle />}
          trend="neutral"
        />
        <StatCard
          title="Total Yield"
          value={`${stats.totalYield}g`}
          icon={<TrendingUp />}
          trend={stats.totalYield > 0 ? 'positive' : undefined}
        />
      </div>
      
      {/* Recent Activity or Empty State */}
      {recentLogs.length > 0 ? (
        <RecentActivityTable logs={recentLogs} />
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
```

## Stats Calculation Utility

### File: `lib/utils/stats.ts`

```tsx
export function calculateDashboardStats(logs: GrowLog[]) {
  const totalLogs = logs.length;
  
  const inProgress = logs.filter(
    log => log.growth_stage !== 'Harvest'
  ).length;
  
  const completed = logs.filter(
    log => log.growth_stage === 'Harvest'
  ).length;
  
  const totalYield = logs.reduce(
    (sum, log) => sum + (log.weight || 0),
    0
  );
  
  return {
    totalLogs,
    inProgress,
    completed,
    totalYield: Math.round(totalYield * 10) / 10 // 1 decimal place
  };
}
```

## StatCard Component

### File: `components/dashboard/StatCard.tsx`

**Purpose:** Display individual stat with icon and optional trend

**Props:**
```tsx
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: 'positive' | 'negative' | 'neutral';
}
```

**Implementation:**
```tsx
export function StatCard({ title, value, icon, trend }: StatCardProps) {
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
          "bg-primary-50 text-primary-600"
        )}>
          {icon}
        </div>
      </div>
      
      {trend && (
        <div className={cn(
          "mt-4 text-xs font-medium",
          trend === 'positive' && "text-success-600",
          trend === 'negative' && "text-red-600",
          trend === 'neutral' && "text-neutral-500"
        )}>
          {trend === 'positive' && "↗ Growing"}
          {trend === 'negative' && "↘ Decreasing"}
          {trend === 'neutral' && "→ Stable"}
        </div>
      )}
    </Card>
  );
}
```

## Recent Activity Table

### File: `components/dashboard/RecentActivityTable.tsx`

**Purpose:** Display last 10 grow logs in table format

**Columns:**
- Date (formatted)
- Strain
- Stage (with badge)
- Method
- Completeness % (with progress bar)

**Implementation:**
```tsx
interface RecentActivityTableProps {
  logs: GrowLog[];
}

export function RecentActivityTable({ logs }: RecentActivityTableProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">
        Recent Activity
      </h2>
      
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-900">
                  Date
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-900">
                  Strain
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-900">
                  Stage
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-900">
                  Method
                </th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-neutral-900">
                  Completeness
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {logs.map(log => (
                <TableRow key={log.id} log={log} />
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function TableRow({ log }: { log: GrowLog }) {
  return (
    <tr 
      className="hover:bg-neutral-50 cursor-pointer transition-colors"
      onClick={() => router.push(`/dashboard/grow-logs/${log.id}`)}
    >
      <td className="px-6 py-4 text-sm text-neutral-900">
        {format(new Date(log.log_date), 'MMM dd, yyyy')}
      </td>
      <td className="px-6 py-4 text-sm text-neutral-900 font-medium">
        {log.strain}
      </td>
      <td className="px-6 py-4">
        <StageBadge stage={log.growth_stage} />
      </td>
      <td className="px-6 py-4 text-sm text-neutral-600">
        {log.growing_method}
      </td>
      <td className="px-6 py-4">
        <CompletenessIndicator score={log.data_completeness_score} />
      </td>
    </tr>
  );
}
```

## StageBadge Component

### File: `components/dashboard/StageBadge.tsx`

**Purpose:** Display growth stage with color coding

```tsx
const stageColors = {
  'Inoculation': 'bg-blue-100 text-blue-700 border-blue-200',
  'Colonization': 'bg-purple-100 text-purple-700 border-purple-200',
  'Fruiting': 'bg-primary-100 text-primary-700 border-primary-200',
  'Harvest': 'bg-success-100 text-success-700 border-success-200'
};

export function StageBadge({ stage }: { stage: string }) {
  return (
    <span className={cn(
      "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border",
      stageColors[stage as keyof typeof stageColors] || 'bg-neutral-100 text-neutral-700'
    )}>
      {stage}
    </span>
  );
}
```

## CompletenessIndicator Component

### File: `components/dashboard/CompletenessIndicator.tsx`

**Purpose:** Visual progress bar for data completeness

```tsx
export function CompletenessIndicator({ score }: { score: number }) {
  const percentage = score;
  const color = percentage >= 80 ? 'bg-success-500' : 'bg-primary-500';
  
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-2 bg-neutral-200 rounded-full overflow-hidden">
        <div 
          className={cn("h-full transition-all", color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="text-sm font-medium text-neutral-900 w-12 text-right">
        {percentage}%
      </span>
    </div>
  );
}
```

## Empty State Component

### File: `components/dashboard/EmptyState.tsx`

**Purpose:** Show when user has 0 grow logs

```tsx
export function EmptyState() {
  return (
    <Card className="p-12 text-center">
      <div className="max-w-md mx-auto space-y-6">
        {/* Icon */}
        <div className="w-20 h-20 mx-auto rounded-full bg-neutral-100 flex items-center justify-center">
          <FileText className="w-10 h-10 text-neutral-400" />
        </div>
        
        {/* Text */}
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-neutral-900">
            No grow logs yet
          </h3>
          <p className="text-neutral-600">
            Start tracking your mushroom grows to see your data here.
          </p>
        </div>
        
        {/* CTA Button */}
        <Button 
          variant="primary" 
          size="large"
          onClick={() => router.push('/dashboard/grow-logs/new')}
        >
          Create Your First Log
        </Button>
        
        {/* Scientific Banner */}
        <div className="mt-8 p-4 bg-primary-50 border border-primary-200 rounded-xl">
          <p className="text-sm text-primary-900">
            🔬 <strong>Help advance mushroom science!</strong>
            <br />
            Your detailed logs contribute to AI analysis for optimal growing conditions.
          </p>
        </div>
      </div>
    </Card>
  );
}
```

## Responsive Design

### Mobile (375px - 767px)
- Stats grid: 1 column
- Table: Horizontal scroll
- Navigation: Consider hamburger menu (future)

### Tablet (768px - 1023px)
- Stats grid: 2 columns
- Table: Full width, all columns visible

### Desktop (1024px+)
- Stats grid: 4 columns
- Table: Full width, generous spacing

## Loading States

### Dashboard Loading
```tsx
export default function DashboardLoading() {
  return (
    <div className="space-y-12">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-10 w-64 bg-neutral-200 rounded animate-pulse" />
        <div className="h-6 w-48 bg-neutral-200 rounded animate-pulse" />
      </div>
      
      {/* Stats Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1,2,3,4].map(i => (
          <div key={i} className="h-32 bg-neutral-200 rounded-2xl animate-pulse" />
        ))}
      </div>
      
      {/* Table Skeleton */}
      <div className="h-96 bg-neutral-200 rounded-2xl animate-pulse" />
    </div>
  );
}
```

**File:** `app/(dashboard)/loading.tsx`

## Error States

### Dashboard Error
```tsx
export default function DashboardError({ error, reset }) {
  return (
    <Card className="p-12 text-center">
      <div className="max-w-md mx-auto space-y-6">
        <div className="w-20 h-20 mx-auto rounded-full bg-red-50 flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-red-600" />
        </div>
        
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-neutral-900">
            Something went wrong
          </h3>
          <p className="text-neutral-600">
            We couldn't load your dashboard. Please try again.
          </p>
        </div>
        
        <Button onClick={reset}>Try Again</Button>
      </div>
    </Card>
  );
}
```

**File:** `app/(dashboard)/error.tsx`

## Date Formatting

### Install date-fns
```bash
npm install date-fns
```

### Usage
```tsx
import { format } from 'date-fns';

// Format date
format(new Date(log.log_date), 'MMM dd, yyyy') // "Dec 13, 2024"
format(new Date(log.created_at), 'PPp') // "Dec 13, 2024, 3:45 PM"
```

## Implementation Checklist
- [ ] Create dashboard layout with navigation
- [ ] Implement DashboardNav component
- [ ] Create StatCard component
- [ ] Create StageBadge component
- [ ] Create CompletenessIndicator component
- [ ] Create RecentActivityTable component
- [ ] Create EmptyState component
- [ ] Implement stats calculation
- [ ] Add loading states
- [ ] Add error states
- [ ] Test with 0 logs (empty state)
- [ ] Test with multiple logs (table display)
- [ ] Test responsive design on all breakpoints
- [ ] Verify navigation works
- [ ] Test logout functionality

## Data Fetching Strategy

### Server Components (Recommended)
- Fetch data on server
- No loading spinners needed
- Better SEO
- Faster initial load

### Client Components (When Needed)
- Interactive features
- Real-time updates
- User input handling

## Performance Optimization

### Query Optimization
```tsx
// Good: Select only needed fields
const { data } = await supabase
  .from('grow_logs')
  .select('id, log_date, strain, growth_stage, growing_method, data_completeness_score')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(10);
```

### Caching Strategy
- Server components cache by default
- Use `revalidate` for time-based revalidation
- Use `revalidatePath` for on-demand revalidation

## Success Criteria
- Dashboard loads in <1 second
- Stats display correctly
- Recent activity table shows correct data
- Empty state appears for new users
- Navigation works smoothly
- Responsive on all devices
- Loading and error states work
- No console errors
- Accessible (keyboard navigation, ARIA labels)

## Files to Create
1. `app/(dashboard)/layout.tsx`
2. `app/(dashboard)/page.tsx`
3. `app/(dashboard)/loading.tsx`
4. `app/(dashboard)/error.tsx`
5. `components/dashboard/DashboardNav.tsx`
6. `components/dashboard/StatCard.tsx`
7. `components/dashboard/StageBadge.tsx`
8. `components/dashboard/CompletenessIndicator.tsx`
9. `components/dashboard/RecentActivityTable.tsx`
10. `components/dashboard/EmptyState.tsx`
11. `lib/utils/stats.ts`

## Handoff to Other Agents
- **Design System Agent:** Uses all UI components
- **Grow Log Agent:** Links to grow log pages
- **Authentication Agent:** Uses session data
- **Database Agent:** Uses types and queries
