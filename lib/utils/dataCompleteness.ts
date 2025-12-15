import { GrowLogFormData } from '@/lib/types/growLog'

/**
 * Calculate data completeness score for a grow log
 * Matches the database function logic
 */
export function calculateCompletenessScore(formData: Partial<GrowLogFormData>): number {
  let score = 60 // Required fields complete (if we're calculating, assume they exist)
  
  // Optional fields (10 points each)
  if (formData.substrate_ratio?.trim()) score += 10
  if (formData.inoculation_details?.trim()) score += 10
  if (formData.light_hours_daily !== undefined && formData.light_hours_daily !== null) score += 10
  if (formData.tek_method?.trim()) score += 10
  
  // Bonus - TEK notes >100 chars: +15 points
  if (formData.tek_notes && formData.tek_notes.length > 100) score += 15
  
  // Bonus - General notes >50 chars: +5 points
  if (formData.notes && formData.notes.length > 50) score += 5
  
  // Bonus - Photos uploaded: +10 points
  if (formData.photos && formData.photos.length > 0) score += 10
  
  return Math.min(score, 100)
}

/**
 * Get points awarded based on completeness score
 */
export function getPointsForCompleteness(completeness: number): number {
  if (completeness >= 80) return 25
  return 10
}

/**
 * Get tier based on total points
 */
export function getTierForPoints(points: number): 'bronze' | 'silver' | 'gold' {
  if (points >= 500) return 'gold'
  if (points >= 100) return 'silver'
  return 'bronze'
}

