# Spawnify MVP - Calendar Grow Log Interface Agent

## Agent Purpose
Implement a premium calendar-based interface for tracking mushroom cultivation grow logs, providing users with an intuitive visual timeline of their cultivation journey.

## Project Context
- **Project**: Spawnify MVP
- **Stack**: Next.js 14, TypeScript, Supabase, Tailwind CSS
- **Integration**: Existing grow log system with AI companion features
- **Design Philosophy**: Luxury, intuitive, mobile-first

## Feature Scope

### Core Functionality
1. **Calendar View**
   - Monthly calendar display as primary grow log interface
   - Week view for detailed daily tracking
   - Day view for entry details
   - Smooth transitions between views
   - Toggle option to switch to traditional list/grid view

2. **Grow Log Entries**
   - Visual markers for log entries on calendar dates
   - Color-coded by grow stage (inoculation, colonization, fruiting)
   - Multi-grow support with distinct visual indicators
   - Quick-add functionality by clicking dates
   - Detailed entry modal/panel on click

3. **Visual Indicators**
   - Stage-based color coding (in chronological order):
     - Inoculation: Purple (#8B5CF6)
     - Colonisation: Blue (#3B82F6)
     - Triggering: Indigo (#6366F1)
     - Pinning: Teal (#14B8A6)
     - Fruiting: Green (#10B981)
   - Icons for entry types (observation, environment update, milestone)
   - Progress indicators for each active grow
   - Temperature/humidity quick stats on hover

4. **Multi-Grow Management**
   - Separate calendar for each active grow
   - Horizontal scroll/swipe between grow calendars
   - Tab navigation for switching between grows
   - Overview dashboard showing all grows at a glance
   - Quick jump to specific grow calendar
   - Visual header showing mushroom type and grow status

## Technical Implementation

### New Components

#### 1. `GrowLogCalendar` (Main Component)
```typescript
// Location: components/grow-logs/GrowLogCalendar.tsx
// Purpose: Main calendar container supporting separate calendar per grow

interface GrowLogCalendarProps {
  grows: Grow[];
  entries: GrowLogEntry[];
  currentGrowId?: string; // Which grow calendar to display
  onDateClick: (date: Date, growId: string) => void;
  onEntryClick: (entry: GrowLogEntry) => void;
  view: 'month' | 'week' | 'day';
  onViewChange: (view: CalendarView) => void;
  onGrowChange: (growId: string) => void;
}
```

#### 2. `CalendarGrid` 
```typescript
// Location: components/grow-logs/CalendarGrid.tsx
// Purpose: Renders calendar grid layout

interface CalendarGridProps {
  currentDate: Date;
  entries: GrowLogEntry[];
  grows: Grow[];
  view: CalendarView;
  onDateClick: (date: Date) => void;
  onEntryClick: (entry: GrowLogEntry) => void;
}
```

#### 3. `CalendarDayCell`
```typescript
// Location: components/grow-logs/CalendarDayCell.tsx
// Purpose: Individual day cell with entries

interface CalendarDayCellProps {
  date: Date;
  entries: GrowLogEntry[];
  grows: Grow[];
  isToday: boolean;
  isCurrentMonth: boolean;
  onClick: (date: Date) => void;
}
```

#### 4. `GrowLogEntryMarker`
```typescript
// Location: components/grow-logs/GrowLogEntryMarker.tsx
// Purpose: Visual marker for log entries on calendar

interface GrowLogEntryMarkerProps {
  entry: GrowLogEntry;
  grow: Grow;
  size: 'sm' | 'md' | 'lg';
  onClick: (entry: GrowLogEntry) => void;
}
```

#### 5. `CalendarHeader`
```typescript
// Location: components/grow-logs/CalendarHeader.tsx
// Purpose: Navigation, view controls

interface CalendarHeaderProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
  grow: Grow; // Current grow being displayed
}
```

#### 6. `GrowSelector`
```typescript
// Location: components/grow-logs/GrowSelector.tsx
// Purpose: Tab/swipe navigation between different grow calendars

interface GrowSelectorProps {
  grows: Grow[];
  currentGrowId: string;
  onGrowChange: (growId: string) => void;
  layout: 'tabs' | 'cards' | 'dropdown'; // Responsive layout
}
```

#### 7. `QuickAddEntryModal`
```typescript
// Location: components/grow-logs/QuickAddEntryModal.tsx
// Purpose: Quick entry creation from calendar

interface QuickAddEntryModalProps {
  isOpen: boolean;
  date: Date;
  growId: string; // Specific grow this entry is for
  onClose: () => void;
  onSubmit: (entry: Partial<GrowLogEntry>) => Promise<void>;
}
```

#### 8. `EntryDetailPanel`
```typescript
// Location: components/grow-logs/EntryDetailPanel.tsx
// Purpose: Detailed view of selected entry

interface EntryDetailPanelProps {
  entry: GrowLogEntry | null;
  grow: Grow;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (entry: GrowLogEntry) => void;
  onDelete: (entryId: string) => Promise<void>;
}
```

#### 9. `GrowOverviewDashboard`
```typescript
// Location: components/grow-logs/GrowOverviewDashboard.tsx
// Purpose: All-grows summary view before diving into specific calendar

interface GrowOverviewDashboardProps {
  grows: Grow[];
  onGrowSelect: (growId: string) => void;
  recentEntries: Map<string, GrowLogEntry[]>; // Last 3 entries per grow
}
```

#### 10. `ViewToggle`
```typescript
// Location: components/grow-logs/ViewToggle.tsx
// Purpose: Toggle between calendar view and traditional list/grid view

interface ViewToggleProps {
  currentView: 'calendar' | 'list' | 'grid';
  onViewChange: (view: 'calendar' | 'list' | 'grid') => void;
  position: 'header' | 'floating'; // Where to display the toggle
}
```

### Data Models

```typescript
// Extend existing GrowLogEntry if needed
interface GrowLogEntry {
  id: string;
  grow_id: string;
  user_id: string;
  date: Date;
  stage: 'inoculation' | 'colonisation' | 'triggering' | 'pinning' | 'fruiting';
  entry_type: 'observation' | 'environment' | 'milestone' | 'issue';
  title: string;
  description: string;
  temperature?: number;
  humidity?: number;
  images?: string[];
  created_at: Date;
  updated_at: Date;
}

interface CalendarViewState {
  view: 'month' | 'week' | 'day';
  currentDate: Date;
  currentGrowId: string | null; // Which grow calendar is being viewed
  selectedEntry: GrowLogEntry | null;
}
```

### Utility Functions

```typescript
// Location: lib/calendar-utils.ts

// Get calendar grid data (including previous/next month overflow)
export function getCalendarGrid(date: Date): Date[][];

// Get entries for specific date
export function getEntriesForDate(
  entries: GrowLogEntry[], 
  date: Date
): GrowLogEntry[];

// Get color for grow stage
export function getStageColor(stage: GrowStage): string;

// Format date for calendar display
export function formatCalendarDate(date: Date, view: CalendarView): string;

// Check if date has entries
export function hasEntries(entries: GrowLogEntry[], date: Date): boolean;

// Get grow progress percentage
export function getGrowProgress(grow: Grow, entries: GrowLogEntry[]): number;
```

### State Management

```typescript
// Location: hooks/useCalendarState.ts

export function useCalendarState(initialDate?: Date, initialGrowId?: string) {
  const [view, setView] = useState<CalendarView>('month');
  const [currentDate, setCurrentDate] = useState(initialDate || new Date());
  const [currentGrowId, setCurrentGrowId] = useState<string | null>(initialGrowId || null);
  const [selectedEntry, setSelectedEntry] = useState<GrowLogEntry | null>(null);
  
  // Navigation functions
  const goToToday = () => setCurrentDate(new Date());
  const goToNext = () => { /* logic */ };
  const goToPrevious = () => { /* logic */ };
  const switchGrow = (growId: string) => setCurrentGrowId(growId);
  
  return {
    view, setView,
    currentDate, setCurrentDate,
    currentGrowId, setCurrentGrowId,
    selectedEntry, setSelectedEntry,
    goToToday, goToNext, goToPrevious,
    switchGrow
  };
}
```

## Design Specifications

### Visual Design
- **Luxury Aesthetic**: Clean, spacious layout with subtle shadows
- **Color Palette**:
  - Background: Neutral grays (#F9FAFB, #F3F4F6)
  - Primary: Purple (#8B5CF6) for brand consistency
  - Stage colors (in order):
    - Inoculation: Purple (#8B5CF6)
    - Colonisation: Blue (#3B82F6)
    - Triggering: Indigo (#6366F1)
    - Pinning: Teal (#14B8A6)
    - Fruiting: Green (#10B981)
  - Text: Dark gray (#111827) with hierarchy
  
### Typography
- Headers: Font bold, 24px
- Day numbers: Font semibold, 14px
- Entry titles: Font medium, 12px
- Quick stats: Font regular, 11px

### Spacing
- Calendar grid gap: 1px
- Cell padding: 8px
- Entry marker spacing: 4px
- Modal padding: 24px

### Interactions
- Hover states on all interactive elements
- Smooth transitions (200ms ease-in-out)
- Entry markers scale on hover (1.05x)
- Modal slide-in animation from right
- Loading states for all async operations

### Responsive Breakpoints

**Mobile (<640px) - Recommended Approach**:
- **Card-based layout**: Each grow calendar as a swipeable card
- **Horizontal scroll**: Smooth swipe between different grow calendars
- **Compact month view**: 7-column grid optimized for mobile width
- **Collapsed entry display**: Show entry count badge, expand on tap
- **Bottom sheet modals**: Entry details slide up from bottom
- **Sticky navigation**: Grow tabs remain visible while scrolling
- **Current grow emphasis**: Active/most recent grows shown first
- **Quick stats bar**: Temperature/humidity visible without scrolling

**Tablet (640px-1024px)**:
- Side-by-side dual calendar view (2 grows)
- Tab navigation for additional grows
- Week view default for detailed tracking
- Compact controls in sidebar

**Desktop (>1024px)**:
- Multi-column layout showing 2-3 calendars simultaneously
- Full navigation and filter controls
- Month view default with easy view switching
- Hover interactions for quick insights

## Implementation Steps

### Phase 1: Core Calendar Structure
1. Create calendar grid component with basic layout
2. Implement date navigation (prev/next month)
3. Build CalendarHeader with view switching
4. Add responsive grid layout
5. Implement "today" highlighting

### Phase 2: Entry Display
1. Create GrowLogEntryMarker component
2. Implement entry clustering for dates with multiple entries
3. Add hover states with quick stats
4. Build entry click handling
5. Create EntryDetailPanel component

### Phase 3: Multi-Grow Support
1. Create GrowSelector component with tab navigation
2. Implement horizontal swipe between grow calendars
3. Build grow overview dashboard
4. Add calendar transition animations
5. Implement grow-specific header display
6. Create responsive layout (tabs → cards → dropdown)

### Phase 4: Quick Add Functionality
1. Build QuickAddEntryModal component
2. Implement date click handler
3. Add form validation
4. Connect to Supabase for entry creation
5. Add optimistic UI updates

### Phase 5: Advanced Features
1. Build GrowOverviewDashboard component
2. Week view implementation per grow
3. Day view with detailed timeline
4. Search/filter by entry type within grow
5. Export functionality per grow (PDF/CSV)
6. AI insights integration on calendar
7. Compare mode (side-by-side calendars on desktop)

### Phase 6: Polish & Performance
1. Optimize re-renders with React.memo
2. Implement virtualization for large datasets
3. Add loading skeletons
4. Error boundary implementation
5. Accessibility audit (keyboard navigation, ARIA labels)

## Data Fetching Strategy

```typescript
// Location: hooks/useGrowLogCalendar.ts

export function useGrowLogCalendar(userId: string, growId: string | null) {
  // Fetch all user's grows for selector
  const { data: grows } = useQuery({
    queryKey: ['grows', userId],
    queryFn: () => fetchUserGrows(userId)
  });
  
  // Fetch entries only for current grow being viewed
  const { data: entries } = useQuery({
    queryKey: ['growLogEntries', growId, currentMonth],
    queryFn: () => fetchMonthEntriesForGrow(growId, currentMonth),
    enabled: !!growId
  });
  
  // Prefetch adjacent months for current grow
  usePrefetchQuery({
    queryKey: ['growLogEntries', growId, nextMonth],
    queryFn: () => fetchMonthEntriesForGrow(growId, nextMonth),
    enabled: !!growId
  });
  
  return { grows, entries, isLoading, error };
}
```

## Supabase Integration

### Queries
```sql
-- Get entries for specific grow in date range
SELECT e.*, g.name as grow_name, g.mushroom_type, g.stage
FROM grow_log_entries e
JOIN grows g ON e.grow_id = g.id
WHERE e.grow_id = $1
  AND e.date >= $2
  AND e.date <= $3
ORDER BY e.date ASC;

-- Get entry count per day for specific grow
SELECT date_trunc('day', date) as day, COUNT(*) as entry_count
FROM grow_log_entries
WHERE grow_id = $1
  AND date >= $2
  AND date <= $3
GROUP BY day;

-- Get overview stats for all user grows (for dashboard)
SELECT 
  g.id,
  g.name,
  g.mushroom_type,
  g.stage,
  COUNT(e.id) as total_entries,
  MAX(e.date) as last_entry_date
FROM grows g
LEFT JOIN grow_log_entries e ON g.id = e.grow_id
WHERE g.user_id = $1
  AND g.status = 'active'
GROUP BY g.id;
```

### Real-time Subscriptions
```typescript
// Subscribe to grow log changes
supabase
  .channel('grow_log_changes')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'grow_log_entries' },
    (payload) => {
      // Update calendar state
      queryClient.invalidateQueries(['growLogEntries']);
    }
  )
  .subscribe();
```

## Testing Requirements

### Unit Tests
- Calendar date calculation utilities
- Entry filtering logic
- Date navigation functions
- Stage color mapping

### Integration Tests
- Entry creation from calendar
- Entry update flow
- Multi-grow filtering
- View switching

### E2E Tests
- Complete user journey: view calendar → click date → add entry → view entry
- Multi-grow management workflow
- Mobile responsive interactions

## Performance Considerations

1. **Virtualization**: For users with 100+ entries
2. **Lazy Loading**: Load entry details on demand
3. **Optimistic Updates**: Immediate UI feedback
4. **Caching**: React Query for intelligent data caching
5. **Debouncing**: Filter/search inputs
6. **Image Optimization**: Lazy load entry images

## Accessibility Requirements

- Keyboard navigation (arrow keys for date navigation)
- Screen reader friendly (ARIA labels on all interactive elements)
- Focus management in modals
- High contrast mode support
- Reduced motion preferences respected

## Future Enhancements

1. **Side-by-Side Comparison**: View 2-3 grow calendars simultaneously on desktop
2. **Recurring Entries**: Schedule regular observations across all grows
3. **Print View**: Printer-friendly calendar export per grow
4. **AI Predictions**: Suggest optimal harvest dates on calendar based on stage progression
5. **Sync with External Calendars**: iCal/Google Calendar export per grow
6. **Weather Overlay**: Show historical weather data correlation with growth
7. **Batch Operations**: Apply actions to multiple grows' calendars at once
8. **Calendar Templates**: Pre-populate calendars based on mushroom species
9. **Growth Timeline**: Visual timeline showing all grows' stages side-by-side
10. **Calendar Sharing**: Share specific grow calendar with collaborators

## Success Metrics

- Calendar view engagement rate
- Entry creation rate increase vs. traditional view
- Time to create new entry (should decrease)
- User retention (calendar view correlation)
- Mobile vs. desktop usage patterns

## File Structure
```
components/
  grow-logs/
    GrowLogCalendar.tsx           # Main container (per-grow)
    CalendarGrid.tsx              # Grid layout
    CalendarHeader.tsx            # Navigation & controls
    CalendarDayCell.tsx           # Individual day cell
    GrowLogEntryMarker.tsx        # Entry visual marker
    GrowSelector.tsx              # Tab/card navigation between grows
    QuickAddEntryModal.tsx        # Quick add modal
    EntryDetailPanel.tsx          # Entry details
    GrowOverviewDashboard.tsx     # All grows at-a-glance view
    ViewToggle.tsx                # Switch between calendar/list/grid
    CalendarLegend.tsx            # Stage color/icon legend
    
hooks/
  useCalendarState.ts             # Calendar state management
  useGrowLogCalendar.ts           # Data fetching per grow
  
lib/
  calendar-utils.ts               # Date utilities
  grow-log-utils.ts               # Entry helpers
  
types/
  calendar.ts                     # Calendar types
```

## Notes for AI Agent

- Prioritize mobile-first responsive design
- Maintain luxury aesthetic with subtle animations
- Ensure all interactions feel instant (optimistic updates)
- Follow existing Spawnify component patterns
- Use Tailwind CSS for all styling
- Implement proper TypeScript types throughout
- Add comprehensive error handling
- Include loading states for all async operations
- Test with multiple concurrent grows
- Ensure accessibility compliance

## Integration Points

- Connects to existing `grows` and `grow_log_entries` Supabase tables
- Uses existing authentication context
- Integrates with AI companion for insights (future)
- Shares components with traditional grow log view
- Links to individual grow detail pages

---

**Agent Execution Notes**: 
- Begin with Phase 1 to establish foundation
- Request user feedback after each phase
- Maintain consistent code style with existing codebase
- Document all new API endpoints
- Create Storybook stories for all new components
