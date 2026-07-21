// Generated-compatible snapshot. Refresh with `pnpm db:types` after applying migrations.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type BaseRow = { created_at: string; updated_at: string };

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: BaseRow & {
          id: string;
          display_name: string;
          email: string;
          onboarding_status: 'not_started' | 'in_progress' | 'completed';
          onboarding_step: number;
        };
        Insert: {
          id: string;
          display_name: string;
          email: string;
          onboarding_status?: 'not_started' | 'in_progress' | 'completed';
          onboarding_step?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>;
        Relationships: [];
      };
      student_profiles: {
        Row: BaseRow & {
          user_id: string;
          residency_year: number | null;
          graduation_year: number | null;
          weekly_study_hours: number | null;
          experience_level: string | null;
          preferred_session_minutes: number | null;
          assessment_preference: string | null;
        };
        Insert: {
          user_id: string;
          residency_year?: number | null;
          graduation_year?: number | null;
          weekly_study_hours?: number | null;
          experience_level?: string | null;
          preferred_session_minutes?: number | null;
          assessment_preference?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database['public']['Tables']['student_profiles']['Insert']
        >;
        Relationships: [];
      };
      student_availability: {
        Row: BaseRow & {
          id: string;
          user_id: string;
          weekday: number;
          minutes_available: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          weekday: number;
          minutes_available: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<
          Database['public']['Tables']['student_availability']['Insert']
        >;
        Relationships: [];
      };
      institutions: {
        Row: BaseRow & {
          id: string;
          name: string;
          acronym: string;
          state_code: string;
          is_active: boolean;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      exam_boards: {
        Row: BaseRow & { id: string; name: string; is_active: boolean };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      exam_programs: {
        Row: BaseRow & {
          id: string;
          institution_id: string;
          exam_board_id: string | null;
          name: string;
          is_active: boolean;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      exam_editions: {
        Row: BaseRow & {
          id: string;
          exam_program_id: string;
          year: number;
          application_date: string | null;
          registration_deadline: string | null;
          is_active: boolean;
        };
        Insert: never;
        Update: never;
        Relationships: [];
      };
      student_target_exams: {
        Row: {
          id: string;
          user_id: string;
          exam_edition_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          exam_edition_id: string;
          created_at?: string;
        };
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      save_onboarding: {
        Args: {
          p_step: number;
          p_display_name?: string | null;
          p_residency_year?: number | null;
          p_graduation_year?: number | null;
          p_experience_level?: string | null;
          p_preferred_session_minutes?: number | null;
          p_assessment_preference?: string | null;
          p_availability?: Json | null;
          p_exam_edition_ids?: string[] | null;
          p_complete?: boolean;
        };
        Returns: undefined;
      };
    };
    Enums: { onboarding_status: 'not_started' | 'in_progress' | 'completed' };
    CompositeTypes: Record<string, never>;
  };
}
