'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

interface CompletenessChartProps {
  score: number
}

export function CompletenessChart({ score }: CompletenessChartProps) {
  const data = [
    { name: 'Complete', value: score, color: '#14B8A6' },
    { name: 'Missing', value: 100 - score, color: '#E5E5E5' }
  ]

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number) => `${value}%`}
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #E5E5E5',
              borderRadius: '0.5rem',
              padding: '0.5rem'
            }}
          />
          <Legend 
            verticalAlign="bottom"
            height={36}
            formatter={(value) => (
              <span className="text-sm text-neutral-600">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="text-center mt-4">
        <p className="text-2xl font-bold text-neutral-900">{score}%</p>
        <p className="text-sm text-neutral-600">Data Completeness</p>
      </div>
    </div>
  )
}

