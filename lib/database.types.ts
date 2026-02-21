export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      coaching_style: 'DIRECT' | 'STRATEGIC' | 'DRIVEN';
      habit_type: 'GENERIC' | 'JOURNAL' | 'WORKOUT';
      anchor_type: 'NON_NEGOTIABLE' | 'GROWTH' | 'ROTATING_FOCUS';
      protocol_intent: 'BUILD' | 'QUIT';
      log_status: 'DONE' | 'MISSED' | 'SKIPPED' | 'PARTIAL';
      message_role: 'USER' | 'AI';
    };
    CompositeTypes: Record<string, never>;
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          timezone: string | null;
          locale: string | null;
          onboarding_completed: boolean;
          recovery_mode_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          timezone?: string | null;
          locale?: string | null;
          onboarding_completed?: boolean;
          recovery_mode_active?: boolean;
        };
        Update: {
          email?: string | null;
          timezone?: string | null;
          locale?: string | null;
          onboarding_completed?: boolean;
          recovery_mode_active?: boolean;
        };
      };
      onboarding_profiles: {
        Row: {
          id: string;
          user_id: string;
          ideal_day: string | null;
          goals_week: Json | null;
          goals_month: Json | null;
          goals_year: Json | null;
          goals_5_year: Json | null;
          passions: string[] | null;
          strengths: string[] | null;
          weaknesses: string[] | null;
          identity_statement: string | null;
          prior_habits: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          ideal_day?: string | null;
          goals_week?: Json | null;
          goals_month?: Json | null;
          goals_year?: Json | null;
          goals_5_year?: Json | null;
          passions?: string[] | null;
          strengths?: string[] | null;
          weaknesses?: string[] | null;
          identity_statement?: string | null;
          prior_habits?: string[] | null;
        };
        Update: {
          ideal_day?: string | null;
          goals_week?: Json | null;
          goals_month?: Json | null;
          goals_year?: Json | null;
          goals_5_year?: Json | null;
          passions?: string[] | null;
          strengths?: string[] | null;
          weaknesses?: string[] | null;
          identity_statement?: string | null;
          prior_habits?: string[] | null;
        };
      };
      ai_personality_profiles: {
        Row: {
          id: string;
          user_id: string;
          coaching_style: 'DIRECT' | 'STRATEGIC' | 'DRIVEN';
          tone_settings: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          coaching_style: 'DIRECT' | 'STRATEGIC' | 'DRIVEN';
          tone_settings?: Json;
        };
        Update: {
          coaching_style?: 'DIRECT' | 'STRATEGIC' | 'DRIVEN';
          tone_settings?: Json;
        };
      };
      habits: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          type: 'GENERIC' | 'JOURNAL' | 'WORKOUT';
          category: string | null;
          anchor_type: 'NON_NEGOTIABLE' | 'GROWTH' | 'ROTATING_FOCUS';
          intent: 'BUILD' | 'QUIT';
          target_value: number;
          target_unit: string;
          schedule: Json;
          difficulty_level: number;
          active: boolean;
          recommended_flag: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          title: string;
          type?: 'GENERIC' | 'JOURNAL' | 'WORKOUT';
          category?: string | null;
          anchor_type: 'NON_NEGOTIABLE' | 'GROWTH' | 'ROTATING_FOCUS';
          intent?: 'BUILD' | 'QUIT';
          target_value?: number;
          target_unit?: string;
          schedule?: Json;
          difficulty_level?: number;
          active?: boolean;
          recommended_flag?: boolean;
        };
        Update: {
          title?: string;
          type?: 'GENERIC' | 'JOURNAL' | 'WORKOUT';
          category?: string | null;
          anchor_type?: 'NON_NEGOTIABLE' | 'GROWTH' | 'ROTATING_FOCUS';
          intent?: 'BUILD' | 'QUIT';
          target_value?: number;
          target_unit?: string;
          schedule?: Json;
          difficulty_level?: number;
          active?: boolean;
        };
      };
      habit_logs: {
        Row: {
          id: string;
          habit_id: string;
          user_id: string;
          date: string;
          status: 'DONE' | 'PARTIAL' | 'SKIPPED' | 'MISSED';
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          habit_id: string;
          user_id: string;
          date: string;
          status: 'DONE' | 'PARTIAL' | 'SKIPPED' | 'MISSED';
          metadata?: Json | null;
        };
        Update: {
          status?: 'DONE' | 'PARTIAL' | 'SKIPPED' | 'MISSED';
          metadata?: Json | null;
        };
      };
      habit_months: {
        Row: {
          id: string;
          user_id: string;
          habit_id: string;
          month_start_date: string;
          joined_midmonth_date: string | null;
          days: Json;
          archived: boolean;
          created_at: string;
        };
        Insert: {
          user_id: string;
          habit_id: string;
          month_start_date: string;
          joined_midmonth_date?: string | null;
          days?: Json;
          archived?: boolean;
        };
        Update: {
          days?: Json;
          archived?: boolean;
        };
      };
      journals: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          content: string;
          mood: number | null;
          tags: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          date: string;
          content: string;
          mood?: number | null;
          tags?: string[] | null;
        };
        Update: {
          content?: string;
          mood?: number | null;
          tags?: string[] | null;
        };
      };
      workouts: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          exercises: Json | null;
          duration_minutes: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          date: string;
          exercises?: Json | null;
          duration_minutes?: number | null;
          notes?: string | null;
        };
        Update: {
          exercises?: Json | null;
          duration_minutes?: number | null;
          notes?: string | null;
        };
      };
      metrics_snapshots: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          momentum_score: number;
          consistency_rate: number;
          recovery_score: number | null;
          habit_health_scores: Json | null;
          raw_inputs: Json | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          date: string;
          momentum_score: number;
          consistency_rate: number;
          recovery_score?: number | null;
          habit_health_scores?: Json | null;
          raw_inputs?: Json | null;
        };
        Update: {
          momentum_score?: number;
          consistency_rate?: number;
          recovery_score?: number | null;
          habit_health_scores?: Json | null;
        };
      };
      ai_conversations: {
        Row: {
          id: string;
          user_id: string;
          role: 'USER' | 'AI';
          content: string;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          role: 'USER' | 'AI';
          content: string;
          metadata?: Json | null;
        };
        Update: {
          content?: string;
          metadata?: Json | null;
        };
      };
      recovery_events: {
        Row: {
          id: string;
          user_id: string;
          trigger_reason: string;
          started_at: string;
          resolved_at: string | null;
          actions_taken: Json | null;
        };
        Insert: {
          user_id: string;
          trigger_reason: string;
          started_at?: string;
          resolved_at?: string | null;
          actions_taken?: Json | null;
        };
        Update: {
          resolved_at?: string | null;
          actions_taken?: Json | null;
        };
      };
      daily_greetings: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          content: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          date: string;
          content: string;
        };
        Update: {
          content?: string;
        };
      };
      embeddings: {
        Row: {
          id: string;
          user_id: string;
          source_type: string;
          source_id: string;
          content_preview: string | null;
          embedding: number[] | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          source_type: string;
          source_id: string;
          content_preview?: string | null;
          embedding?: number[] | null;
        };
        Update: {
          embedding?: number[] | null;
        };
      };
    };
  };
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type OnboardingProfile = Database['public']['Tables']['onboarding_profiles']['Row'];
export type AIPersonalityProfile = Database['public']['Tables']['ai_personality_profiles']['Row'];
export type Habit = Database['public']['Tables']['habits']['Row'];
export type HabitLog = Database['public']['Tables']['habit_logs']['Row'];
export type Journal = Database['public']['Tables']['journals']['Row'];
export type Workout = Database['public']['Tables']['workouts']['Row'];
export type MetricsSnapshot = Database['public']['Tables']['metrics_snapshots']['Row'];
export type AIConversation = Database['public']['Tables']['ai_conversations']['Row'];
export type DailyGreeting = Database['public']['Tables']['daily_greetings']['Row'];
