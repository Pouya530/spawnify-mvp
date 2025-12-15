'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { generateCSV, downloadCSV } from '@/lib/utils/csvExport'
import { format } from 'date-fns'
import { Database } from '@/lib/types/database'

type GrowLog = Database['public']['Tables']['grow_logs']['Row']

interface ExportDataButtonProps {
  logs?: GrowLog[]
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'small' | 'medium' | 'large'
}

export function ExportDataButton({ logs, variant = 'primary', size = 'medium' }: ExportDataButtonProps) {
  const [loading, setLoading] = useState(false)
  
  async function handleExport() {
    setLoading(true)
    
    try {
      // If logs not provided, fetch all logs
      let logsToExport = logs
      
      if (!logsToExport || logsToExport.length === 0) {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()
        
        const { data: allLogs } = await supabase
          .from('grow_logs')
          .select('*')
          .order('created_at', { ascending: false })
        
        logsToExport = allLogs || []
      }
      
      if (!logsToExport || logsToExport.length === 0) {
        alert('No data to export')
        setLoading(false)
        return
      }
      
      // Generate CSV
      const csv = generateCSV(logsToExport)
      
      // Download file
      const filename = `spawnify-data-${format(new Date(), 'yyyy-MM-dd')}.csv`
      downloadCSV(csv, filename)
      
    } catch (error) {
      console.error('Export error:', error)
      alert('Failed to export data. Please try again.')
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleExport}
      loading={loading}
      disabled={loading}
      className={size === 'medium' ? 'w-full' : ''}
    >
      <Download className="w-4 h-4 mr-2" />
      Export to CSV
    </Button>
  )
}

