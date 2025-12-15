export function getTierThresholds() {
  return {
    bronze: { min: 0, max: 99 },
    silver: { min: 100, max: 499 },
    gold: { min: 500, max: Infinity }
  }
}

export function getNextTier(currentTier: string): string | null {
  const tiers = ['bronze', 'silver', 'gold']
  const currentIndex = tiers.indexOf(currentTier)
  if (currentIndex === -1 || currentIndex === tiers.length - 1) {
    return null
  }
  return tiers[currentIndex + 1]
}

export function getPointsToNextTier(currentPoints: number, currentTier: string): number | null {
  const nextTier = getNextTier(currentTier)
  if (!nextTier) return null
  
  const thresholds = getTierThresholds()
  return thresholds[nextTier as keyof typeof thresholds].min - currentPoints
}

export function getNextTierName(currentTier: string): string {
  const next = {
    bronze: 'Silver',
    silver: 'Gold',
    gold: 'Gold'
  }
  return next[currentTier as keyof typeof next] || 'Silver'
}

export function getNextTierPoints(currentPoints: number): number | null {
  if (currentPoints < 100) return 100 // Bronze → Silver
  if (currentPoints < 500) return 500 // Silver → Gold
  return null // Already Gold
}

export function calculateTierProgress(points: number, tier: string): number {
  if (tier === 'bronze') {
    return Math.min((points / 100) * 100, 100)
  }
  if (tier === 'gold') {
    return 100 // Already at max
  }
  if (tier === 'silver') {
    return Math.min(((points - 100) / 400) * 100, 100)
  }
  return 0
}

export function getTierInfo(tier: string) {
  const tiers: Record<string, { name: string; icon: string }> = {
    bronze: { name: 'Bronze', icon: '🥉' },
    silver: { name: 'Silver', icon: '🥈' },
    gold: { name: 'Gold', icon: '🥇' }
  }
  return tiers[tier] || tiers.bronze
}

