/**
 * Database Types
 * 
 * This file should be generated using Supabase CLI:
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID > lib/types/database.ts
 * 
 * For now, this is a template structure that matches the schema.
 * Replace with generated types after running the CLI command.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          verification_level: 'bronze' | 'silver' | 'gold'
          total_points: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          verification_level?: 'bronze' | 'silver' | 'gold'
          total_points?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          verification_level?: 'bronze' | 'silver' | 'gold'
          total_points?: number
          created_at?: string
          updated_at?: string
        }
      }
      grow_logs: {
        Row: {
          id: string
          user_id: string
          growth_stage: 'Inoculation' | 'Colonization' | 'Fruiting' | 'Harvest'
          log_date: string
          temperature: number | null
          humidity: number | null
          ph_level: number | null
          weight: number | null
          light_hours_daily: number | null
          strain: string
          substrate: string
          substrate_ratio: string | null
          inoculation_method: string
          inoculation_details: string | null
          growing_method: string
          tek_method: string | null
          tek_notes: string | null
          photos: string[] | null
          notes: string | null
          data_completeness_score: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          growth_stage: 'Inoculation' | 'Colonization' | 'Fruiting' | 'Harvest'
          log_date: string
          temperature?: number | null
          humidity?: number | null
          ph_level?: number | null
          weight?: number | null
          light_hours_daily?: number | null
          strain: string
          substrate: string
          substrate_ratio?: string | null
          inoculation_method: string
          inoculation_details?: string | null
          growing_method: string
          tek_method?: string | null
          tek_notes?: string | null
          photos?: string[] | null
          notes?: string | null
          data_completeness_score?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          growth_stage?: 'Inoculation' | 'Colonization' | 'Fruiting' | 'Harvest'
          log_date?: string
          temperature?: number | null
          humidity?: number | null
          ph_level?: number | null
          weight?: number | null
          light_hours_daily?: number | null
          strain?: string
          substrate?: string
          substrate_ratio?: string | null
          inoculation_method?: string
          inoculation_details?: string | null
          growing_method?: string
          tek_method?: string | null
          tek_notes?: string | null
          photos?: string[] | null
          notes?: string | null
          data_completeness_score?: number
          created_at?: string
          updated_at?: string
        }
      }
      admin_users: {
        Row: {
          user_id: string
          role: 'admin' | 'super_admin'
          created_at: string
        }
        Insert: {
          user_id: string
          role?: 'admin' | 'super_admin'
          created_at?: string
        }
        Update: {
          user_id?: string
          role?: 'admin' | 'super_admin'
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_user_points: {
        Args: {
          p_user_id: string
          p_points: number
        }
        Returns: undefined
      }
      calculate_completeness_score: {
        Args: {
          p_log_id: string
        }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types
export type UserProfile = Database['public']['Tables']['user_profiles']['Row']
export type GrowLog = Database['public']['Tables']['grow_logs']['Row']
export type AdminUser = Database['public']['Tables']['admin_users']['Row']

