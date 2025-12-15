# Grow Log Agent

## Role
You are the Grow Log Agent responsible for implementing all grow log features including creation, editing, viewing, listing, and photo upload functionality for Spawnify MVP.

## Primary Objectives
1. Create comprehensive grow log creation form
2. Implement photo upload to Supabase Storage
3. Calculate data completeness scores in real-time
4. Build grow log viewing and editing features
5. Create grow logs list with filtering and sorting
6. Handle points calculation and user tier updates

## Tech Stack
- Next.js 14.2+ (App Router)
- React Hook Form (form management)
- Supabase client (database + storage)
- Lucide React icons
- File upload with drag & drop

## Routes Structure

```
/dashboard/grow-logs
  ├── /                    → List all logs
  ├── /new                 → Create new log
  └── /[id]               → View/edit specific log
```

## 1. Grow Logs List Page

### File: `app/(dashboard)/grow-logs/page.tsx`

**Purpose:** Display all user's grow logs with filtering/sorting

**Features:**
- Table view of all logs
- Filter by growth stage
- Search by strain
- Sort by date
- Pagination (20 per page)
- Click row to view details

**Implementation:**
```tsx
export default async function GrowLogsPage({
  searchParams
}: {
  searchParams: { stage?: string; search?: string; page?: string }
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  const page = parseInt(searchParams.page || '1');
  const perPage = 20;
  const offset = (page - 1) * perPage;
  
  // Build query
  let query = supabase
    .from('grow_logs')
    .select('*', { count: 'exact' })
    .eq('user_id', user?.id)
    .order('log_date', { ascending: false })
    .range(offset, offset + perPage - 1);
  
  // Apply filters
  if (searchParams.stage) {
    query = query.eq('growth_stage', searchParams.stage);
  }
  
  if (searchParams.search) {
    query = query.ilike('strain', `%${searchParams.search}%`);
  }
  
  const { data: logs, count } = await query;
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold text-neutral-900 tracking-tight">
          Grow Logs
        </h1>
        <Button href="/dashboard/grow-logs/new" variant="primary">
          <Plus className="w-4 h-4" />
          New Log
        </Button>
      </div>
      
      {/* Filters */}
      <GrowLogsFilters />
      
      {/* Table or Empty State */}
      {logs && logs.length > 0 ? (
        <>
          <GrowLogsTable logs={logs} />
          <Pagination currentPage={page} totalPages={Math.ceil((count || 0) / perPage)} />
        </>
      ) : (
        <EmptyLogsState />
      )}
    </div>
  );
}
```

### GrowLogsFilters Component

**File:** `components/grow-logs/GrowLogsFilters.tsx`

```tsx
export function GrowLogsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [stage, setStage] = useState(searchParams.get('stage') || '');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  
  function applyFilters() {
    const params = new URLSearchParams();
    if (stage) params.set('stage', stage);
    if (search) params.set('search', search);
    router.push(`/dashboard/grow-logs?${params.toString()}`);
  }
  
  return (
    <Card className="p-6">
      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <Input
            label="Search by strain"
            placeholder="Golden Teacher, B+, etc."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search />}
          />
        </div>
        
        <div className="flex-1">
          <Select
            label="Filter by stage"
            options={[
              { value: '', label: 'All Stages' },
              ...GROWTH_STAGES.map(stage => ({ value: stage, label: stage }))
            ]}
            value={stage}
            onChange={setStage}
          />
        </div>
        
        <Button onClick={applyFilters}>Apply</Button>
        <Button variant="ghost" onClick={() => router.push('/dashboard/grow-logs')}>
          Clear
        </Button>
      </div>
    </Card>
  );
}
```

### GrowLogsTable Component

**File:** `components/grow-logs/GrowLogsTable.tsx`

```tsx
export function GrowLogsTable({ logs }: { logs: GrowLog[] }) {
  const router = useRouter();
  
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="text-left px-6 py-4 text-sm font-semibold">Date</th>
              <th className="text-left px-6 py-4 text-sm font-semibold">Strain</th>
              <th className="text-left px-6 py-4 text-sm font-semibold">Stage</th>
              <th className="text-left px-6 py-4 text-sm font-semibold">Method</th>
              <th className="text-left px-6 py-4 text-sm font-semibold">Completeness</th>
              <th className="text-right px-6 py-4 text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200">
            {logs.map(log => (
              <tr 
                key={log.id}
                className="hover:bg-neutral-50 cursor-pointer transition"
                onClick={() => router.push(`/dashboard/grow-logs/${log.id}`)}
              >
                <td className="px-6 py-4 text-sm">
                  {format(new Date(log.log_date), 'MMM dd, yyyy')}
                </td>
                <td className="px-6 py-4 text-sm font-medium">{log.strain}</td>
                <td className="px-6 py-4">
                  <StageBadge stage={log.growth_stage} />
                </td>
                <td className="px-6 py-4 text-sm text-neutral-600">
                  {log.growing_method}
                </td>
                <td className="px-6 py-4">
                  <CompletenessIndicator score={log.data_completeness_score} />
                </td>
                <td className="px-6 py-4 text-right">
                  <Button 
                    variant="ghost" 
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/dashboard/grow-logs/${log.id}`);
                    }}
                  >
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
```

## 2. Create New Grow Log

### File: `app/(dashboard)/grow-logs/new/page.tsx`

**Purpose:** Form to create new grow log entry

```tsx
export default function NewGrowLogPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-neutral-900 tracking-tight">
          Create New Grow Log
        </h1>
        <p className="text-neutral-600 mt-2">
          Track your mushroom cultivation progress
        </p>
      </div>
      
      <GrowLogForm mode="create" />
    </div>
  );
}
```

### GrowLogForm Component

**File:** `components/grow-logs/GrowLogForm.tsx`

**Key Features:**
- Real-time completeness calculation
- Photo upload with drag & drop
- Form validation
- Loading states
- Error handling
- Success redirect

**Form Structure:**
```tsx
interface GrowLogFormProps {
  mode: 'create' | 'edit';
  initialData?: GrowLog;
}

export function GrowLogForm({ mode, initialData }: GrowLogFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [completeness, setCompleteness] = useState(0);
  const [photos, setPhotos] = useState<File[]>([]);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<GrowLogFormData>({
    defaultValues: initialData || {
      growth_stage: '',
      log_date: format(new Date(), 'yyyy-MM-dd'),
      strain: '',
      substrate: '',
      inoculation_method: '',
      growing_method: ''
    }
  });
  
  // Watch form values for completeness calculation
  const formValues = watch();
  
  useEffect(() => {
    const score = calculateCompletenessScore(formValues);
    setCompleteness(score);
  }, [formValues]);
  
  async function onSubmit(data: GrowLogFormData) {
    setLoading(true);
    
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      // Upload photos first
      const photoUrls = await uploadPhotos(photos, user!.id);
      
      // Calculate completeness
      const completenessScore = calculateCompletenessScore({
        ...data,
        photos: photoUrls
      });
      
      // Insert grow log
      const { error: logError } = await supabase
        .from('grow_logs')
        .insert({
          ...data,
          user_id: user!.id,
          photos: photoUrls,
          data_completeness_score: completenessScore
        });
      
      if (logError) throw logError;
      
      // Calculate and add points
      const points = getPointsForCompleteness(completenessScore);
      await supabase.rpc('add_user_points', {
        p_user_id: user!.id,
        p_points: points
      });
      
      // Success - redirect
      router.push('/dashboard/grow-logs');
      
    } catch (error) {
      console.error(error);
      alert('Failed to save grow log. Please try again.');
    } finally {
      setLoading(false);
    }
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Completeness Indicator */}
      <Card className="p-6 bg-primary-50 border-primary-200">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-primary-900">
              Data Completeness
            </span>
            <span className="text-2xl font-bold text-primary-900">
              {completeness}%
            </span>
          </div>
          <div className="h-2 bg-white rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary-600 transition-all"
              style={{ width: `${completeness}%` }}
            />
          </div>
          <p className="text-xs text-primary-800">
            Complete all fields to earn {completeness >= 80 ? '25' : '10'} points
          </p>
        </div>
      </Card>
      
      {/* Required Fields Section */}
      <Card className="p-8 space-y-6">
        <h2 className="text-xl font-bold text-neutral-900">
          Required Information
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Select
            label="Growth Stage"
            options={GROWTH_STAGES.map(s => ({ value: s, label: s }))}
            required
            error={errors.growth_stage?.message}
            {...register('growth_stage', { required: 'Growth stage is required' })}
          />
          
          <Input
            type="date"
            label="Log Date"
            required
            error={errors.log_date?.message}
            {...register('log_date', { required: 'Date is required' })}
          />
          
          <Select
            label="Strain"
            options={STRAINS.map(s => ({ value: s, label: s }))}
            required
            error={errors.strain?.message}
            {...register('strain', { required: 'Strain is required' })}
          />
          
          <Select
            label="Substrate"
            options={SUBSTRATES.map(s => ({ value: s, label: s }))}
            required
            error={errors.substrate?.message}
            {...register('substrate', { required: 'Substrate is required' })}
          />
          
          <Select
            label="Inoculation Method"
            options={INOCULATION_METHODS.map(m => ({ value: m, label: m }))}
            required
            error={errors.inoculation_method?.message}
            {...register('inoculation_method', { required: 'Method is required' })}
          />
          
          <Select
            label="Growing Method"
            options={GROWING_METHODS.map(m => ({ value: m, label: m }))}
            required
            error={errors.growing_method?.message}
            {...register('growing_method', { required: 'Method is required' })}
          />
        </div>
      </Card>
      
      {/* Optional Fields Section */}
      <Card className="p-8 space-y-6">
        <h2 className="text-xl font-bold text-neutral-900">
          Optional Details (Boost your completeness score!)
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Substrate Ratio"
            placeholder="e.g., 5:1:1 (coco:verm:gypsum)"
            {...register('substrate_ratio')}
          />
          
          <Input
            label="Inoculation Details"
            placeholder="e.g., 2cc per jar, 10% spawn rate"
            {...register('inoculation_details')}
          />
          
          <Input
            type="number"
            step="0.1"
            label="Temperature (°F)"
            {...register('temperature')}
          />
          
          <Input
            type="number"
            step="0.1"
            label="Humidity (%)"
            {...register('humidity')}
          />
          
          <Input
            type="number"
            step="0.1"
            label="pH Level"
            {...register('ph_level')}
          />
          
          <Input
            type="number"
            step="0.01"
            label="Weight (grams)"
            {...register('weight')}
          />
          
          <Input
            type="number"
            step="0.1"
            min="0"
            max="12"
            label="Light Hours per Day"
            {...register('light_hours_daily')}
          />
        </div>
      </Card>
      
      {/* TEK & Technique Section */}
      <Card className="p-8 space-y-6">
        <h2 className="text-xl font-bold text-neutral-900">
          TEK & Technique
        </h2>
        
        <Select
          label="TEK Method"
          options={[
            { value: '', label: 'Select a TEK...' },
            ...TEK_METHODS.map(t => ({ value: t, label: t }))
          ]}
          {...register('tek_method')}
        />
        
        <Textarea
          label="Technique Notes"
          placeholder="Share your specific modifications, ratios, or observations..."
          rows={6}
          maxLength={1000}
          {...register('tek_notes')}
        />
      </Card>
      
      {/* Photos Section */}
      <Card className="p-8 space-y-6">
        <h2 className="text-xl font-bold text-neutral-900">Photos</h2>
        <PhotoUpload photos={photos} onChange={setPhotos} />
      </Card>
      
      {/* Notes Section */}
      <Card className="p-8 space-y-6">
        <h2 className="text-xl font-bold text-neutral-900">General Notes</h2>
        <Textarea
          placeholder="Add any notes about this grow log entry..."
          rows={4}
          {...register('notes')}
        />
      </Card>
      
      {/* Submit Button */}
      <div className="flex gap-4 justify-end">
        <Button 
          type="button" 
          variant="ghost"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="primary"
          loading={loading}
        >
          {mode === 'create' ? 'Create Log' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
```

## 3. Photo Upload Component

### File: `components/grow-logs/PhotoUpload.tsx`

**Features:**
- Drag & drop interface
- Multiple file selection
- Preview thumbnails
- Remove photos
- File validation

```tsx
interface PhotoUploadProps {
  photos: File[];
  onChange: (photos: File[]) => void;
}

export function PhotoUpload({ photos, onChange }: PhotoUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => 
      file.type.startsWith('image/')
    );
    
    // Validate size (max 10MB)
    const validFiles = imageFiles.filter(file => 
      file.size <= 10 * 1024 * 1024
    );
    
    onChange([...photos, ...validFiles]);
  }
  
  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => 
      file.size <= 10 * 1024 * 1024
    );
    onChange([...photos, ...validFiles]);
  }
  
  function removePhoto(index: number) {
    onChange(photos.filter((_, i) => i !== index));
  }
  
  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        className={cn(
          "border-2 border-dashed rounded-xl p-12 text-center transition",
          dragActive ? "border-primary-500 bg-primary-50" : "border-neutral-300"
        )}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
      >
        <Upload className="w-12 h-12 mx-auto text-neutral-400 mb-4" />
        <p className="text-neutral-600 mb-2">
          Drag & drop photos here, or click to select
        </p>
        <p className="text-sm text-neutral-500">
          PNG, JPG up to 10MB each
        </p>
        <input
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          id="file-upload"
          onChange={handleFileInput}
        />
        <label htmlFor="file-upload">
          <Button variant="secondary" className="mt-4" as="span">
            Select Files
          </Button>
        </label>
      </div>
      
      {/* Preview Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {photos.map((photo, index) => (
            <div key={index} className="relative group">
              <img
                src={URL.createObjectURL(photo)}
                alt={`Preview ${index + 1}`}
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => removePhoto(index)}
                className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
              >
                <X className="w-4 h-4 mx-auto" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## 4. Photo Upload Utility

### File: `lib/utils/photoUpload.ts`

```tsx
export async function uploadPhotos(
  photos: File[],
  userId: string
): Promise<string[]> {
  const supabase = createClient();
  const photoUrls: string[] = [];
  
  for (const photo of photos) {
    const timestamp = Date.now();
    const ext = photo.name.split('.').pop();
    const filename = `${timestamp}.${ext}`;
    const path = `${userId}/${filename}`;
    
    const { error } = await supabase.storage
      .from('grow-photos')
      .upload(path, photo);
    
    if (error) {
      console.error('Upload error:', error);
      continue;
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('grow-photos')
      .getPublicUrl(path);
    
    photoUrls.push(publicUrl);
  }
  
  return photoUrls;
}
```

## 5. View Grow Log

### File: `app/(dashboard)/grow-logs/[id]/page.tsx`

**Purpose:** Display single grow log with all details

```tsx
export default async function ViewGrowLogPage({
  params
}: {
  params: { id: string }
}) {
  const supabase = createClient();
  
  const { data: log } = await supabase
    .from('grow_logs')
    .select('*')
    .eq('id', params.id)
    .single();
  
  if (!log) {
    return <div>Log not found</div>;
  }
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-neutral-900 tracking-tight">
            {log.strain}
          </h1>
          <p className="text-neutral-600 mt-2">
            {format(new Date(log.log_date), 'MMMM dd, yyyy')}
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button 
            variant="secondary"
            onClick={() => router.push(`/dashboard/grow-logs/${log.id}/edit`)}
          >
            <Edit className="w-4 h-4" />
            Edit
          </Button>
          <DeleteButton logId={log.id} />
        </div>
      </div>
      
      {/* Completeness */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-neutral-600">
            Data Completeness
          </span>
          <span className="text-2xl font-bold text-neutral-900">
            {log.data_completeness_score}%
          </span>
        </div>
      </Card>
      
      {/* Core Info */}
      <Card className="p-8">
        <h2 className="text-xl font-bold text-neutral-900 mb-6">
          Core Information
        </h2>
        <div className="grid grid-cols-2 gap-6">
          <InfoField label="Growth Stage" value={log.growth_stage} />
          <InfoField label="Strain" value={log.strain} />
          <InfoField label="Substrate" value={log.substrate} />
          <InfoField label="Growing Method" value={log.growing_method} />
          <InfoField label="Inoculation Method" value={log.inoculation_method} />
        </div>
      </Card>
      
      {/* Environmental Data */}
      {(log.temperature || log.humidity || log.ph_level || log.weight) && (
        <Card className="p-8">
          <h2 className="text-xl font-bold text-neutral-900 mb-6">
            Environmental Data
          </h2>
          <div className="grid grid-cols-2 gap-6">
            {log.temperature && <InfoField label="Temperature" value={`${log.temperature}°F`} />}
            {log.humidity && <InfoField label="Humidity" value={`${log.humidity}%`} />}
            {log.ph_level && <InfoField label="pH Level" value={log.ph_level} />}
            {log.weight && <InfoField label="Weight" value={`${log.weight}g`} />}
          </div>
        </Card>
      )}
      
      {/* Photos */}
      {log.photos && log.photos.length > 0 && (
        <Card className="p-8">
          <h2 className="text-xl font-bold text-neutral-900 mb-6">Photos</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {log.photos.map((url, index) => (
              <img
                key={index}
                src={url}
                alt={`Grow photo ${index + 1}`}
                className="w-full h-48 object-cover rounded-lg"
              />
            ))}
          </div>
        </Card>
      )}
      
      {/* Notes */}
      {log.notes && (
        <Card className="p-8">
          <h2 className="text-xl font-bold text-neutral-900 mb-4">Notes</h2>
          <p className="text-neutral-600 whitespace-pre-wrap">{log.notes}</p>
        </Card>
      )}
    </div>
  );
}
```

## Implementation Checklist
- [ ] Install React Hook Form
- [ ] Create grow logs list page
- [ ] Create filters component
- [ ] Create table component
- [ ] Create pagination component
- [ ] Create new log form
- [ ] Implement photo upload
- [ ] Implement real-time completeness calculation
- [ ] Create view log page
- [ ] Create edit functionality
- [ ] Create delete functionality
- [ ] Test form validation
- [ ] Test photo upload to Supabase Storage
- [ ] Test points calculation
- [ ] Test tier updates
- [ ] Verify RLS policies work

## Dependencies
```json
{
  "react-hook-form": "^7.48.0"
}
```

## Success Criteria
- Users can create grow logs with all fields
- Photos upload successfully to Supabase Storage
- Completeness score calculates correctly
- Points awarded on submission
- User tier updates automatically
- Logs display in table with filters
- Editing and deleting works
- Form validation prevents invalid submissions
- Loading states prevent double submissions

## Files to Create
1. `app/(dashboard)/grow-logs/page.tsx`
2. `app/(dashboard)/grow-logs/new/page.tsx`
3. `app/(dashboard)/grow-logs/[id]/page.tsx`
4. `components/grow-logs/GrowLogForm.tsx`
5. `components/grow-logs/GrowLogsFilters.tsx`
6. `components/grow-logs/GrowLogsTable.tsx`
7. `components/grow-logs/PhotoUpload.tsx`
8. `lib/utils/photoUpload.ts`

## Handoff to Other Agents
- **Dashboard Agent:** Logs data available for recent activity
- **Database Agent:** Using grow_logs schema and functions
- **Design System Agent:** Using all UI components
