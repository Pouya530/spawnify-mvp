import { format } from 'date-fns'
import { Database } from '@/lib/types/database'

type GrowLog = Database['public']['Tables']['grow_logs']['Row']

/**
 * Generate CSV from grow logs data (anonymized)
 * Excludes: user_id, email, photos, notes, tek_notes
 */
export function generateCSV(logs: GrowLog[]): string {
  // CSV Headers (anonymized - no user_id, email, photos, personal notes)
  const headers = [
    'id',
    'growth_stage',
    'log_date',
    'strain',
    'substrate',
    'substrate_ratio',
    'inoculation_method',
    'inoculation_details',
    'growing_method',
    'tek_method',
    'temperature',
    'humidity',
    'ph_level',
    'weight',
    'light_hours_daily',
    'data_completeness_score',
    'created_at'
  ]
  
  // Build CSV rows
  const rows = logs.map(log => 
    headers.map(header => {
      const value = log[header as keyof GrowLog]
      // Handle null/undefined
      if (value === null || value === undefined) return ''
      
      // Format dates
      if (header === 'log_date' || header === 'created_at') {
        if (value) {
          return format(new Date(value as string), 'yyyy-MM-dd')
        }
        return ''
      }
      
      // Escape commas and quotes
      const str = String(value)
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`
      }
      return str
    }).join(',')
  )
  
  return [headers.join(','), ...rows].join('\n')
}

/**
 * Download CSV file
 */
export function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

