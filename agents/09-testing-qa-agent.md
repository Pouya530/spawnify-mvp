# Testing & QA Agent

## Role
You are the Testing & QA Agent responsible for ensuring all features work correctly, handling edge cases, and maintaining quality standards across Spawnify MVP.

## Primary Objectives
1. Create comprehensive testing checklist
2. Test all user flows end-to-end
3. Verify security measures
4. Test responsive design across devices
5. Ensure accessibility compliance
6. Validate error handling
7. Test performance benchmarks

## Testing Categories

### 1. Authentication Testing

#### User Signup Flow
- [ ] **Valid signup**
  - Enter valid email and password (8+ chars)
  - User profile created automatically
  - User logged in and redirected to /dashboard
  - Session persists after browser close

- [ ] **Invalid signup**
  - Existing email → Error: "Email already registered"
  - Weak password (<8 chars) → Error: "Password must be at least 8 characters"
  - Invalid email format → Error: "Please enter a valid email address"
  - Empty fields → Inline validation errors
  - Network error → Error: "Connection lost. Please try again."

- [ ] **Edge cases**
  - Email with special characters
  - Very long email
  - Password with special characters
  - Multiple rapid submissions (should be prevented)

#### User Login Flow
- [ ] **Valid login**
  - Correct email + password → Logged in, redirect to /dashboard
  - Session cookie set correctly
  - User data loaded in dashboard

- [ ] **Invalid login**
  - Wrong password → Error: "Invalid email or password"
  - Non-existent email → Error: "Invalid email or password"
  - Empty fields → Validation errors
  - SQL injection attempts → Safely handled

- [ ] **Edge cases**
  - Login while already logged in
  - Login after logout
  - Expired session handling

#### Admin Login Flow
- [ ] **Admin user login**
  - Valid admin credentials → Redirect to /admin/dashboard
  - Admin role verified
  - Can access all admin routes

- [ ] **Non-admin login**
  - Valid non-admin credentials → Signed out, error shown
  - Access denied message
  - Redirected appropriately

- [ ] **Edge cases**
  - Admin accessing user routes
  - User accessing admin routes → Redirect to /dashboard

#### Logout Flow
- [ ] Session cleared
- [ ] Cookies removed
- [ ] Redirected to /login
- [ ] Cannot access protected routes after logout

### 2. Dashboard Testing

#### Dashboard Home
- [ ] **With logs**
  - Stats display correct counts
  - Total Logs = actual count
  - In Progress = logs where stage ≠ 'Harvest'
  - Completed = logs where stage = 'Harvest'
  - Total Yield = sum of all weights
  - Recent activity shows last 10 logs
  - Table sortable and clickable

- [ ] **Without logs (empty state)**
  - Empty state displays
  - "Create Your First Log" button visible
  - Scientific banner shows
  - No errors in console

- [ ] **Navigation**
  - All nav links work
  - Logo links to /dashboard
  - Tier badge displays correctly
  - User email shows
  - Logout works

- [ ] **Loading states**
  - Skeleton loaders display
  - No flash of missing content

- [ ] **Error states**
  - Network error → Error UI shown
  - Retry button works

### 3. Grow Log Testing

#### Create New Log
- [ ] **Required fields**
  - Cannot submit without: growth_stage, log_date, strain, substrate, inoculation_method, growing_method
  - Inline errors show for missing fields
  - Form disabled during submission

- [ ] **Optional fields**
  - Can submit with only required fields
  - Optional fields increase completeness score
  - Completeness indicator updates in real-time

- [ ] **Completeness calculation**
  - Required only: 60%
  - + substrate_ratio: 70%
  - + inoculation_details: 80%
  - + light_hours_daily: 90%
  - + tek_method: 100%
  - + tek_notes >100 chars: bonus +15%
  - + notes >50 chars: bonus +5%
  - + photos: bonus +10%
  - Max score: 100%

- [ ] **Photo upload**
  - Drag & drop works
  - File picker works
  - Multiple files accepted
  - PNG/JPG/JPEG only
  - Files >10MB rejected with error
  - Preview thumbnails display
  - Remove photo works
  - Photos upload to Supabase Storage
  - Public URLs generated correctly

- [ ] **Form submission**
  - Loading state shows
  - Success → Redirect to /dashboard/grow-logs
  - Points awarded correctly (10 or 25 based on completeness)
  - User tier updated if threshold reached
  - Database record created
  - Photos saved to storage

- [ ] **Edge cases**
  - Very long text in notes
  - Special characters in text fields
  - Decimal values in number fields
  - Invalid date formats
  - Upload non-image file → Rejected
  - Network error during upload → Error message

#### View Grow Log
- [ ] All fields display correctly
- [ ] Photos render in gallery
- [ ] Stage badge colored correctly
- [ ] Breadcrumb navigation works
- [ ] Edit button works
- [ ] Delete button shows confirmation

#### Edit Grow Log
- [ ] Form pre-filled with existing data
- [ ] Can modify all fields
- [ ] Save updates database
- [ ] Completeness recalculated
- [ ] Points adjusted if needed
- [ ] Redirect to log view after save

#### Delete Grow Log
- [ ] Confirmation dialog appears
- [ ] Cancel keeps log
- [ ] Confirm deletes log
- [ ] Photos deleted from storage
- [ ] User points recalculated (optional: may keep points)
- [ ] Redirect to logs list

#### Logs List
- [ ] All logs display in table
- [ ] Sorted by date (newest first)
- [ ] Filter by stage works
- [ ] Search by strain works
- [ ] Pagination works (20 per page)
- [ ] Click row → Navigate to log detail
- [ ] Empty state if no logs

### 4. Settings Testing

#### Profile Settings
- [ ] Email displayed (read-only)
- [ ] Can edit full name
- [ ] Save updates database
- [ ] Success message shows
- [ ] Page refreshes with new data
- [ ] Cancel restores original value

#### Password Change
- [ ] New password validated (min 8 chars)
- [ ] Confirm password must match
- [ ] Success message shows
- [ ] Form cleared after success
- [ ] Can still login with new password
- [ ] Error handling for weak passwords

#### Gamification Stats
- [ ] Current tier displays correctly
- [ ] Total points accurate
- [ ] Progress bar shows correct percentage
- [ ] Points to next tier calculated correctly
- [ ] Tier benefits listed
- [ ] Bronze → Silver at 100 points
- [ ] Silver → Gold at 500 points

#### Data Privacy
- [ ] Privacy info displayed
- [ ] Opt-in checkbox shown (disabled in MVP)
- [ ] Privacy policy link works

#### Account Info
- [ ] Account created date shows
- [ ] User ID shows (truncated)
- [ ] Email verified status shows
- [ ] Last sign in shows

### 5. Admin Testing

#### Admin Login
- [ ] Admin can login at /admin/login
- [ ] Admin role verified
- [ ] Non-admin blocked and logged out
- [ ] Redirect to /admin/dashboard

#### Admin Dashboard
- [ ] Total users count accurate
- [ ] Total logs count accurate
- [ ] Active users (30d) calculated correctly
- [ ] Average completeness calculated correctly
- [ ] Quick action buttons work

#### User Management
- [ ] All users listed in table
- [ ] Search by email works
- [ ] Filter by tier works
- [ ] Sort by points works
- [ ] Sort by join date works
- [ ] "View Logs" button works

#### Grow Logs Management
- [ ] All logs from all users shown
- [ ] User email displayed
- [ ] Filter by stage works
- [ ] Filter by user works
- [ ] Search by strain works
- [ ] Can view any log detail

#### Data Export
- [ ] CSV download works
- [ ] Filename includes date
- [ ] Data is anonymized (no user_id, email, photos, notes)
- [ ] All scientific fields included
- [ ] CSV formatted correctly
- [ ] Can open in Excel/Google Sheets

### 6. Security Testing

#### Row Level Security (RLS)
- [ ] Users can only view own logs
- [ ] Users cannot view other users' logs
- [ ] Users can only edit/delete own logs
- [ ] Admins can view all logs
- [ ] Direct database queries respect RLS

#### Authentication
- [ ] Cannot access /dashboard without login
- [ ] Cannot access /admin without admin role
- [ ] Session expires after 7 days
- [ ] Logout clears session completely
- [ ] Password never exposed to client

#### File Upload
- [ ] Only image files accepted
- [ ] File size limit enforced (10MB)
- [ ] Users can only delete own photos
- [ ] Photos stored in user-specific folders
- [ ] Public URLs work but RLS applies to deletion

#### Input Validation
- [ ] SQL injection attempts blocked
- [ ] XSS attempts sanitized
- [ ] CSRF tokens validated (Supabase handles)
- [ ] Email validation works
- [ ] Number field constraints enforced

### 7. Responsive Design Testing

#### Mobile (375px - 767px)
- [ ] Landing page readable and navigable
- [ ] Forms usable with stacked fields
- [ ] Tables scroll horizontally
- [ ] Buttons are tap-friendly (44x44px min)
- [ ] Navigation accessible
- [ ] Images scale appropriately

#### Tablet (768px - 1023px)
- [ ] Two-column layouts work
- [ ] Tables fit on screen
- [ ] Forms use available width
- [ ] Navigation displays fully

#### Desktop (1024px+)
- [ ] Multi-column layouts display
- [ ] Containers use max-width
- [ ] Generous whitespace
- [ ] All elements visible without scrolling (hero)

### 8. Accessibility Testing

#### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Forms navigable with keyboard
- [ ] Buttons activatable with Enter/Space
- [ ] Focus indicators visible
- [ ] Skip links available (optional)

#### Screen Readers
- [ ] ARIA labels on icons
- [ ] Form labels associated with inputs
- [ ] Error messages announced
- [ ] Semantic HTML used
- [ ] Alt text on images

#### Color Contrast
- [ ] Text contrast ratio ≥4.5:1 (WCAG AA)
- [ ] Button text readable
- [ ] Links distinguishable
- [ ] Error messages visible

#### Visual Indicators
- [ ] Don't rely solely on color
- [ ] Icons have text labels
- [ ] Loading states clear
- [ ] Success/error states obvious

### 9. Performance Testing

#### Page Load Times
- [ ] Landing page <3s initial load
- [ ] Dashboard <1s after login
- [ ] Navigation <1s between pages
- [ ] Form submission <2s

#### Database Queries
- [ ] Logs list loads quickly (even with 100+ logs)
- [ ] Dashboard stats calculate quickly
- [ ] Filters apply instantly
- [ ] No N+1 query problems

#### Image Optimization
- [ ] Photos compressed appropriately
- [ ] Next.js Image component used
- [ ] Lazy loading enabled
- [ ] Thumbnails generated (optional)

#### Bundle Size
- [ ] JavaScript bundle optimized
- [ ] Code splitting working
- [ ] Tree shaking enabled
- [ ] No duplicate dependencies

### 10. Browser Compatibility Testing

#### Chrome (Latest)
- [ ] All features work
- [ ] No console errors
- [ ] CSS renders correctly

#### Safari (Latest)
- [ ] All features work
- [ ] Date pickers work
- [ ] File upload works
- [ ] No webkit-specific issues

#### Firefox (Latest)
- [ ] All features work
- [ ] Forms work correctly
- [ ] No Firefox-specific bugs

#### Mobile Safari (iOS)
- [ ] Touch interactions work
- [ ] Forms usable
- [ ] No iOS-specific bugs

#### Chrome Mobile (Android)
- [ ] Touch interactions work
- [ ] Forms usable
- [ ] No Android-specific bugs

## Testing Tools & Methods

### Manual Testing
- Browser DevTools
- Lighthouse audit
- WAVE accessibility checker
- Multiple devices (phone, tablet, laptop)

### Automated Testing (Optional for MVP)
```bash
# Can add in Phase 2
npm install -D vitest @testing-library/react
```

### Database Testing
```sql
-- Test RLS policies
SET ROLE authenticated;
SELECT * FROM grow_logs; -- Should only see own logs

SET ROLE admin;
SELECT * FROM grow_logs; -- Should see all logs
```

### Performance Testing
```bash
# Lighthouse CI
npx lighthouse https://spawnify.vercel.app --view
```

## Bug Reporting Template

```markdown
### Bug Title
[Short description]

### Priority
- [ ] Critical (blocks core functionality)
- [ ] High (major feature broken)
- [ ] Medium (minor feature broken)
- [ ] Low (cosmetic issue)

### Steps to Reproduce
1. 
2. 
3. 

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happens]

### Screenshots
[If applicable]

### Environment
- Browser: 
- OS: 
- Screen size: 

### Console Errors
[If any]
```

## Pre-Launch Checklist

### Functionality
- [ ] All user flows tested
- [ ] All admin flows tested
- [ ] No critical bugs
- [ ] Error handling works
- [ ] Loading states work

### Security
- [ ] RLS policies tested
- [ ] Authentication secure
- [ ] File uploads secure
- [ ] No sensitive data exposed
- [ ] HTTPS enforced

### Design
- [ ] Matches design spec
- [ ] Responsive on all devices
- [ ] Animations smooth
- [ ] No layout shifts
- [ ] Icons display correctly

### Performance
- [ ] Page load <3s
- [ ] No slow queries
- [ ] Images optimized
- [ ] No console errors

### Accessibility
- [ ] Keyboard navigable
- [ ] Screen reader friendly
- [ ] Color contrast met
- [ ] ARIA labels present

### Content
- [ ] No typos
- [ ] Copy is clear
- [ ] Error messages helpful
- [ ] Success messages clear

### Deployment
- [ ] Environment variables set
- [ ] Database migrated
- [ ] Storage bucket configured
- [ ] Admin user created
- [ ] DNS configured (if custom domain)

## Post-Launch Monitoring

### Week 1
- [ ] Monitor error logs
- [ ] Check Supabase usage
- [ ] Review user feedback
- [ ] Fix critical bugs immediately

### Week 2-4
- [ ] Analyze user behavior
- [ ] Identify drop-off points
- [ ] Gather feature requests
- [ ] Plan improvements

## Success Criteria

- **Zero critical bugs** in production
- **All core flows** work end-to-end
- **Security** measures verified
- **Responsive** on all devices
- **Accessible** (WCAG AA)
- **Fast** (<3s load times)
- **No data loss** or corruption

## Files to Reference

Testing should cover all features in:
1. Authentication Agent
2. Dashboard Agent
3. Grow Log Agent
4. Settings Agent
5. Admin Agent
6. Landing Page Agent
7. Database Agent
8. Design System Agent

## Handoff to Deployment

Once all tests pass:
- [ ] Create deployment checklist
- [ ] Document known issues
- [ ] Prepare rollback plan
- [ ] Set up monitoring
- [ ] Ready for production deployment
