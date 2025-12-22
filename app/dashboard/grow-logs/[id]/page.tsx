import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'
import { format } from 'date-fns'
import { ArrowLeft, Edit, Thermometer, Droplets, Scale, Sun, FlaskConical, Camera, FileText } from 'lucide-react'
import { CompletenessChart } from '@/components/grow-logs/CompletenessChart'
import { EnvironmentalDataChart } from '@/components/grow-logs/EnvironmentalDataChart'
import { GrowthStageChart } from '@/components/grow-logs/GrowthStageChart'
import { DeleteLogButton } from '@/components/grow-logs/DeleteLogButton'
import Image from 'next/image'
import { Database } from '@/lib/types/database'
import { SubstrateEntry } from '@/lib/types/growLog'

type GrowLog = Database['public']['Tables']['grow_logs']['Row']

interface PageProps {
  params: { id: string }
}

export default async function ViewGrowLogPage({ params }: PageProps) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch the grow log
  const { data: log, error } = await supabase
    .from('grow_logs')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (error || !log) {
    notFound()
  }

  // Type guard
  const logTyped: GrowLog = log

  // Fetch all logs for this strain to show progression
  const { data: allStrainLogs } = await supabase
    .from('grow_logs')
    .select('*')
    .eq('user_id', user.id)
    .eq('strain', logTyped.strain)
    .order('log_date', { ascending: true })

  const allStrainLogsTyped: GrowLog[] = allStrainLogs || []

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/grow-logs">
            <Button variant="ghost" size="small">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Logs
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">
              {logTyped.strain}
            </h1>
            <p className="text-neutral-600 mt-1">
              {format(new Date(logTyped.log_date), 'MMMM dd, yyyy')}
            </p>
          </div>
        </div>
        
        <div className="flex gap-3">
          <Link href={`/dashboard/grow-logs/${logTyped.id}/edit`}>
            <Button variant="secondary" size="medium">
              <Edit className="w-4 h-4 mr-2" />
              Edit Log
            </Button>
          </Link>
          <DeleteLogButton 
            logId={logTyped.id} 
            photoUrls={logTyped.photos}
            userId={user.id}
          />
        </div>
      </div>

      {/* Completeness Score Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-neutral-900">Data Completeness</h2>
          <Badge variant="default" className="text-lg px-4 py-2">
            {logTyped.data_completeness_score}%
          </Badge>
        </div>
        <CompletenessChart score={logTyped.data_completeness_score} />
      </Card>

      {/* Core Information */}
      <Card className="p-8">
        <h2 className="text-xl font-bold text-neutral-900 mb-6">Core Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <InfoField label="Growth Stage" value={logTyped.growth_stage} badge />
          <InfoField label="Strain" value={logTyped.strain} />
          <SubstrateDisplay substrate={logTyped.substrate} substrateRatio={logTyped.substrate_ratio} />
          <InfoField label="Growing Method" value={logTyped.growing_method} />
          <InfoField label="Inoculation Method" value={logTyped.inoculation_method} />
          {logTyped.tek_method && <InfoField label="TEK Method" value={logTyped.tek_method} />}
        </div>
      </Card>

      {/* Environmental Data with Chart */}
      {(logTyped.temperature || logTyped.humidity || logTyped.ph_level || logTyped.weight || logTyped.light_hours_daily) && (
        <>
          <Card className="p-8">
            <h2 className="text-xl font-bold text-neutral-900 mb-6">Environmental Data</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
              {logTyped.temperature && (
                <InfoField 
                  label="Temperature" 
                  value={`${logTyped.temperature}°F`}
                  icon={<Thermometer className="w-5 h-5" />}
                />
              )}
              {logTyped.humidity && (
                <InfoField 
                  label="Humidity" 
                  value={`${logTyped.humidity}%`}
                  icon={<Droplets className="w-5 h-5" />}
                />
              )}
              {logTyped.ph_level && (
                <InfoField 
                  label="pH Level" 
                  value={logTyped.ph_level.toString()}
                  icon={<FlaskConical className="w-5 h-5" />}
                />
              )}
              {logTyped.weight && (
                <InfoField 
                  label="Weight" 
                  value={`${logTyped.weight}g`}
                  icon={<Scale className="w-5 h-5" />}
                />
              )}
              {logTyped.light_hours_daily && (
                <InfoField 
                  label="Light Hours" 
                  value={`${logTyped.light_hours_daily}h/day`}
                  icon={<Sun className="w-5 h-5" />}
                />
              )}
            </div>
            {allStrainLogs && allStrainLogs.length > 1 && (
              <EnvironmentalDataChart logs={allStrainLogs} />
            )}
          </Card>
        </>
      )}

      {/* Growth Stage Progression Chart */}
      {allStrainLogs && allStrainLogs.length > 1 && (
        <Card className="p-8">
          <h2 className="text-xl font-bold text-neutral-900 mb-6">Growth Stage Progression</h2>
          <GrowthStageChart logs={allStrainLogs} />
        </Card>
      )}

      {/* Additional Details */}
      {logTyped.inoculation_details && (
        <Card className="p-8">
          <h2 className="text-xl font-bold text-neutral-900 mb-6">Additional Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {logTyped.inoculation_details && (
              <InfoField label="Inoculation Details" value={logTyped.inoculation_details} />
            )}
          </div>
        </Card>
      )}

      {/* Photos Gallery */}
      {logTyped.photos && logTyped.photos.length > 0 && (
        <Card className="p-8">
          <div className="flex items-center gap-2 mb-6">
            <Camera className="w-5 h-5 text-neutral-600" />
            <h2 className="text-xl font-bold text-neutral-900">Photos</h2>
            <Badge variant="default" className="ml-2">
              {logTyped.photos.length}
            </Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {logTyped.photos.map((url: string, index: number) => (
              <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-neutral-100 group">
                <Image
                  src={url}
                  alt={`Grow photo ${index + 1}`}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* TEK Notes */}
      {logTyped.tek_notes && (
        <Card className="p-8">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-neutral-600" />
            <h2 className="text-xl font-bold text-neutral-900">TEK Notes</h2>
          </div>
          <p className="text-neutral-600 whitespace-pre-wrap leading-relaxed">
            {logTyped.tek_notes}
          </p>
        </Card>
      )}

      {/* General Notes */}
      {logTyped.notes && (
        <Card className="p-8">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-neutral-600" />
            <h2 className="text-xl font-bold text-neutral-900">General Notes</h2>
          </div>
          <p className="text-neutral-600 whitespace-pre-wrap leading-relaxed">
            {logTyped.notes}
          </p>
        </Card>
      )}
    </div>
  )
}

function InfoField({ 
  label, 
  value, 
  icon, 
  badge = false 
}: { 
  label: string
  value: string
  icon?: React.ReactNode
  badge?: boolean
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        {icon && <span className="text-neutral-400">{icon}</span>}
        <p className="text-sm text-neutral-600">{label}</p>
      </div>
      {badge ? (
        <Badge variant="default" className="text-base">
          {value}
        </Badge>
      ) : (
        <p className="text-base font-medium text-neutral-900">{value}</p>
      )}
    </div>
  )
}

function SubstrateDisplay({ 
  substrate, 
  substrateRatio 
}: { 
  substrate: string | null
  substrateRatio: string | null
}) {
  let substrates: SubstrateEntry[] = []
  
  if (substrateRatio) {
    try {
      const parsed = JSON.parse(substrateRatio)
      if (Array.isArray(parsed) && parsed.length > 0) {
        substrates = parsed
      }
    } catch (e) {
      // If not JSON, display as plain text
      return (
        <div>
          <p className="text-sm text-neutral-600 mb-1">Substrate</p>
          <p className="text-base font-medium text-neutral-900">{substrate || 'N/A'}</p>
          {substrateRatio && (
            <p className="text-sm text-neutral-600 mt-1">{substrateRatio}</p>
          )}
        </div>
      )
    }
  }
  
  if (substrates.length === 0 && substrate) {
    substrates = [{ substrate, percentage: 100 }]
  }
  
  if (substrates.length === 0) {
    return (
      <div>
        <p className="text-sm text-neutral-600 mb-1">Substrate</p>
        <p className="text-base font-medium text-neutral-900">N/A</p>
      </div>
    )
  }
  
  return (
    <div>
      <p className="text-sm text-neutral-600 mb-2">Substrate{substrates.length > 1 ? 's' : ''}</p>
      <div className="space-y-1">
        {substrates.map((s, index) => (
          <div key={index} className="flex items-center justify-between">
            <span className="text-base font-medium text-neutral-900">{s.substrate}</span>
            <span className="text-sm text-neutral-600 ml-2">{s.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  )
}

