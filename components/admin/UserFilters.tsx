'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'

export function UserFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [level, setLevel] = useState(searchParams.get('level') || '')
  const [sort, setSort] = useState(searchParams.get('sort') || 'created_at')
  
  function applyFilters() {
    const params = new URLSearchParams()
    if (search) params.set('search', search)
    if (level) params.set('level', level)
    if (sort) params.set('sort', sort)
    router.push(`/admin/users?${params.toString()}`)
  }
  
  function clearFilters() {
    router.push('/admin/users')
  }
  
  return (
    <Card className="p-6">
      <div className="flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <Input
            label="Search by email"
            placeholder="user@example.com"
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
            label="Filter by tier"
            options={[
              { value: '', label: 'All Tiers' },
              { value: 'bronze', label: 'Bronze' },
              { value: 'silver', label: 'Silver' },
              { value: 'gold', label: 'Gold' }
            ]}
            value={level}
            onChange={(value) => setLevel(value)}
          />
        </div>
        
        <div className="flex-1 w-full">
          <Select
            label="Sort by"
            options={[
              { value: 'created_at', label: 'Join Date' },
              { value: 'total_points', label: 'Points' },
              { value: 'email', label: 'Email' }
            ]}
            value={sort}
            onChange={(value) => setSort(value)}
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

