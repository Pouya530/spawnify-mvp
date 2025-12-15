'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'
import { Database } from '@/lib/types/database'

type GrowLog = Database['public']['Tables']['grow_logs']['Row']

interface EnvironmentalDataChartProps {
  logs: GrowLog[]
}

export function EnvironmentalDataChart({ logs }: EnvironmentalDataChartProps) {
  // Filter logs that have environmental data
  const dataWithEnv = logs.filter(log => 
    log.temperature !== null || 
    log.humidity !== null || 
    log.ph_level !== null
  )

  if (dataWithEnv.length === 0) {
    return null
  }

  const chartData = dataWithEnv.map(log => ({
    date: format(new Date(log.log_date), 'MMM dd'),
    temperature: log.temperature || null,
    humidity: log.humidity || null,
    ph: log.ph_level || null
  }))

  return (
    <div className="w-full h-64 mt-6">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
          <XAxis 
            dataKey="date" 
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
          />
          <Legend 
            formatter={(value) => (
              <span className="text-sm text-neutral-600">{value}</span>
            )}
          />
          {chartData.some(d => d.temperature !== null) && (
            <Line 
              type="monotone" 
              dataKey="temperature" 
              stroke="#14B8A6" 
              strokeWidth={2}
              dot={{ fill: '#14B8A6', r: 4 }}
              name="Temperature (°F)"
            />
          )}
          {chartData.some(d => d.humidity !== null) && (
            <Line 
              type="monotone" 
              dataKey="humidity" 
              stroke="#8B5CF6" 
              strokeWidth={2}
              dot={{ fill: '#8B5CF6', r: 4 }}
              name="Humidity (%)"
            />
          )}
          {chartData.some(d => d.ph !== null) && (
            <Line 
              type="monotone" 
              dataKey="ph" 
              stroke="#22C55E" 
              strokeWidth={2}
              dot={{ fill: '#22C55E', r: 4 }}
              name="pH Level"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

