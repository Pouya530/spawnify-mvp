'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import { GROWTH_STAGES } from '@/lib/constants/growingOptions'

export function AdminGrowLogsFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [stage, setStage] = useState(searchParams.get('stage') || '')
  
  function applyFilters() {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (stage) params.set('stage', stage)
    if (searchParams.get('user')) params.set('user', searchParams.get('user') || '')
    router.push(`/admin/grow-logs?${params.toString()}`)
  }
  
  function clearFilters() {
    const params = new URLSearchParams()
    if (searchParams.get('user')) params.set('user', searchParams.get('user') || '')
    router.push(`/admin/grow-logs?${params.toString()}`)
  }
  
  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <Input
            label="Search by strain or user email"
            placeholder="Blue Oyster or user@example.com"
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

