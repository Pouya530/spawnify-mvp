'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { Search } from 'lucide-react'
import { GROWTH_STAGES } from '@/lib/constants/growingOptions'

export function GrowLogsFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [stage, setStage] = useState(searchParams.get('stage') || '')
  const [search, setSearch] = useState(searchParams.get('search') || '')

  function applyFilters() {
    const params = new URLSearchParams()
    if (stage) params.set('stage', stage)
    if (search) params.set('search', search)
    params.set('page', '1') // Reset to first page
    router.push(`/dashboard/grow-logs?${params.toString()}`)
  }

  function clearFilters() {
    router.push('/dashboard/grow-logs')
  }

  return (
    <Card>
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <Input
            label="Search by strain"
            placeholder="Blue Oyster, Shiitake, Lion's Mane, etc."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={<Search className="w-5 h-5" />}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                applyFilters()
              }
            }}
          />
        </div>
        
        <div className="flex-1 w-full">
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
        
        <div className="flex gap-2">
          <Button onClick={applyFilters} variant="primary" size="medium">
            Apply
          </Button>
          <Button onClick={clearFilters} variant="ghost" size="medium">
            Clear
          </Button>
        </div>
      </div>
    </Card>
  )
}

