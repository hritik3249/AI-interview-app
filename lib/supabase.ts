import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      interview_sessions: {
        Row: {
          id: string
          user_id: string
          mode: string
          airline: string
          difficulty: string
          overall_score: number
          selection_probability: number
          readiness_level: string
          scores_breakdown: Record<string, number>
          recruiter_note: string
          questions_answered: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['interview_sessions']['Row'], 'id' | 'created_at'>
      }
    }
  }
}
