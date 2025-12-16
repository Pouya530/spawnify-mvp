'use client'

import { CheckCircle, FileText, TrendingUp, Award } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Database } from '@/lib/types/database'
import {
  getTierInfo,
  getNextTierPoints,
  getNextTierName,
  calculateTierProgress
} from '@/lib/utils/tierProgress'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'

type UserProfile = Database['public']['Tables']['user_profiles']['Row']
type GrowLog = Database['public']['Tables']['grow_logs']['Row']

interface GamificationStatsProps {
  profile: UserProfile | null
  logs?: GrowLog[]
}

export function GamificationStats({ profile, logs = [] }: GamificationStatsProps) {
  const tier = profile?.verification_level || 'bronze'
  const points = profile?.total_points || 0
  const tierInfo = getTierInfo(tier)
  const nextTierPoints = getNextTierPoints(points)
  const nextTierName = getNextTierName(tier)
  const progressPercentage = calculateTierProgress(points, tier)
  
  // Calculate additional stats
  const totalLogs = logs.length
  const completedLogs = logs.filter(log => log.data_completeness_score >= 80).length
  const averageCompleteness = logs.length > 0
    ? Math.round(logs.reduce((sum, log) => sum + log.data_completeness_score, 0) / logs.length)
    : 0
  
  // Create chart data showing progress through tiers
  const chartData = [
    {
      tier: 'Bronze',
      value: tier === 'bronze' ? Math.min(points, 99) : 99,
      max: 99,
      color: '#CD7F32'
    },
    {
      tier: 'Silver',
      value: tier === 'silver' ? Math.min(points - 100, 399) : tier === 'gold' ? 399 : 0,
      max: 399,
      color: '#C0C0C0'
    },
    {
      tier: 'Gold',
      value: tier === 'gold' ? Math.max(0, points - 500) : 0,
      max: 500,
      color: '#FFD700'
    }
  ]
  
  return (
    <Card className="p-8">
      <h2 className="text-xl font-bold text-neutral-900 mb-6">
        Your Progress
      </h2>
      
      <div className="space-y-6">
        {/* Current Tier */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-600 mb-2">Current Tier</p>
            <Badge 
              variant={tier as 'bronze' | 'silver' | 'gold'} 
              className="text-base px-4 py-2"
            >
              {tierInfo.icon} {tierInfo.name}
            </Badge>
          </div>
          
          <div className="text-right">
            <p className="text-sm text-neutral-600 mb-1">Total Points</p>
            <p className="text-3xl font-bold text-neutral-900">
              {points}
            </p>
          </div>
        </div>
        
        {/* Progress to Next Tier */}
        {nextTierPoints && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-neutral-600">
                Progress to {nextTierName}
              </span>
              <span className="font-medium text-neutral-900">
                {points} / {nextTierPoints} points
              </span>
            </div>
            
            <div className="h-3 bg-neutral-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary-500 transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            
            <p className="text-xs text-neutral-500">
              {nextTierPoints - points} points until {nextTierName}
            </p>
          </div>
        )}
        
        {!nextTierPoints && (
          <div className="p-4 bg-primary-50 border border-primary-200 rounded-xl">
            <p className="text-sm text-primary-900 font-medium">
              🎉 Congratulations! You&apos;ve reached the highest tier!
            </p>
          </div>
        )}
        
        {/* Additional Stats */}
        {totalLogs > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-neutral-200">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <FileText className="w-5 h-5 text-neutral-400" />
                <p className="text-sm text-neutral-600">Total Logs</p>
              </div>
              <p className="text-2xl font-bold text-neutral-900">{totalLogs}</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Award className="w-5 h-5 text-neutral-400" />
                <p className="text-sm text-neutral-600">Complete Logs</p>
              </div>
              <p className="text-2xl font-bold text-neutral-900">{completedLogs}</p>
              <p className="text-xs text-neutral-500 mt-1">
                {totalLogs > 0 ? Math.round((completedLogs / totalLogs) * 100) : 0}% completion rate
              </p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-neutral-400" />
                <p className="text-sm text-neutral-600">Avg Completeness</p>
              </div>
              <p className="text-2xl font-bold text-neutral-900">{averageCompleteness}%</p>
            </div>
          </div>
        )}

        {/* Tier Progress Chart */}
        {totalLogs > 0 && (
          <div className="pt-4 border-t border-neutral-200">
            <p className="text-sm font-medium text-neutral-900 mb-4">
              Tier Progress Visualization
            </p>
            <div className="w-full h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                  <XAxis type="number" domain={[0, 500]} stroke="#525252" style={{ fontSize: '10px' }} />
                  <YAxis dataKey="tier" type="category" stroke="#525252" style={{ fontSize: '12px' }} width={60} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #E5E5E5',
                      borderRadius: '0.5rem',
                      padding: '0.5rem'
                    }}
                    formatter={(value: number) => [`${value} points`, 'Current']}
                  />
                  <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} opacity={entry.value > 0 ? 1 : 0.3} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-4 mt-2 text-xs text-neutral-500">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-[#CD7F32]"></div>
                <span>Bronze (0-99)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-[#C0C0C0]"></div>
                <span>Silver (100-499)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-[#FFD700]"></div>
                <span>Gold (500+)</span>
              </div>
            </div>
          </div>
        )}

        {/* Tier Benefits */}
        <div className="pt-4 border-t border-neutral-200">
          <p className="text-sm font-medium text-neutral-900 mb-3">
            How to Earn Points
          </p>
          <div className="space-y-2 text-sm text-neutral-600">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success-500 flex-shrink-0" />
              <span>Create a basic log: +10 points</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success-500 flex-shrink-0" />
              <span>Complete log (≥80% completeness): +25 points</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success-500 flex-shrink-0" />
              <span>Add detailed TEK notes: +15 points</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-success-500 flex-shrink-0" />
              <span>Upload photos: +10 points</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

