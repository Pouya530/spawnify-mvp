import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { GrowLogForm } from '@/components/grow-logs/GrowLogForm'

export default async function NewGrowLogPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-neutral-900 tracking-tight">
          Create New Grow Log
        </h1>
        <p className="text-neutral-600 mt-2">
          Track your mushroom cultivation progress and contribute to scientific research
        </p>
      </div>
      
      <GrowLogForm mode="create" />
    </div>
  )
}

