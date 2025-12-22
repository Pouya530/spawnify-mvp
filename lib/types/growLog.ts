import { GrowLog } from './database'

export interface SubstrateEntry {
  substrate: string
  percentage: number
}

export interface GrowLogFormData {
  growth_stage: string
  log_date: string
  temperature?: number
  humidity?: number
  ph_level?: number
  weight?: number
  light_hours_daily?: number
  strain: string
  substrate: string
  substrates?: SubstrateEntry[] // New: array of substrates with percentages
  substrate_ratio?: string
  inoculation_method: string
  inoculation_details?: string
  growing_method: string
  tek_method?: string
  tek_notes?: string
  photos?: string[]
  notes?: string
}

export interface GrowLogWithUser extends GrowLog {
  user_profile?: {
    email: string
    full_name?: string
  }
}

export type GrowthStage = 'Inoculation' | 'Colonization' | 'Fruiting' | 'Harvest'
export type VerificationLevel = 'bronze' | 'silver' | 'gold'

