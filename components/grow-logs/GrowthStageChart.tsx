'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import { format } from 'date-fns'
import { Database } from '@/lib/types/database'

type GrowLog = Database['public']['Tables']['grow_logs']['Row']

interface GrowthStageChartProps {
  logs: GrowLog[]
}

const stageColors: Record<string, string> = {
  'Inoculation': '#8B5CF6',
  'Colonization': '#14B8A6',
  'Fruiting': '#22C55E',
  'Harvest': '#F59E0B'
}

export function GrowthStageChart({ logs }: GrowthStageChartProps) {
  const chartData = logs.map(log => ({
    date: format(new Date(log.log_date), 'MMM dd'),
    stage: log.growth_stage,
    fullDate: log.log_date
  }))

  // Count occurrences of each stage
  const stageCounts = chartData.reduce((acc, item) => {
    acc[item.stage] = (acc[item.stage] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const barData = Object.entries(stageCounts).map(([stage, count]) => ({
    stage,
    count,
    color: stageColors[stage] || '#A3A3A3'
  }))

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={barData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
          <XAxis 
            dataKey="stage" 
            stroke="#525252"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#525252"
            style={{ fontSize: '12px' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #E5E5E5',
              borderRadius: '0.5rem',
              padding: '0.5rem'
            }}
            formatter={(value: number) => [`${value} log${value !== 1 ? 's' : ''}`, 'Count']}
          />
          <Bar dataKey="count" radius={[8, 8, 0, 0]}>
            {barData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

