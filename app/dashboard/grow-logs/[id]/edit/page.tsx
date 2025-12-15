import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { GrowLogForm } from '@/components/grow-logs/GrowLogForm'
import { format } from 'date-fns'
import { Database } from '@/lib/types/database'

type GrowLog = Database['public']['Tables']['grow_logs']['Row']

interface PageProps {
  params: { id: string }
}

export default async function EditGrowLogPage({ params }: PageProps) {
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

  // Pass the typed log directly to the form
  const initialData: GrowLog = logTyped

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">
          Edit Grow Log
        </h1>
        <p className="text-neutral-600 mt-2">
          Update your mushroom cultivation log entry
        </p>
      </div>
      
      <GrowLogForm mode="edit" initialData={initialData} />
    </div>
  )
}

