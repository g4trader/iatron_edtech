export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '14.5';
  };
  public: {
    Tables: {
      academic_references: {
        Row: {
          authors: string | null;
          citation: string | null;
          created_at: string;
          external_identifier: string | null;
          id: string;
          publication_year: number | null;
          title: string;
          updated_at: string;
          url: string | null;
        };
        Insert: {
          authors?: string | null;
          citation?: string | null;
          created_at?: string;
          external_identifier?: string | null;
          id?: string;
          publication_year?: number | null;
          title: string;
          updated_at?: string;
          url?: string | null;
        };
        Update: {
          authors?: string | null;
          citation?: string | null;
          created_at?: string;
          external_identifier?: string | null;
          id?: string;
          publication_year?: number | null;
          title?: string;
          updated_at?: string;
          url?: string | null;
        };
        Relationships: [];
      };
      assessment_competencies: {
        Row: {
          assessment_id: string;
          competency_id: string;
        };
        Insert: {
          assessment_id: string;
          competency_id: string;
        };
        Update: {
          assessment_id?: string;
          competency_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'assessment_competencies_assessment_id_fkey';
            columns: ['assessment_id'];
            isOneToOne: false;
            referencedRelation: 'diagnostic_assessments';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'assessment_competencies_competency_id_fkey';
            columns: ['competency_id'];
            isOneToOne: false;
            referencedRelation: 'competencies';
            referencedColumns: ['id'];
          },
        ];
      };
      assessment_question_selections: {
        Row: {
          assessment_id: string;
          id: string;
          question_version_id: string;
          rationale: Json;
          selected_at: string;
          selection_order: number;
        };
        Insert: {
          assessment_id: string;
          id?: string;
          question_version_id: string;
          rationale: Json;
          selected_at?: string;
          selection_order: number;
        };
        Update: {
          assessment_id?: string;
          id?: string;
          question_version_id?: string;
          rationale?: Json;
          selected_at?: string;
          selection_order?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'assessment_question_selections_assessment_id_fkey';
            columns: ['assessment_id'];
            isOneToOne: false;
            referencedRelation: 'diagnostic_assessments';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'assessment_question_selections_question_version_id_fkey';
            columns: ['question_version_id'];
            isOneToOne: false;
            referencedRelation: 'question_versions';
            referencedColumns: ['id'];
          },
        ];
      };
      assessment_result_competencies: {
        Row: {
          assessment_result_id: string;
          classification: string;
          competency_id: string;
          confidence: number;
          confidence_level: string;
          evidence_count: number;
          mastery: number;
        };
        Insert: {
          assessment_result_id: string;
          classification: string;
          competency_id: string;
          confidence: number;
          confidence_level: string;
          evidence_count: number;
          mastery: number;
        };
        Update: {
          assessment_result_id?: string;
          classification?: string;
          competency_id?: string;
          confidence?: number;
          confidence_level?: string;
          evidence_count?: number;
          mastery?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'assessment_result_competencies_assessment_result_id_fkey';
            columns: ['assessment_result_id'];
            isOneToOne: false;
            referencedRelation: 'assessment_results';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'assessment_result_competencies_competency_id_fkey';
            columns: ['competency_id'];
            isOneToOne: false;
            referencedRelation: 'competencies';
            referencedColumns: ['id'];
          },
        ];
      };
      assessment_results: {
        Row: {
          algorithm_version: string;
          answered_count: number;
          assessment_id: string;
          correct_count: number;
          created_at: string;
          diagnostic_coverage: number;
          id: string;
          overall_confidence: number;
          student_id: string;
        };
        Insert: {
          algorithm_version: string;
          answered_count: number;
          assessment_id: string;
          correct_count: number;
          created_at?: string;
          diagnostic_coverage: number;
          id?: string;
          overall_confidence: number;
          student_id: string;
        };
        Update: {
          algorithm_version?: string;
          answered_count?: number;
          assessment_id?: string;
          correct_count?: number;
          created_at?: string;
          diagnostic_coverage?: number;
          id?: string;
          overall_confidence?: number;
          student_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'assessment_results_assessment_id_fkey';
            columns: ['assessment_id'];
            isOneToOne: true;
            referencedRelation: 'diagnostic_assessments';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'assessment_results_student_id_fkey';
            columns: ['student_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      assessment_statuses: {
        Row: {
          code: string;
          name: string;
        };
        Insert: {
          code: string;
          name: string;
        };
        Update: {
          code?: string;
          name?: string;
        };
        Relationships: [];
      };
      competencies: {
        Row: {
          code: string;
          created_at: string;
          description: string;
          id: string;
          is_active: boolean;
          name: string;
          subtheme_id: string;
          updated_at: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          description: string;
          id?: string;
          is_active?: boolean;
          name: string;
          subtheme_id: string;
          updated_at?: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          description?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          subtheme_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'competencies_subtheme_id_fkey';
            columns: ['subtheme_id'];
            isOneToOne: false;
            referencedRelation: 'subthemes';
            referencedColumns: ['id'];
          },
        ];
      };
      competency_objectives: {
        Row: {
          competency_id: string;
          description: string;
          id: string;
          position: number;
        };
        Insert: {
          competency_id: string;
          description: string;
          id?: string;
          position: number;
        };
        Update: {
          competency_id?: string;
          description?: string;
          id?: string;
          position?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'competency_objectives_competency_id_fkey';
            columns: ['competency_id'];
            isOneToOne: false;
            referencedRelation: 'competencies';
            referencedColumns: ['id'];
          },
        ];
      };
      competency_references: {
        Row: {
          competency_id: string;
          reference_id: string;
        };
        Insert: {
          competency_id: string;
          reference_id: string;
        };
        Update: {
          competency_id?: string;
          reference_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'competency_references_competency_id_fkey';
            columns: ['competency_id'];
            isOneToOne: false;
            referencedRelation: 'competencies';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'competency_references_reference_id_fkey';
            columns: ['reference_id'];
            isOneToOne: false;
            referencedRelation: 'academic_references';
            referencedColumns: ['id'];
          },
        ];
      };
      diagnostic_assessments: {
        Row: {
          algorithm: string;
          algorithm_version: string;
          completed_at: string | null;
          created_at: string;
          diagnostic_coverage: number | null;
          duration_minutes: number;
          exam_program_id: string | null;
          id: string;
          objective: string;
          overall_confidence: number | null;
          question_count: number;
          specialty_id: string | null;
          started_at: string;
          status: string;
          student_id: string;
        };
        Insert: {
          algorithm?: string;
          algorithm_version?: string;
          completed_at?: string | null;
          created_at?: string;
          diagnostic_coverage?: number | null;
          duration_minutes: number;
          exam_program_id?: string | null;
          id?: string;
          objective: string;
          overall_confidence?: number | null;
          question_count: number;
          specialty_id?: string | null;
          started_at?: string;
          status?: string;
          student_id: string;
        };
        Update: {
          algorithm?: string;
          algorithm_version?: string;
          completed_at?: string | null;
          created_at?: string;
          diagnostic_coverage?: number | null;
          duration_minutes?: number;
          exam_program_id?: string | null;
          id?: string;
          objective?: string;
          overall_confidence?: number | null;
          question_count?: number;
          specialty_id?: string | null;
          started_at?: string;
          status?: string;
          student_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'diagnostic_assessments_exam_program_id_fkey';
            columns: ['exam_program_id'];
            isOneToOne: false;
            referencedRelation: 'exam_programs';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'diagnostic_assessments_specialty_id_fkey';
            columns: ['specialty_id'];
            isOneToOne: false;
            referencedRelation: 'specialties';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'diagnostic_assessments_status_fkey';
            columns: ['status'];
            isOneToOne: false;
            referencedRelation: 'assessment_statuses';
            referencedColumns: ['code'];
          },
          {
            foreignKeyName: 'diagnostic_assessments_student_id_fkey';
            columns: ['student_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      exam_boards: {
        Row: {
          acronym: string | null;
          created_at: string;
          id: string;
          is_active: boolean;
          name: string;
          updated_at: string;
        };
        Insert: {
          acronym?: string | null;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name: string;
          updated_at?: string;
        };
        Update: {
          acronym?: string | null;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      exam_editions: {
        Row: {
          application_date: string | null;
          city: string | null;
          created_at: string;
          duration_minutes: number | null;
          edition: string | null;
          exam_board_id: string | null;
          exam_program_id: string;
          id: string;
          is_active: boolean;
          modality: string | null;
          question_count: number | null;
          registration_deadline: string | null;
          updated_at: string;
          year: number;
        };
        Insert: {
          application_date?: string | null;
          city?: string | null;
          created_at?: string;
          duration_minutes?: number | null;
          edition?: string | null;
          exam_board_id?: string | null;
          exam_program_id: string;
          id?: string;
          is_active?: boolean;
          modality?: string | null;
          question_count?: number | null;
          registration_deadline?: string | null;
          updated_at?: string;
          year: number;
        };
        Update: {
          application_date?: string | null;
          city?: string | null;
          created_at?: string;
          duration_minutes?: number | null;
          edition?: string | null;
          exam_board_id?: string | null;
          exam_program_id?: string;
          id?: string;
          is_active?: boolean;
          modality?: string | null;
          question_count?: number | null;
          registration_deadline?: string | null;
          updated_at?: string;
          year?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'exam_editions_exam_board_id_fkey';
            columns: ['exam_board_id'];
            isOneToOne: false;
            referencedRelation: 'exam_boards';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'exam_editions_exam_program_id_fkey';
            columns: ['exam_program_id'];
            isOneToOne: false;
            referencedRelation: 'exam_programs';
            referencedColumns: ['id'];
          },
        ];
      };
      exam_programs: {
        Row: {
          created_at: string;
          exam_board_id: string | null;
          id: string;
          institution_id: string;
          is_active: boolean;
          name: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          exam_board_id?: string | null;
          id?: string;
          institution_id: string;
          is_active?: boolean;
          name: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          exam_board_id?: string | null;
          id?: string;
          institution_id?: string;
          is_active?: boolean;
          name?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'exam_programs_exam_board_id_fkey';
            columns: ['exam_board_id'];
            isOneToOne: false;
            referencedRelation: 'exam_boards';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'exam_programs_institution_id_fkey';
            columns: ['institution_id'];
            isOneToOne: false;
            referencedRelation: 'institutions';
            referencedColumns: ['id'];
          },
        ];
      };
      exam_questions: {
        Row: {
          created_at: string;
          exam_edition_id: string;
          position: number;
          question_id: string;
          question_version_id: string;
        };
        Insert: {
          created_at?: string;
          exam_edition_id: string;
          position: number;
          question_id: string;
          question_version_id: string;
        };
        Update: {
          created_at?: string;
          exam_edition_id?: string;
          position?: number;
          question_id?: string;
          question_version_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'exam_questions_exam_edition_id_fkey';
            columns: ['exam_edition_id'];
            isOneToOne: false;
            referencedRelation: 'exam_editions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'exam_questions_question_id_fkey';
            columns: ['question_id'];
            isOneToOne: false;
            referencedRelation: 'questions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'exam_questions_question_version_id_question_id_fkey';
            columns: ['question_version_id', 'question_id'];
            isOneToOne: false;
            referencedRelation: 'question_versions';
            referencedColumns: ['id', 'question_id'];
          },
        ];
      };
      guideline_competencies: {
        Row: {
          competency_id: string;
          guideline_id: string;
        };
        Insert: {
          competency_id: string;
          guideline_id: string;
        };
        Update: {
          competency_id?: string;
          guideline_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'guideline_competencies_competency_id_fkey';
            columns: ['competency_id'];
            isOneToOne: false;
            referencedRelation: 'competencies';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'guideline_competencies_guideline_id_fkey';
            columns: ['guideline_id'];
            isOneToOne: false;
            referencedRelation: 'guidelines';
            referencedColumns: ['id'];
          },
        ];
      };
      guideline_issuers: {
        Row: {
          acronym: string | null;
          created_at: string;
          id: string;
          name: string;
          updated_at: string;
          url: string | null;
        };
        Insert: {
          acronym?: string | null;
          created_at?: string;
          id?: string;
          name: string;
          updated_at?: string;
          url?: string | null;
        };
        Update: {
          acronym?: string | null;
          created_at?: string;
          id?: string;
          name?: string;
          updated_at?: string;
          url?: string | null;
        };
        Relationships: [];
      };
      guideline_specialties: {
        Row: {
          guideline_id: string;
          specialty_id: string;
        };
        Insert: {
          guideline_id: string;
          specialty_id: string;
        };
        Update: {
          guideline_id?: string;
          specialty_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'guideline_specialties_guideline_id_fkey';
            columns: ['guideline_id'];
            isOneToOne: false;
            referencedRelation: 'guidelines';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'guideline_specialties_specialty_id_fkey';
            columns: ['specialty_id'];
            isOneToOne: false;
            referencedRelation: 'specialties';
            referencedColumns: ['id'];
          },
        ];
      };
      guidelines: {
        Row: {
          created_at: string;
          effective_from: string | null;
          effective_until: string | null;
          id: string;
          issued_on: string | null;
          issuer_id: string;
          notes: string | null;
          stable_key: string;
          status: string;
          title: string;
          updated_at: string;
          url: string | null;
          version: string;
        };
        Insert: {
          created_at?: string;
          effective_from?: string | null;
          effective_until?: string | null;
          id?: string;
          issued_on?: string | null;
          issuer_id: string;
          notes?: string | null;
          stable_key: string;
          status?: string;
          title: string;
          updated_at?: string;
          url?: string | null;
          version: string;
        };
        Update: {
          created_at?: string;
          effective_from?: string | null;
          effective_until?: string | null;
          id?: string;
          issued_on?: string | null;
          issuer_id?: string;
          notes?: string | null;
          stable_key?: string;
          status?: string;
          title?: string;
          updated_at?: string;
          url?: string | null;
          version?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'guidelines_issuer_id_fkey';
            columns: ['issuer_id'];
            isOneToOne: false;
            referencedRelation: 'guideline_issuers';
            referencedColumns: ['id'];
          },
        ];
      };
      institutions: {
        Row: {
          acronym: string;
          created_at: string;
          id: string;
          is_active: boolean;
          name: string;
          state_code: string;
          updated_at: string;
        };
        Insert: {
          acronym: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name: string;
          state_code: string;
          updated_at?: string;
        };
        Update: {
          acronym?: string;
          created_at?: string;
          id?: string;
          is_active?: boolean;
          name?: string;
          state_code?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      learning_event_types: {
        Row: {
          code: string;
          created_at: string;
          description: string;
          name: string;
          produces_evidence: boolean;
        };
        Insert: {
          code: string;
          created_at?: string;
          description: string;
          name: string;
          produces_evidence?: boolean;
        };
        Update: {
          code?: string;
          created_at?: string;
          description?: string;
          name?: string;
          produces_evidence?: boolean;
        };
        Relationships: [];
      };
      learning_events: {
        Row: {
          created_at: string;
          event_type: string;
          id: string;
          idempotency_key: string;
          occurred_at: string;
          payload: Json;
          schema_version: number;
          student_id: string;
        };
        Insert: {
          created_at?: string;
          event_type: string;
          id?: string;
          idempotency_key: string;
          occurred_at: string;
          payload?: Json;
          schema_version?: number;
          student_id: string;
        };
        Update: {
          created_at?: string;
          event_type?: string;
          id?: string;
          idempotency_key?: string;
          occurred_at?: string;
          payload?: Json;
          schema_version?: number;
          student_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'learning_events_event_type_fkey';
            columns: ['event_type'];
            isOneToOne: false;
            referencedRelation: 'learning_event_types';
            referencedColumns: ['code'];
          },
          {
            foreignKeyName: 'learning_events_student_id_fkey';
            columns: ['student_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      learning_evidence: {
        Row: {
          algorithm_version: string;
          competency_id: string;
          created_at: string;
          difficulty: number;
          id: string;
          is_correct: boolean;
          observed_at: string;
          response_time_ms: number | null;
          source_event_id: string;
          student_id: string;
          weight: number;
        };
        Insert: {
          algorithm_version: string;
          competency_id: string;
          created_at?: string;
          difficulty: number;
          id?: string;
          is_correct: boolean;
          observed_at: string;
          response_time_ms?: number | null;
          source_event_id: string;
          student_id: string;
          weight: number;
        };
        Update: {
          algorithm_version?: string;
          competency_id?: string;
          created_at?: string;
          difficulty?: number;
          id?: string;
          is_correct?: boolean;
          observed_at?: string;
          response_time_ms?: number | null;
          source_event_id?: string;
          student_id?: string;
          weight?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'learning_evidence_competency_id_fkey';
            columns: ['competency_id'];
            isOneToOne: false;
            referencedRelation: 'competencies';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'learning_evidence_source_event_id_fkey';
            columns: ['source_event_id'];
            isOneToOne: false;
            referencedRelation: 'learning_events';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'learning_evidence_student_id_fkey';
            columns: ['student_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      mastery_snapshots: {
        Row: {
          algorithm_version: string;
          calculated_at: string;
          competency_id: string;
          confidence: number;
          evidence_count: number;
          id: string;
          last_evidence_at: string;
          mastery: number;
          source_event_id: string;
          student_id: string;
          trend: string;
        };
        Insert: {
          algorithm_version: string;
          calculated_at?: string;
          competency_id: string;
          confidence: number;
          evidence_count: number;
          id?: string;
          last_evidence_at: string;
          mastery: number;
          source_event_id: string;
          student_id: string;
          trend: string;
        };
        Update: {
          algorithm_version?: string;
          calculated_at?: string;
          competency_id?: string;
          confidence?: number;
          evidence_count?: number;
          id?: string;
          last_evidence_at?: string;
          mastery?: number;
          source_event_id?: string;
          student_id?: string;
          trend?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'mastery_snapshots_competency_id_fkey';
            columns: ['competency_id'];
            isOneToOne: false;
            referencedRelation: 'competencies';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mastery_snapshots_source_event_id_fkey';
            columns: ['source_event_id'];
            isOneToOne: false;
            referencedRelation: 'learning_events';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mastery_snapshots_student_id_fkey';
            columns: ['student_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      medical_areas: {
        Row: {
          code: string;
          created_at: string;
          description: string | null;
          id: string;
          is_active: boolean;
          name: string;
          updated_at: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          name: string;
          updated_at?: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          created_at: string;
          display_name: string;
          email: string;
          id: string;
          onboarding_status: Database['public']['Enums']['onboarding_status'];
          onboarding_step: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          display_name: string;
          email: string;
          id: string;
          onboarding_status?: Database['public']['Enums']['onboarding_status'];
          onboarding_step?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          display_name?: string;
          email?: string;
          id?: string;
          onboarding_status?: Database['public']['Enums']['onboarding_status'];
          onboarding_step?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      program_specialties: {
        Row: {
          created_at: string;
          exam_program_id: string;
          specialty_id: string;
        };
        Insert: {
          created_at?: string;
          exam_program_id: string;
          specialty_id: string;
        };
        Update: {
          created_at?: string;
          exam_program_id?: string;
          specialty_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'program_specialties_exam_program_id_fkey';
            columns: ['exam_program_id'];
            isOneToOne: false;
            referencedRelation: 'exam_programs';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'program_specialties_specialty_id_fkey';
            columns: ['specialty_id'];
            isOneToOne: false;
            referencedRelation: 'specialties';
            referencedColumns: ['id'];
          },
        ];
      };
      question_assets: {
        Row: {
          alt_text: string | null;
          asset_type: string;
          id: string;
          position: number;
          question_version_id: string;
          storage_path: string;
        };
        Insert: {
          alt_text?: string | null;
          asset_type: string;
          id?: string;
          position?: number;
          question_version_id: string;
          storage_path: string;
        };
        Update: {
          alt_text?: string | null;
          asset_type?: string;
          id?: string;
          position?: number;
          question_version_id?: string;
          storage_path?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'question_assets_question_version_id_fkey';
            columns: ['question_version_id'];
            isOneToOne: false;
            referencedRelation: 'question_versions';
            referencedColumns: ['id'];
          },
        ];
      };
      question_attempts: {
        Row: {
          answered_at: string;
          assessment_id: string;
          id: string;
          is_correct: boolean;
          learning_event_id: string;
          origin: string;
          question_version_id: string;
          response_time_ms: number;
          selected_option_id: string;
          stated_confidence: string;
          student_id: string;
        };
        Insert: {
          answered_at?: string;
          assessment_id: string;
          id?: string;
          is_correct: boolean;
          learning_event_id: string;
          origin?: string;
          question_version_id: string;
          response_time_ms: number;
          selected_option_id: string;
          stated_confidence: string;
          student_id: string;
        };
        Update: {
          answered_at?: string;
          assessment_id?: string;
          id?: string;
          is_correct?: boolean;
          learning_event_id?: string;
          origin?: string;
          question_version_id?: string;
          response_time_ms?: number;
          selected_option_id?: string;
          stated_confidence?: string;
          student_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'question_attempts_assessment_id_fkey';
            columns: ['assessment_id'];
            isOneToOne: false;
            referencedRelation: 'diagnostic_assessments';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'question_attempts_learning_event_id_fkey';
            columns: ['learning_event_id'];
            isOneToOne: false;
            referencedRelation: 'learning_events';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'question_attempts_question_version_id_fkey';
            columns: ['question_version_id'];
            isOneToOne: false;
            referencedRelation: 'question_versions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'question_attempts_selected_option_id_fkey';
            columns: ['selected_option_id'];
            isOneToOne: false;
            referencedRelation: 'question_options';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'question_attempts_student_id_fkey';
            columns: ['student_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      question_options: {
        Row: {
          content: string;
          id: string;
          is_correct: boolean;
          label: string;
          position: number;
          question_version_id: string;
        };
        Insert: {
          content: string;
          id?: string;
          is_correct?: boolean;
          label: string;
          position: number;
          question_version_id: string;
        };
        Update: {
          content?: string;
          id?: string;
          is_correct?: boolean;
          label?: string;
          position?: number;
          question_version_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'question_options_question_version_id_fkey';
            columns: ['question_version_id'];
            isOneToOne: false;
            referencedRelation: 'question_versions';
            referencedColumns: ['id'];
          },
        ];
      };
      question_version_competencies: {
        Row: {
          competency_id: string;
          question_version_id: string;
          relevance: number;
        };
        Insert: {
          competency_id: string;
          question_version_id: string;
          relevance?: number;
        };
        Update: {
          competency_id?: string;
          question_version_id?: string;
          relevance?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'question_version_competencies_competency_id_fkey';
            columns: ['competency_id'];
            isOneToOne: false;
            referencedRelation: 'competencies';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'question_version_competencies_question_version_id_fkey';
            columns: ['question_version_id'];
            isOneToOne: false;
            referencedRelation: 'question_versions';
            referencedColumns: ['id'];
          },
        ];
      };
      question_version_guidelines: {
        Row: {
          guideline_id: string;
          question_version_id: string;
        };
        Insert: {
          guideline_id: string;
          question_version_id: string;
        };
        Update: {
          guideline_id?: string;
          question_version_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'question_version_guidelines_guideline_id_fkey';
            columns: ['guideline_id'];
            isOneToOne: false;
            referencedRelation: 'guidelines';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'question_version_guidelines_question_version_id_fkey';
            columns: ['question_version_id'];
            isOneToOne: false;
            referencedRelation: 'question_versions';
            referencedColumns: ['id'];
          },
        ];
      };
      question_version_programs: {
        Row: {
          exam_program_id: string;
          question_version_id: string;
        };
        Insert: {
          exam_program_id: string;
          question_version_id: string;
        };
        Update: {
          exam_program_id?: string;
          question_version_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'question_version_programs_exam_program_id_fkey';
            columns: ['exam_program_id'];
            isOneToOne: false;
            referencedRelation: 'exam_programs';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'question_version_programs_question_version_id_fkey';
            columns: ['question_version_id'];
            isOneToOne: false;
            referencedRelation: 'question_versions';
            referencedColumns: ['id'];
          },
        ];
      };
      question_version_references: {
        Row: {
          question_version_id: string;
          reference_id: string;
        };
        Insert: {
          question_version_id: string;
          reference_id: string;
        };
        Update: {
          question_version_id?: string;
          reference_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'question_version_references_question_version_id_fkey';
            columns: ['question_version_id'];
            isOneToOne: false;
            referencedRelation: 'question_versions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'question_version_references_reference_id_fkey';
            columns: ['reference_id'];
            isOneToOne: false;
            referencedRelation: 'academic_references';
            referencedColumns: ['id'];
          },
        ];
      };
      question_version_specialties: {
        Row: {
          question_version_id: string;
          specialty_id: string;
        };
        Insert: {
          question_version_id: string;
          specialty_id: string;
        };
        Update: {
          question_version_id?: string;
          specialty_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'question_version_specialties_question_version_id_fkey';
            columns: ['question_version_id'];
            isOneToOne: false;
            referencedRelation: 'question_versions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'question_version_specialties_specialty_id_fkey';
            columns: ['specialty_id'];
            isOneToOne: false;
            referencedRelation: 'specialties';
            referencedColumns: ['id'];
          },
        ];
      };
      question_version_subthemes: {
        Row: {
          question_version_id: string;
          subtheme_id: string;
        };
        Insert: {
          question_version_id: string;
          subtheme_id: string;
        };
        Update: {
          question_version_id?: string;
          subtheme_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'question_version_subthemes_question_version_id_fkey';
            columns: ['question_version_id'];
            isOneToOne: false;
            referencedRelation: 'question_versions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'question_version_subthemes_subtheme_id_fkey';
            columns: ['subtheme_id'];
            isOneToOne: false;
            referencedRelation: 'subthemes';
            referencedColumns: ['id'];
          },
        ];
      };
      question_version_tags: {
        Row: {
          question_version_id: string;
          tag_id: string;
        };
        Insert: {
          question_version_id: string;
          tag_id: string;
        };
        Update: {
          question_version_id?: string;
          tag_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'question_version_tags_question_version_id_fkey';
            columns: ['question_version_id'];
            isOneToOne: false;
            referencedRelation: 'question_versions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'question_version_tags_tag_id_fkey';
            columns: ['tag_id'];
            isOneToOne: false;
            referencedRelation: 'tags';
            referencedColumns: ['id'];
          },
        ];
      };
      question_version_themes: {
        Row: {
          question_version_id: string;
          theme_id: string;
        };
        Insert: {
          question_version_id: string;
          theme_id: string;
        };
        Update: {
          question_version_id?: string;
          theme_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'question_version_themes_question_version_id_fkey';
            columns: ['question_version_id'];
            isOneToOne: false;
            referencedRelation: 'question_versions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'question_version_themes_theme_id_fkey';
            columns: ['theme_id'];
            isOneToOne: false;
            referencedRelation: 'themes';
            referencedColumns: ['id'];
          },
        ];
      };
      question_versions: {
        Row: {
          change_note: string | null;
          cognitive_level: string | null;
          commentary: string | null;
          created_at: string;
          difficulty: number | null;
          id: string;
          institution_id: string | null;
          question_id: string;
          status: string;
          stem: string;
          version: number;
        };
        Insert: {
          change_note?: string | null;
          cognitive_level?: string | null;
          commentary?: string | null;
          created_at?: string;
          difficulty?: number | null;
          id?: string;
          institution_id?: string | null;
          question_id: string;
          status?: string;
          stem: string;
          version: number;
        };
        Update: {
          change_note?: string | null;
          cognitive_level?: string | null;
          commentary?: string | null;
          created_at?: string;
          difficulty?: number | null;
          id?: string;
          institution_id?: string | null;
          question_id?: string;
          status?: string;
          stem?: string;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'question_versions_institution_id_fkey';
            columns: ['institution_id'];
            isOneToOne: false;
            referencedRelation: 'institutions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'question_versions_question_id_fkey';
            columns: ['question_id'];
            isOneToOne: false;
            referencedRelation: 'questions';
            referencedColumns: ['id'];
          },
        ];
      };
      questions: {
        Row: {
          canonical_hash: string;
          created_at: string;
          current_version: number;
          id: string;
          source_key: string | null;
          status: string;
          updated_at: string;
        };
        Insert: {
          canonical_hash: string;
          created_at?: string;
          current_version?: number;
          id?: string;
          source_key?: string | null;
          status?: string;
          updated_at?: string;
        };
        Update: {
          canonical_hash?: string;
          created_at?: string;
          current_version?: number;
          id?: string;
          source_key?: string | null;
          status?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      specialties: {
        Row: {
          code: string;
          created_at: string;
          description: string | null;
          id: string;
          is_active: boolean;
          name: string;
          updated_at: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          name: string;
          updated_at?: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          name?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      specialty_areas: {
        Row: {
          area_id: string;
          created_at: string;
          specialty_id: string;
        };
        Insert: {
          area_id: string;
          created_at?: string;
          specialty_id: string;
        };
        Update: {
          area_id?: string;
          created_at?: string;
          specialty_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'specialty_areas_area_id_fkey';
            columns: ['area_id'];
            isOneToOne: false;
            referencedRelation: 'medical_areas';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'specialty_areas_specialty_id_fkey';
            columns: ['specialty_id'];
            isOneToOne: false;
            referencedRelation: 'specialties';
            referencedColumns: ['id'];
          },
        ];
      };
      student_availability: {
        Row: {
          created_at: string;
          id: string;
          minutes_available: number;
          updated_at: string;
          user_id: string;
          weekday: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          minutes_available: number;
          updated_at?: string;
          user_id: string;
          weekday: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          minutes_available?: number;
          updated_at?: string;
          user_id?: string;
          weekday?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'student_availability_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      student_profiles: {
        Row: {
          assessment_preference: string | null;
          created_at: string;
          experience_level: string | null;
          graduation_year: number | null;
          preferred_session_minutes: number | null;
          residency_year: number | null;
          updated_at: string;
          user_id: string;
          weekly_study_hours: number | null;
        };
        Insert: {
          assessment_preference?: string | null;
          created_at?: string;
          experience_level?: string | null;
          graduation_year?: number | null;
          preferred_session_minutes?: number | null;
          residency_year?: number | null;
          updated_at?: string;
          user_id: string;
          weekly_study_hours?: number | null;
        };
        Update: {
          assessment_preference?: string | null;
          created_at?: string;
          experience_level?: string | null;
          graduation_year?: number | null;
          preferred_session_minutes?: number | null;
          residency_year?: number | null;
          updated_at?: string;
          user_id?: string;
          weekly_study_hours?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'student_profiles_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: true;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      student_target_exams: {
        Row: {
          created_at: string;
          exam_edition_id: string;
          id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          exam_edition_id: string;
          id?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          exam_edition_id?: string;
          id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'student_target_exams_exam_edition_id_fkey';
            columns: ['exam_edition_id'];
            isOneToOne: false;
            referencedRelation: 'exam_editions';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'student_target_exams_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      subthemes: {
        Row: {
          code: string;
          created_at: string;
          description: string | null;
          id: string;
          is_active: boolean;
          name: string;
          theme_id: string;
          updated_at: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          name: string;
          theme_id: string;
          updated_at?: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          name?: string;
          theme_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'subthemes_theme_id_fkey';
            columns: ['theme_id'];
            isOneToOne: false;
            referencedRelation: 'themes';
            referencedColumns: ['id'];
          },
        ];
      };
      tags: {
        Row: {
          id: string;
          name: string;
          slug: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
        };
        Relationships: [];
      };
      themes: {
        Row: {
          area_id: string;
          code: string;
          created_at: string;
          description: string | null;
          id: string;
          is_active: boolean;
          name: string;
          updated_at: string;
        };
        Insert: {
          area_id: string;
          code: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          name: string;
          updated_at?: string;
        };
        Update: {
          area_id?: string;
          code?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_active?: boolean;
          name?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'themes_area_id_fkey';
            columns: ['area_id'];
            isOneToOne: false;
            referencedRelation: 'medical_areas';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      current_mastery: {
        Row: {
          algorithm_version: string | null;
          calculated_at: string | null;
          competency_id: string | null;
          confidence: number | null;
          evidence_count: number | null;
          id: string | null;
          last_evidence_at: string | null;
          mastery: number | null;
          source_event_id: string | null;
          student_id: string | null;
          trend: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'mastery_snapshots_competency_id_fkey';
            columns: ['competency_id'];
            isOneToOne: false;
            referencedRelation: 'competencies';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mastery_snapshots_source_event_id_fkey';
            columns: ['source_event_id'];
            isOneToOne: false;
            referencedRelation: 'learning_events';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'mastery_snapshots_student_id_fkey';
            columns: ['student_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Functions: {
      answer_diagnostic_question: {
        Args: {
          p_assessment_id: string;
          p_question_version_id: string;
          p_response_time_ms: number;
          p_selected_option_id: string;
          p_stated_confidence: string;
        };
        Returns: string;
      };
      calculate_diagnostic_confidence: {
        Args: {
          p_as_of: string;
          p_competency_id: string;
          p_student_id: string;
        };
        Returns: number;
      };
      finish_diagnostic_assessment: {
        Args: { p_assessment_id: string };
        Returns: string;
      };
      record_learning_event:
        | {
            Args: {
              p_event_type: string;
              p_idempotency_key: string;
              p_occurred_at: string;
              p_payload: Json;
              p_schema_version: number;
              p_student_id: string;
            };
            Returns: string;
          }
        | {
            Args: {
              p_event_type: string;
              p_idempotency_key: string;
              p_occurred_at: string;
              p_payload: Json;
              p_schema_version?: number;
              p_student_id: string;
            };
            Returns: string;
          };
      save_onboarding: {
        Args: {
          p_assessment_preference?: string;
          p_availability?: Json;
          p_complete?: boolean;
          p_display_name?: string;
          p_exam_edition_ids?: string[];
          p_experience_level?: string;
          p_graduation_year?: number;
          p_preferred_session_minutes?: number;
          p_residency_year?: number;
          p_step: number;
        };
        Returns: undefined;
      };
      select_assessment_question: {
        Args: {
          p_assessment_id: string;
          p_question_version_id: string;
          p_rationale: Json;
          p_selection_order: number;
        };
        Returns: string;
      };
      start_diagnostic_assessment: {
        Args: {
          p_competency_ids: string[];
          p_duration_minutes: number;
          p_exam_program_id: string;
          p_objective: string;
          p_question_count: number;
          p_specialty_id: string;
        };
        Returns: string;
      };
    };
    Enums: {
      onboarding_status: 'not_started' | 'in_progress' | 'completed';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      onboarding_status: ['not_started', 'in_progress', 'completed'],
    },
  },
} as const;
