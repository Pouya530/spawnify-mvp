'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Textarea } from '@/components/ui/Textarea'
import { Button } from '@/components/ui/Button'
import { PhotoUpload } from './PhotoUpload'
import { PhotoUploadWithExisting } from './PhotoUploadWithExisting'
import { calculateCompletenessScore, getPointsForCompleteness } from '@/lib/utils/dataCompleteness'
import { uploadPhotos } from '@/lib/utils/photoUpload'
import {
  GROWTH_STAGES,
  STRAINS,
  SUBSTRATES,
  INOCULATION_METHODS,
  GROWING_METHODS,
  TEK_METHODS
} from '@/lib/constants/growingOptions'
import { GrowLogFormData } from '@/lib/types/growLog'
import { Calendar, Thermometer, Droplets, Scale, Sun, FlaskConical } from 'lucide-react'
import { Database } from '@/lib/types/database'

type GrowLog = Database['public']['Tables']['grow_logs']['Row']

interface GrowLogFormProps {
  mode: 'create' | 'edit'
  initialData?: GrowLog | null
}

export function GrowLogForm({ mode, initialData }: GrowLogFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [completeness, setCompleteness] = useState(0)
  const [photos, setPhotos] = useState<File[]>([])
  const [existingPhotos, setExistingPhotos] = useState<string[]>(initialData?.photos || [])
  const [error, setError] = useState<string>('')
  
  // Transform GrowLog to GrowLogFormData if initialData is provided
  const formDefaults: GrowLogFormData = initialData ? {
    growth_stage: initialData.growth_stage,
    log_date: format(new Date(initialData.log_date), 'yyyy-MM-dd'),
    strain: initialData.strain,
    substrate: initialData.substrate,
    substrate_ratio: initialData.substrate_ratio || '',
    inoculation_method: initialData.inoculation_method,
    inoculation_details: initialData.inoculation_details || '',
    growing_method: initialData.growing_method,
    tek_method: initialData.tek_method || '',
    tek_notes: initialData.tek_notes || '',
    temperature: initialData.temperature || undefined,
    humidity: initialData.humidity || undefined,
    ph_level: initialData.ph_level || undefined,
    weight: initialData.weight || undefined,
    light_hours_daily: initialData.light_hours_daily || undefined,
    notes: initialData.notes || '',
    photos: initialData.photos || []
  } : {
    growth_stage: '',
    log_date: format(new Date(), 'yyyy-MM-dd'),
    strain: '',
    substrate: '',
    inoculation_method: '',
    growing_method: ''
  }
  
  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
    setValue
  } = useForm<GrowLogFormData>({
    defaultValues: formDefaults
  })
  
  // Watch form values for completeness calculation
  const formValues = watch()
  
  useEffect(() => {
    const allPhotos = mode === 'edit' 
      ? [...existingPhotos, ...photos.map(() => 'has-photos')]
      : photos.map(() => 'has-photos')
    
    const score = calculateCompletenessScore({
      ...formValues,
      photos: allPhotos.length > 0 ? allPhotos : []
    })
    setCompleteness(score)
  }, [formValues, photos, existingPhotos, mode])
  
  async function onSubmit(data: GrowLogFormData) {
    setLoading(true)
    setError('')
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setError('You must be logged in to create a grow log')
        setLoading(false)
        return
      }
      
      // Upload photos first
      let photoUrls: string[] = []
      if (photos.length > 0) {
        photoUrls = await uploadPhotos(photos, user.id)
        if (photoUrls.length === 0 && photos.length > 0) {
          setError('Failed to upload photos. Please try again.')
          setLoading(false)
          return
        }
      }
      
      // Combine existing photos with newly uploaded ones
      const allPhotoUrls = [...existingPhotos, ...photoUrls]
      
      // Calculate completeness with photos
      const completenessScore = calculateCompletenessScore({
        ...data,
        photos: allPhotoUrls
      })
      
      // Prepare data for insertion/update
      const logData: any = {
        growth_stage: data.growth_stage,
        log_date: data.log_date,
        strain: data.strain,
        substrate: data.substrate,
        inoculation_method: data.inoculation_method,
        growing_method: data.growing_method,
        data_completeness_score: completenessScore
      }
      
      // Add optional fields
      if (data.substrate_ratio) logData.substrate_ratio = data.substrate_ratio
      else logData.substrate_ratio = null
      
      if (data.inoculation_details) logData.inoculation_details = data.inoculation_details
      else logData.inoculation_details = null
      
      if (data.temperature !== undefined && data.temperature !== null) {
        logData.temperature = parseFloat(data.temperature.toString())
      } else {
        logData.temperature = null
      }
      
      if (data.humidity !== undefined && data.humidity !== null) {
        logData.humidity = parseFloat(data.humidity.toString())
      } else {
        logData.humidity = null
      }
      
      if (data.ph_level !== undefined && data.ph_level !== null) {
        logData.ph_level = parseFloat(data.ph_level.toString())
      } else {
        logData.ph_level = null
      }
      
      if (data.weight !== undefined && data.weight !== null) {
        logData.weight = parseFloat(data.weight.toString())
      } else {
        logData.weight = null
      }
      
      if (data.light_hours_daily !== undefined && data.light_hours_daily !== null) {
        logData.light_hours_daily = parseFloat(data.light_hours_daily.toString())
      } else {
        logData.light_hours_daily = null
      }
      
      if (data.tek_method) logData.tek_method = data.tek_method
      else logData.tek_method = null
      
      if (data.tek_notes) logData.tek_notes = data.tek_notes
      else logData.tek_notes = null
      
      if (data.notes) logData.notes = data.notes
      else logData.notes = null
      
      logData.photos = allPhotoUrls.length > 0 ? allPhotoUrls : null
      
      if (mode === 'edit' && initialData?.id) {
        // Update existing log
        const { error: logError } = await (supabase
          .from('grow_logs') as any)
          .update(logData)
          .eq('id', initialData.id)
          .eq('user_id', user.id)
        
        if (logError) {
          console.error('Database error:', logError)
          setError(logError.message || 'Failed to update grow log. Please try again.')
          setLoading(false)
          return
        }
        
        // Success - redirect to view page
        router.push(`/dashboard/grow-logs/${initialData.id}`)
        router.refresh()
      } else {
        // Insert new log
        logData.user_id = user.id
        
        const { data: newLog, error: logError } = await supabase
          .from('grow_logs')
          .insert(logData)
          .select()
          .single()
        
        if (logError) {
          console.error('Database error:', logError)
          setError(logError.message || 'Failed to save grow log. Please try again.')
          setLoading(false)
          return
        }
        
        // Calculate and add points using the database function (only for new logs)
        const points = getPointsForCompleteness(completenessScore)
        const { error: pointsError } = await (supabase.rpc as any)('add_user_points', {
          p_user_id: user.id,
          p_points: points
        })
        
        if (pointsError) {
          console.error('Points error:', pointsError)
          // Don't fail the whole operation if points fail
        }
        
        // Success - redirect to logs list
        router.push('/dashboard/grow-logs')
        router.refresh()
      }
      
    } catch (err: any) {
      console.error('Submit error:', err)
      setError(err.message || 'An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      {/* Error Message */}
      {error && (
        <Card className="p-4 bg-red-50 border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </Card>
      )}
      
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
          <div className="h-3 bg-white rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary-600 transition-all duration-300"
              style={{ width: `${completeness}%` }}
            />
          </div>
          <p className="text-xs text-primary-800">
            {completeness >= 80 
              ? 'Excellent! You\'ll earn 25 points for this complete log.' 
              : 'Complete more fields to earn 25 points (currently 10 points)'}
          </p>
        </div>
      </Card>
      
      {/* Required Fields Section */}
      <Card className="p-8 space-y-6">
        <h2 className="text-xl font-bold text-neutral-900">
          Required Information
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Controller
            name="growth_stage"
            control={control}
            rules={{ required: 'Growth stage is required' }}
            render={({ field }) => (
              <Select
                label="Growth Stage"
                options={GROWTH_STAGES.map(s => ({ value: s, label: s }))}
                required
                error={errors.growth_stage?.message}
                value={field.value || ''}
                onChange={(value) => field.onChange(value)}
              />
            )}
          />
          
          <Input
            type="date"
            label="Log Date"
            required
            error={errors.log_date?.message}
            {...register('log_date', { required: 'Date is required' })}
          />
          
          <Controller
            name="strain"
            control={control}
            rules={{ required: 'Strain is required' }}
            render={({ field }) => (
              <Select
                label="Strain"
                options={STRAINS.map(s => ({ value: s, label: s }))}
                required
                error={errors.strain?.message}
                value={field.value || ''}
                onChange={(value) => field.onChange(value)}
              />
            )}
          />
          
          <Controller
            name="substrate"
            control={control}
            rules={{ required: 'Substrate is required' }}
            render={({ field }) => (
              <Select
                label="Substrate"
                options={SUBSTRATES.map(s => ({ value: s, label: s }))}
                required
                error={errors.substrate?.message}
                value={field.value || ''}
                onChange={(value) => field.onChange(value)}
              />
            )}
          />
          
          <Controller
            name="inoculation_method"
            control={control}
            rules={{ required: 'Inoculation method is required' }}
            render={({ field }) => (
              <Select
                label="Inoculation Method"
                options={INOCULATION_METHODS.map(m => ({ value: m, label: m }))}
                required
                error={errors.inoculation_method?.message}
                value={field.value || ''}
                onChange={(value) => field.onChange(value)}
              />
            )}
          />
          
          <Controller
            name="growing_method"
            control={control}
            rules={{ required: 'Growing method is required' }}
            render={({ field }) => (
              <Select
                label="Growing Method"
                options={GROWING_METHODS.map(m => ({ value: m, label: m }))}
                required
                error={errors.growing_method?.message}
                value={field.value || ''}
                onChange={(value) => field.onChange(value)}
              />
            )}
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
            placeholder="e.g., 75.5"
            icon={<Thermometer className="w-5 h-5" />}
            {...register('temperature', {
              valueAsNumber: true,
              min: { value: 0, message: 'Temperature must be positive' }
            })}
            error={errors.temperature?.message}
          />
          
          <Input
            type="number"
            step="0.1"
            label="Humidity (%)"
            placeholder="e.g., 90.0"
            icon={<Droplets className="w-5 h-5" />}
            {...register('humidity', {
              valueAsNumber: true,
              min: { value: 0, message: 'Humidity must be positive' },
              max: { value: 100, message: 'Humidity cannot exceed 100%' }
            })}
            error={errors.humidity?.message}
          />
          
          <Input
            type="number"
            step="0.1"
            min="0"
            max="14"
            label="pH Level"
            placeholder="e.g., 7.0"
            icon={<FlaskConical className="w-5 h-5" />}
            {...register('ph_level', {
              valueAsNumber: true,
              min: { value: 0, message: 'pH must be between 0 and 14' },
              max: { value: 14, message: 'pH must be between 0 and 14' }
            })}
            error={errors.ph_level?.message}
          />
          
          <Input
            type="number"
            step="0.01"
            label="Weight (grams)"
            placeholder="e.g., 150.5"
            icon={<Scale className="w-5 h-5" />}
            {...register('weight', {
              valueAsNumber: true,
              min: { value: 0, message: 'Weight must be positive' }
            })}
            error={errors.weight?.message}
          />
          
          <Input
            type="number"
            step="0.1"
            min="0"
            max="12"
            label="Light Hours per Day"
            placeholder="e.g., 12.0"
            icon={<Sun className="w-5 h-5" />}
            {...register('light_hours_daily', {
              valueAsNumber: true,
              min: { value: 0, message: 'Light hours must be between 0 and 12' },
              max: { value: 12, message: 'Light hours must be between 0 and 12' }
            })}
            error={errors.light_hours_daily?.message}
          />
        </div>
      </Card>
      
      {/* TEK & Technique Section */}
      <Card className="p-8 space-y-6">
        <h2 className="text-xl font-bold text-neutral-900">
          TEK & Technique
        </h2>
        
        <Controller
          name="tek_method"
          control={control}
          render={({ field }) => (
            <Select
              label="TEK Method"
              options={[
                { value: '', label: 'Select a TEK...' },
                ...TEK_METHODS.map(t => ({ value: t, label: t }))
              ]}
              value={field.value || ''}
              onChange={(value) => field.onChange(value)}
            />
          )}
        />
        
        <Textarea
          label="Technique Notes"
          placeholder="Share your specific modifications, ratios, or observations. Detailed notes (>100 chars) earn bonus points!"
          rows={6}
          maxLength={1000}
          {...register('tek_notes')}
        />
      </Card>
      
      {/* Photos Section */}
      <Card className="p-8 space-y-6">
        <h2 className="text-xl font-bold text-neutral-900">Photos</h2>
        <p className="text-sm text-neutral-600">
          Upload photos of your grow. Each photo adds to your completeness score!
        </p>
        {mode === 'edit' ? (
          <PhotoUploadWithExisting
            newPhotos={photos}
            existingPhotos={existingPhotos}
            onNewPhotosChange={setPhotos}
            onExistingPhotosChange={setExistingPhotos}
          />
        ) : (
          <PhotoUpload photos={photos} onChange={setPhotos} />
        )}
      </Card>
      
      {/* Notes Section */}
      <Card className="p-8 space-y-6">
        <h2 className="text-xl font-bold text-neutral-900">General Notes</h2>
        <Textarea
          placeholder="Add any additional notes about this grow log entry. Notes over 50 characters earn bonus points!"
          rows={4}
          maxLength={2000}
          {...register('notes')}
        />
      </Card>
      
      {/* Submit Button */}
      <div className="flex gap-4 justify-end">
        <Button 
          type="button" 
          variant="ghost"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="primary"
          loading={loading}
          disabled={loading}
        >
          {mode === 'create' ? 'Create Log' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}

