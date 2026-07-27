export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      academic_references: {
        Row: {
          authors: string | null
          citation: string | null
          created_at: string
          external_identifier: string | null
          id: string
          publication_year: number | null
          title: string
          updated_at: string
          url: string | null
        }
        Insert: {
          authors?: string | null
          citation?: string | null
          created_at?: string
          external_identifier?: string | null
          id?: string
          publication_year?: number | null
          title: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          authors?: string | null
          citation?: string | null
          created_at?: string
          external_identifier?: string | null
          id?: string
          publication_year?: number | null
          title?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      assessment_competencies: {
        Row: {
          assessment_id: string
          competency_id: string
        }
        Insert: {
          assessment_id: string
          competency_id: string
        }
        Update: {
          assessment_id?: string
          competency_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_competencies_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "diagnostic_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_competencies_competency_id_fkey"
            columns: ["competency_id"]
            isOneToOne: false
            referencedRelation: "competencies"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_question_selections: {
        Row: {
          assessment_id: string
          id: string
          question_version_id: string
          rationale: Json
          selected_at: string
          selection_order: number
        }
        Insert: {
          assessment_id: string
          id?: string
          question_version_id: string
          rationale: Json
          selected_at?: string
          selection_order: number
        }
        Update: {
          assessment_id?: string
          id?: string
          question_version_id?: string
          rationale?: Json
          selected_at?: string
          selection_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "assessment_question_selections_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "diagnostic_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_question_selections_question_version_id_fkey"
            columns: ["question_version_id"]
            isOneToOne: false
            referencedRelation: "question_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_result_areas: {
        Row: {
          area_id: string
          assessment_result_id: string
          calibrated_safety: string
          evidence_count: number
          evidence_quality: string
          observed_level: string
          recommended_next_step: string
          strengths: string[]
          target_exam_influence: string
          uncertainties: string[]
          weaknesses: string[]
        }
        Insert: {
          area_id: string
          assessment_result_id: string
          calibrated_safety: string
          evidence_count: number
          evidence_quality: string
          observed_level: string
          recommended_next_step: string
          strengths?: string[]
          target_exam_influence: string
          uncertainties?: string[]
          weaknesses?: string[]
        }
        Update: {
          area_id?: string
          assessment_result_id?: string
          calibrated_safety?: string
          evidence_count?: number
          evidence_quality?: string
          observed_level?: string
          recommended_next_step?: string
          strengths?: string[]
          target_exam_influence?: string
          uncertainties?: string[]
          weaknesses?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "assessment_result_areas_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_result_areas_assessment_result_id_fkey"
            columns: ["assessment_result_id"]
            isOneToOne: false
            referencedRelation: "assessment_results"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_result_competencies: {
        Row: {
          assessment_result_id: string
          classification: string
          competency_id: string
          confidence: number
          confidence_level: string
          evidence_count: number
          mastery: number
        }
        Insert: {
          assessment_result_id: string
          classification: string
          competency_id: string
          confidence: number
          confidence_level: string
          evidence_count: number
          mastery: number
        }
        Update: {
          assessment_result_id?: string
          classification?: string
          competency_id?: string
          confidence?: number
          confidence_level?: string
          evidence_count?: number
          mastery?: number
        }
        Relationships: [
          {
            foreignKeyName: "assessment_result_competencies_assessment_result_id_fkey"
            columns: ["assessment_result_id"]
            isOneToOne: false
            referencedRelation: "assessment_results"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_result_competencies_competency_id_fkey"
            columns: ["competency_id"]
            isOneToOne: false
            referencedRelation: "competencies"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_results: {
        Row: {
          algorithm_version: string
          answered_count: number
          assessment_id: string
          completion_reason: string | null
          correct_count: number
          created_at: string
          diagnostic_coverage: number
          evidence_sufficient: boolean
          id: string
          overall_confidence: number
          student_id: string
        }
        Insert: {
          algorithm_version: string
          answered_count: number
          assessment_id: string
          completion_reason?: string | null
          correct_count: number
          created_at?: string
          diagnostic_coverage: number
          evidence_sufficient?: boolean
          id?: string
          overall_confidence: number
          student_id: string
        }
        Update: {
          algorithm_version?: string
          answered_count?: number
          assessment_id?: string
          completion_reason?: string | null
          correct_count?: number
          created_at?: string
          diagnostic_coverage?: number
          evidence_sufficient?: boolean
          id?: string
          overall_confidence?: number
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_results_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: true
            referencedRelation: "diagnostic_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_results_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_statuses: {
        Row: {
          code: string
          name: string
        }
        Insert: {
          code: string
          name: string
        }
        Update: {
          code?: string
          name?: string
        }
        Relationships: []
      }
      competencies: {
        Row: {
          code: string
          created_at: string
          description: string
          id: string
          is_active: boolean
          name: string
          subtheme_id: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description: string
          id?: string
          is_active?: boolean
          name: string
          subtheme_id: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          name?: string
          subtheme_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "competencies_subtheme_id_fkey"
            columns: ["subtheme_id"]
            isOneToOne: false
            referencedRelation: "subthemes"
            referencedColumns: ["id"]
          },
        ]
      }
      competency_objectives: {
        Row: {
          competency_id: string
          description: string
          id: string
          position: number
        }
        Insert: {
          competency_id: string
          description: string
          id?: string
          position: number
        }
        Update: {
          competency_id?: string
          description?: string
          id?: string
          position?: number
        }
        Relationships: [
          {
            foreignKeyName: "competency_objectives_competency_id_fkey"
            columns: ["competency_id"]
            isOneToOne: false
            referencedRelation: "competencies"
            referencedColumns: ["id"]
          },
        ]
      }
      competency_references: {
        Row: {
          competency_id: string
          reference_id: string
        }
        Insert: {
          competency_id: string
          reference_id: string
        }
        Update: {
          competency_id?: string
          reference_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "competency_references_competency_id_fkey"
            columns: ["competency_id"]
            isOneToOne: false
            referencedRelation: "competencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competency_references_reference_id_fkey"
            columns: ["reference_id"]
            isOneToOne: false
            referencedRelation: "academic_references"
            referencedColumns: ["id"]
          },
        ]
      }
      competency_specialties: {
        Row: {
          competency_id: string
          created_at: string
          relationship: string
          specialty_id: string
        }
        Insert: {
          competency_id: string
          created_at?: string
          relationship?: string
          specialty_id: string
        }
        Update: {
          competency_id?: string
          created_at?: string
          relationship?: string
          specialty_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "competency_specialties_competency_id_fkey"
            columns: ["competency_id"]
            isOneToOne: false
            referencedRelation: "competencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "competency_specialties_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      content_generation_jobs: {
        Row: {
          briefing: Json
          briefing_hash: string
          completed_at: string | null
          content_id: string | null
          created_at: string
          error_code: string | null
          estimated_cost: number | null
          id: string
          input_tokens: number | null
          model: string
          output_tokens: number | null
          prompt_version: string
          requested_by: string
          retry_count: number
          status: string
        }
        Insert: {
          briefing: Json
          briefing_hash: string
          completed_at?: string | null
          content_id?: string | null
          created_at?: string
          error_code?: string | null
          estimated_cost?: number | null
          id?: string
          input_tokens?: number | null
          model: string
          output_tokens?: number | null
          prompt_version: string
          requested_by: string
          retry_count?: number
          status: string
        }
        Update: {
          briefing?: Json
          briefing_hash?: string
          completed_at?: string | null
          content_id?: string | null
          created_at?: string
          error_code?: string | null
          estimated_cost?: number | null
          id?: string
          input_tokens?: number | null
          model?: string
          output_tokens?: number | null
          prompt_version?: string
          requested_by?: string
          retry_count?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_generation_jobs_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "learning_contents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_generation_jobs_requested_by_fkey"
            columns: ["requested_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      content_import_batches: {
        Row: {
          board_code: string
          completed_at: string | null
          created_by: string
          error_message: string | null
          id: string
          import_key: string
          payload_hash: string
          question_count: number
          source_kind: string
          started_at: string
          status: string
        }
        Insert: {
          board_code: string
          completed_at?: string | null
          created_by: string
          error_message?: string | null
          id?: string
          import_key: string
          payload_hash: string
          question_count?: number
          source_kind: string
          started_at?: string
          status?: string
        }
        Update: {
          board_code?: string
          completed_at?: string | null
          created_by?: string
          error_message?: string | null
          id?: string
          import_key?: string
          payload_hash?: string
          question_count?: number
          source_kind?: string
          started_at?: string
          status?: string
        }
        Relationships: []
      }
      content_reference_specialties: {
        Row: {
          created_at: string
          reference_id: string
          specialty_id: string
        }
        Insert: {
          created_at?: string
          reference_id: string
          specialty_id: string
        }
        Update: {
          created_at?: string
          reference_id?: string
          specialty_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_reference_specialties_reference_id_fkey"
            columns: ["reference_id"]
            isOneToOne: false
            referencedRelation: "content_references"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_reference_specialties_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      content_references: {
        Row: {
          accessed_on: string | null
          authors_or_organization: string | null
          created_at: string
          doi: string | null
          edition: string | null
          id: string
          isbn: string | null
          notes: string | null
          origin: string
          pmid: string | null
          publication_year: number | null
          publisher: string | null
          reference_type: string
          title: string
          url: string | null
          verification_status: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          accessed_on?: string | null
          authors_or_organization?: string | null
          created_at?: string
          doi?: string | null
          edition?: string | null
          id?: string
          isbn?: string | null
          notes?: string | null
          origin: string
          pmid?: string | null
          publication_year?: number | null
          publisher?: string | null
          reference_type: string
          title: string
          url?: string | null
          verification_status: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          accessed_on?: string | null
          authors_or_organization?: string | null
          created_at?: string
          doi?: string | null
          edition?: string | null
          id?: string
          isbn?: string | null
          notes?: string | null
          origin?: string
          pmid?: string | null
          publication_year?: number | null
          publisher?: string | null
          reference_type?: string
          title?: string
          url?: string | null
          verification_status?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_references_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      content_review_requests: {
        Row: {
          active: boolean
          content_id: string
          id: string
          last_requested_at: string
          requested_at: string
          student_id: string
          version_id: string
          withdrawn_at: string | null
        }
        Insert: {
          active?: boolean
          content_id: string
          id?: string
          last_requested_at?: string
          requested_at?: string
          student_id: string
          version_id: string
          withdrawn_at?: string | null
        }
        Update: {
          active?: boolean
          content_id?: string
          id?: string
          last_requested_at?: string
          requested_at?: string
          student_id?: string
          version_id?: string
          withdrawn_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "content_review_requests_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "learning_contents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_review_requests_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_review_requests_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "learning_content_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      content_reviews: {
        Row: {
          comment: string | null
          content_id: string
          created_at: string
          decision: string
          declaration: string | null
          id: string
          issue_category: string | null
          mentor_id: string
          observed_references: Json
          request_id: string
          safe_context: Json
          version_hash: string
          version_id: string
        }
        Insert: {
          comment?: string | null
          content_id: string
          created_at?: string
          decision: string
          declaration?: string | null
          id?: string
          issue_category?: string | null
          mentor_id: string
          observed_references?: Json
          request_id: string
          safe_context?: Json
          version_hash: string
          version_id: string
        }
        Update: {
          comment?: string | null
          content_id?: string
          created_at?: string
          decision?: string
          declaration?: string | null
          id?: string
          issue_category?: string | null
          mentor_id?: string
          observed_references?: Json
          request_id?: string
          safe_context?: Json
          version_hash?: string
          version_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_reviews_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "learning_contents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_reviews_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentor_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "content_reviews_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "learning_content_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnostic_assessments: {
        Row: {
          algorithm: string
          algorithm_version: string
          blueprint_version: string | null
          completed_at: string | null
          created_at: string
          current_block: number
          diagnostic_coverage: number | null
          duration_minutes: number
          exam_program_id: string | null
          id: string
          mode: string
          objective: string
          overall_confidence: number | null
          paused_at: string | null
          policy_version: string
          question_count: number
          specialty_id: string | null
          started_at: string
          status: string
          student_id: string
        }
        Insert: {
          algorithm?: string
          algorithm_version?: string
          blueprint_version?: string | null
          completed_at?: string | null
          created_at?: string
          current_block?: number
          diagnostic_coverage?: number | null
          duration_minutes: number
          exam_program_id?: string | null
          id?: string
          mode?: string
          objective: string
          overall_confidence?: number | null
          paused_at?: string | null
          policy_version?: string
          question_count: number
          specialty_id?: string | null
          started_at?: string
          status?: string
          student_id: string
        }
        Update: {
          algorithm?: string
          algorithm_version?: string
          blueprint_version?: string | null
          completed_at?: string | null
          created_at?: string
          current_block?: number
          diagnostic_coverage?: number | null
          duration_minutes?: number
          exam_program_id?: string | null
          id?: string
          mode?: string
          objective?: string
          overall_confidence?: number | null
          paused_at?: string | null
          policy_version?: string
          question_count?: number
          specialty_id?: string | null
          started_at?: string
          status?: string
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "diagnostic_assessments_exam_program_id_fkey"
            columns: ["exam_program_id"]
            isOneToOne: false
            referencedRelation: "exam_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diagnostic_assessments_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diagnostic_assessments_status_fkey"
            columns: ["status"]
            isOneToOne: false
            referencedRelation: "assessment_statuses"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "diagnostic_assessments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnostic_blueprint_competencies: {
        Row: {
          blueprint_id: string
          competency_id: string
          expected_difficulties: number[]
          is_required: boolean
          minimum_evidence: number
          notes: string | null
          question_styles: string[]
          specialty_id: string
          weight: number
        }
        Insert: {
          blueprint_id: string
          competency_id: string
          expected_difficulties?: number[]
          is_required?: boolean
          minimum_evidence?: number
          notes?: string | null
          question_styles?: string[]
          specialty_id: string
          weight?: number
        }
        Update: {
          blueprint_id?: string
          competency_id?: string
          expected_difficulties?: number[]
          is_required?: boolean
          minimum_evidence?: number
          notes?: string | null
          question_styles?: string[]
          specialty_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "diagnostic_blueprint_competencies_blueprint_id_fkey"
            columns: ["blueprint_id"]
            isOneToOne: false
            referencedRelation: "exam_blueprints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diagnostic_blueprint_competencies_competency_id_fkey"
            columns: ["competency_id"]
            isOneToOne: false
            referencedRelation: "competencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diagnostic_blueprint_competencies_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnostic_coverage_policies: {
        Row: {
          duration_minutes: number
          is_synthetic: boolean
          limitations: string[]
          maximum_questions_per_session: number
          maximum_total_questions: number
          minimum_competencies_per_area: number
          minimum_difficulty_levels_per_area: number
          minimum_questions_per_area: number
          minimum_sufficiency: number
          mode: string
          pause_allowed: boolean
          valid_from: string
          valid_until: string | null
          version: string
        }
        Insert: {
          duration_minutes: number
          is_synthetic: boolean
          limitations?: string[]
          maximum_questions_per_session: number
          maximum_total_questions: number
          minimum_competencies_per_area: number
          minimum_difficulty_levels_per_area: number
          minimum_questions_per_area: number
          minimum_sufficiency: number
          mode: string
          pause_allowed: boolean
          valid_from: string
          valid_until?: string | null
          version: string
        }
        Update: {
          duration_minutes?: number
          is_synthetic?: boolean
          limitations?: string[]
          maximum_questions_per_session?: number
          maximum_total_questions?: number
          minimum_competencies_per_area?: number
          minimum_difficulty_levels_per_area?: number
          minimum_questions_per_area?: number
          minimum_sufficiency?: number
          mode?: string
          pause_allowed?: boolean
          valid_from?: string
          valid_until?: string | null
          version?: string
        }
        Relationships: []
      }
      diagnostic_editorial_gaps: {
        Row: {
          area_id: string | null
          assessment_id: string
          created_at: string
          id: string
          missing_evidence: number
          reason: string
        }
        Insert: {
          area_id?: string | null
          assessment_id: string
          created_at?: string
          id?: string
          missing_evidence: number
          reason: string
        }
        Update: {
          area_id?: string | null
          assessment_id?: string
          created_at?: string
          id?: string
          missing_evidence?: number
          reason?: string
        }
        Relationships: [
          {
            foreignKeyName: "diagnostic_editorial_gaps_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "diagnostic_editorial_gaps_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "diagnostic_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      diagnostic_question_eligibility: {
        Row: {
          answer_key_validated: boolean
          diagnostic_eligible: boolean
          editorial_note: string
          provenance_kind: string
          question_version_id: string
          validated_at: string | null
        }
        Insert: {
          answer_key_validated?: boolean
          diagnostic_eligible?: boolean
          editorial_note: string
          provenance_kind: string
          question_version_id: string
          validated_at?: string | null
        }
        Update: {
          answer_key_validated?: boolean
          diagnostic_eligible?: boolean
          editorial_note?: string
          provenance_kind?: string
          question_version_id?: string
          validated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "diagnostic_question_eligibility_question_version_id_fkey"
            columns: ["question_version_id"]
            isOneToOne: true
            referencedRelation: "question_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      editorial_audit_events: {
        Row: {
          action: string
          actor_id: string
          actor_role: string
          created_at: string
          id: string
          metadata: Json
          next_state: string | null
          previous_state: string | null
          request_id: string
          resource_id: string
          resource_type: string
          resource_version_id: string | null
        }
        Insert: {
          action: string
          actor_id: string
          actor_role: string
          created_at?: string
          id?: string
          metadata?: Json
          next_state?: string | null
          previous_state?: string | null
          request_id: string
          resource_id: string
          resource_type: string
          resource_version_id?: string | null
        }
        Update: {
          action?: string
          actor_id?: string
          actor_role?: string
          created_at?: string
          id?: string
          metadata?: Json
          next_state?: string | null
          previous_state?: string | null
          request_id?: string
          resource_id?: string
          resource_type?: string
          resource_version_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "editorial_audit_events_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      editorial_email_events: {
        Row: {
          content_id: string | null
          created_at: string
          error_code: string | null
          event_type: string
          id: string
          idempotency_key: string
          provider_id: string | null
          recipient_id: string
          version_id: string | null
        }
        Insert: {
          content_id?: string | null
          created_at?: string
          error_code?: string | null
          event_type: string
          id?: string
          idempotency_key: string
          provider_id?: string | null
          recipient_id: string
          version_id?: string | null
        }
        Update: {
          content_id?: string | null
          created_at?: string
          error_code?: string | null
          event_type?: string
          id?: string
          idempotency_key?: string
          provider_id?: string | null
          recipient_id?: string
          version_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "editorial_email_events_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "learning_contents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "editorial_email_events_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "editorial_email_events_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "learning_content_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      editorial_notifications: {
        Row: {
          body: string
          created_at: string
          id: string
          notification_type: string
          read_at: string | null
          recipient_id: string
          resource_id: string | null
          title: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          notification_type: string
          read_at?: string | null
          recipient_id: string
          resource_id?: string | null
          title: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          notification_type?: string
          read_at?: string | null
          recipient_id?: string
          resource_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "editorial_notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_blueprint_areas: {
        Row: {
          blueprint_id: string
          expected_proportion: number
          expected_question_count: number | null
          notes: string | null
          position: number
          specialty_id: string
          weight: number | null
        }
        Insert: {
          blueprint_id: string
          expected_proportion: number
          expected_question_count?: number | null
          notes?: string | null
          position: number
          specialty_id: string
          weight?: number | null
        }
        Update: {
          blueprint_id?: string
          expected_proportion?: number
          expected_question_count?: number | null
          notes?: string | null
          position?: number
          specialty_id?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_blueprint_areas_blueprint_id_fkey"
            columns: ["blueprint_id"]
            isOneToOne: false
            referencedRelation: "exam_blueprints"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_blueprint_areas_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_blueprints: {
        Row: {
          confidence: string
          correction_rules: string
          created_at: string
          duration_minutes: number | null
          editorial_status: string
          expected_question_count: number | null
          format_description: string
          id: string
          is_active: boolean
          is_synthetic: boolean
          notes: string | null
          period_end: string | null
          period_start: string | null
          profile_id: string
          source_title: string
          source_url: string | null
          updated_at: string
          version: number
        }
        Insert: {
          confidence: string
          correction_rules: string
          created_at?: string
          duration_minutes?: number | null
          editorial_status: string
          expected_question_count?: number | null
          format_description: string
          id?: string
          is_active?: boolean
          is_synthetic: boolean
          notes?: string | null
          period_end?: string | null
          period_start?: string | null
          profile_id: string
          source_title: string
          source_url?: string | null
          updated_at?: string
          version: number
        }
        Update: {
          confidence?: string
          correction_rules?: string
          created_at?: string
          duration_minutes?: number | null
          editorial_status?: string
          expected_question_count?: number | null
          format_description?: string
          id?: string
          is_active?: boolean
          is_synthetic?: boolean
          notes?: string | null
          period_end?: string | null
          period_start?: string | null
          profile_id?: string
          source_title?: string
          source_url?: string | null
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "exam_blueprints_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "exam_intelligence_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_boards: {
        Row: {
          acronym: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          acronym?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          acronym?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      exam_editions: {
        Row: {
          application_date: string | null
          city: string | null
          created_at: string
          duration_minutes: number | null
          edition: string | null
          exam_board_id: string | null
          exam_program_id: string
          id: string
          is_active: boolean
          modality: string | null
          official_url: string | null
          question_count: number | null
          registration_deadline: string | null
          source_title: string | null
          source_url: string | null
          status: string
          unconfirmed_fields: string[]
          update_method: string | null
          updated_at: string
          verification_status: string
          verified_at: string | null
          year: number
        }
        Insert: {
          application_date?: string | null
          city?: string | null
          created_at?: string
          duration_minutes?: number | null
          edition?: string | null
          exam_board_id?: string | null
          exam_program_id: string
          id?: string
          is_active?: boolean
          modality?: string | null
          official_url?: string | null
          question_count?: number | null
          registration_deadline?: string | null
          source_title?: string | null
          source_url?: string | null
          status?: string
          unconfirmed_fields?: string[]
          update_method?: string | null
          updated_at?: string
          verification_status?: string
          verified_at?: string | null
          year: number
        }
        Update: {
          application_date?: string | null
          city?: string | null
          created_at?: string
          duration_minutes?: number | null
          edition?: string | null
          exam_board_id?: string | null
          exam_program_id?: string
          id?: string
          is_active?: boolean
          modality?: string | null
          official_url?: string | null
          question_count?: number | null
          registration_deadline?: string | null
          source_title?: string | null
          source_url?: string | null
          status?: string
          unconfirmed_fields?: string[]
          update_method?: string | null
          updated_at?: string
          verification_status?: string
          verified_at?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "exam_editions_exam_board_id_fkey"
            columns: ["exam_board_id"]
            isOneToOne: false
            referencedRelation: "exam_boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_editions_exam_program_id_fkey"
            columns: ["exam_program_id"]
            isOneToOne: false
            referencedRelation: "exam_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_intelligence_profiles: {
        Row: {
          analysis_period_end: string | null
          analysis_period_start: string | null
          confidence: string
          coverage: number
          created_at: string
          display_name: string
          editorial_status: string
          exam_program_id: string
          exams_analyzed: number
          id: string
          is_active: boolean
          is_synthetic: boolean
          last_updated_at: string
          limitations: string[]
          method_version: string
          notes: string | null
          questions_analyzed: number
          responsible_editorial: string
          responsible_statistical: string | null
          source_origin: string
          source_title: string
          source_url: string | null
          updated_at: string
          valid_from: string
          valid_until: string | null
          version: number
        }
        Insert: {
          analysis_period_end?: string | null
          analysis_period_start?: string | null
          confidence: string
          coverage?: number
          created_at?: string
          display_name: string
          editorial_status: string
          exam_program_id: string
          exams_analyzed?: number
          id?: string
          is_active?: boolean
          is_synthetic: boolean
          last_updated_at: string
          limitations?: string[]
          method_version: string
          notes?: string | null
          questions_analyzed?: number
          responsible_editorial: string
          responsible_statistical?: string | null
          source_origin: string
          source_title: string
          source_url?: string | null
          updated_at?: string
          valid_from: string
          valid_until?: string | null
          version: number
        }
        Update: {
          analysis_period_end?: string | null
          analysis_period_start?: string | null
          confidence?: string
          coverage?: number
          created_at?: string
          display_name?: string
          editorial_status?: string
          exam_program_id?: string
          exams_analyzed?: number
          id?: string
          is_active?: boolean
          is_synthetic?: boolean
          last_updated_at?: string
          limitations?: string[]
          method_version?: string
          notes?: string | null
          questions_analyzed?: number
          responsible_editorial?: string
          responsible_statistical?: string | null
          source_origin?: string
          source_title?: string
          source_url?: string | null
          updated_at?: string
          valid_from?: string
          valid_until?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "exam_intelligence_profiles_exam_program_id_fkey"
            columns: ["exam_program_id"]
            isOneToOne: false
            referencedRelation: "exam_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_program_institutions: {
        Row: {
          created_at: string
          exam_program_id: string
          institution_id: string
          participation_role: string
        }
        Insert: {
          created_at?: string
          exam_program_id: string
          institution_id: string
          participation_role?: string
        }
        Update: {
          created_at?: string
          exam_program_id?: string
          institution_id?: string
          participation_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_program_institutions_exam_program_id_fkey"
            columns: ["exam_program_id"]
            isOneToOne: false
            referencedRelation: "exam_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_program_institutions_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_programs: {
        Row: {
          city: string | null
          code: string | null
          created_at: string
          exam_board_id: string | null
          id: string
          institution_id: string
          is_active: boolean
          name: string
          region_code: string | null
          scope: string
          state_code: string | null
          updated_at: string
        }
        Insert: {
          city?: string | null
          code?: string | null
          created_at?: string
          exam_board_id?: string | null
          id?: string
          institution_id: string
          is_active?: boolean
          name: string
          region_code?: string | null
          scope?: string
          state_code?: string | null
          updated_at?: string
        }
        Update: {
          city?: string | null
          code?: string | null
          created_at?: string
          exam_board_id?: string | null
          id?: string
          institution_id?: string
          is_active?: boolean
          name?: string
          region_code?: string | null
          scope?: string
          state_code?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_programs_exam_board_id_fkey"
            columns: ["exam_board_id"]
            isOneToOne: false
            referencedRelation: "exam_boards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_programs_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_questions: {
        Row: {
          created_at: string
          exam_edition_id: string
          position: number
          question_id: string
          question_version_id: string
        }
        Insert: {
          created_at?: string
          exam_edition_id: string
          position: number
          question_id: string
          question_version_id: string
        }
        Update: {
          created_at?: string
          exam_edition_id?: string
          position?: number
          question_id?: string
          question_version_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_questions_exam_edition_id_fkey"
            columns: ["exam_edition_id"]
            isOneToOne: false
            referencedRelation: "amrigs_content_metadata"
            referencedColumns: ["exam_edition_id"]
          },
          {
            foreignKeyName: "exam_questions_exam_edition_id_fkey"
            columns: ["exam_edition_id"]
            isOneToOne: false
            referencedRelation: "exam_editions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_questions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_questions_question_version_id_question_id_fkey"
            columns: ["question_version_id", "question_id"]
            isOneToOne: false
            referencedRelation: "question_versions"
            referencedColumns: ["id", "question_id"]
          },
        ]
      }
      exam_recurrence_statistics: {
        Row: {
          area_id: string | null
          competency_id: string | null
          confidence: string
          coverage: number
          created_at: string
          denominator: number
          dimension_key: string | null
          dimension_type: string
          editorial_status: string
          id: string
          is_synthetic: boolean
          last_updated_at: string
          limitations: string[]
          method_version: string
          missing_data: string[]
          occurrences: number
          origin: string
          period_end: string | null
          period_start: string | null
          profile_id: string
          relevance: string
          responsible_statistical: string | null
          sample_size: number
          sample_unit: string
          subtheme_id: string | null
          theme_id: string | null
          version: number
        }
        Insert: {
          area_id?: string | null
          competency_id?: string | null
          confidence: string
          coverage: number
          created_at?: string
          denominator: number
          dimension_key?: string | null
          dimension_type: string
          editorial_status: string
          id?: string
          is_synthetic: boolean
          last_updated_at: string
          limitations?: string[]
          method_version: string
          missing_data?: string[]
          occurrences: number
          origin: string
          period_end?: string | null
          period_start?: string | null
          profile_id: string
          relevance: string
          responsible_statistical?: string | null
          sample_size: number
          sample_unit: string
          subtheme_id?: string | null
          theme_id?: string | null
          version: number
        }
        Update: {
          area_id?: string | null
          competency_id?: string | null
          confidence?: string
          coverage?: number
          created_at?: string
          denominator?: number
          dimension_key?: string | null
          dimension_type?: string
          editorial_status?: string
          id?: string
          is_synthetic?: boolean
          last_updated_at?: string
          limitations?: string[]
          method_version?: string
          missing_data?: string[]
          occurrences?: number
          origin?: string
          period_end?: string | null
          period_start?: string | null
          profile_id?: string
          relevance?: string
          responsible_statistical?: string | null
          sample_size?: number
          sample_unit?: string
          subtheme_id?: string | null
          theme_id?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "exam_recurrence_statistics_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "medical_areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_recurrence_statistics_competency_id_fkey"
            columns: ["competency_id"]
            isOneToOne: false
            referencedRelation: "competencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_recurrence_statistics_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "exam_intelligence_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_recurrence_statistics_subtheme_id_fkey"
            columns: ["subtheme_id"]
            isOneToOne: false
            referencedRelation: "subthemes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_recurrence_statistics_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "themes"
            referencedColumns: ["id"]
          },
        ]
      }
      guideline_competencies: {
        Row: {
          competency_id: string
          guideline_id: string
        }
        Insert: {
          competency_id: string
          guideline_id: string
        }
        Update: {
          competency_id?: string
          guideline_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guideline_competencies_competency_id_fkey"
            columns: ["competency_id"]
            isOneToOne: false
            referencedRelation: "competencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guideline_competencies_guideline_id_fkey"
            columns: ["guideline_id"]
            isOneToOne: false
            referencedRelation: "guidelines"
            referencedColumns: ["id"]
          },
        ]
      }
      guideline_issuers: {
        Row: {
          acronym: string | null
          created_at: string
          id: string
          name: string
          updated_at: string
          url: string | null
        }
        Insert: {
          acronym?: string | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          url?: string | null
        }
        Update: {
          acronym?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      guideline_specialties: {
        Row: {
          guideline_id: string
          specialty_id: string
        }
        Insert: {
          guideline_id: string
          specialty_id: string
        }
        Update: {
          guideline_id?: string
          specialty_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guideline_specialties_guideline_id_fkey"
            columns: ["guideline_id"]
            isOneToOne: false
            referencedRelation: "guidelines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guideline_specialties_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      guidelines: {
        Row: {
          created_at: string
          effective_from: string | null
          effective_until: string | null
          id: string
          issued_on: string | null
          issuer_id: string
          notes: string | null
          stable_key: string
          status: string
          title: string
          updated_at: string
          url: string | null
          version: string
        }
        Insert: {
          created_at?: string
          effective_from?: string | null
          effective_until?: string | null
          id?: string
          issued_on?: string | null
          issuer_id: string
          notes?: string | null
          stable_key: string
          status?: string
          title: string
          updated_at?: string
          url?: string | null
          version: string
        }
        Update: {
          created_at?: string
          effective_from?: string | null
          effective_until?: string | null
          id?: string
          issued_on?: string | null
          issuer_id?: string
          notes?: string | null
          stable_key?: string
          status?: string
          title?: string
          updated_at?: string
          url?: string | null
          version?: string
        }
        Relationships: [
          {
            foreignKeyName: "guidelines_issuer_id_fkey"
            columns: ["issuer_id"]
            isOneToOne: false
            referencedRelation: "guideline_issuers"
            referencedColumns: ["id"]
          },
        ]
      }
      institutions: {
        Row: {
          acronym: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          state_code: string
          updated_at: string
        }
        Insert: {
          acronym: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          state_code: string
          updated_at?: string
        }
        Update: {
          acronym?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          state_code?: string
          updated_at?: string
        }
        Relationships: []
      }
      learning_content_version_references: {
        Row: {
          is_required: boolean
          position: number
          reference_id: string
          version_id: string
        }
        Insert: {
          is_required?: boolean
          position?: number
          reference_id: string
          version_id: string
        }
        Update: {
          is_required?: boolean
          position?: number
          reference_id?: string
          version_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_content_version_references_reference_id_fkey"
            columns: ["reference_id"]
            isOneToOne: false
            referencedRelation: "content_references"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_content_version_references_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "learning_content_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_content_versions: {
        Row: {
          ai_assisted: boolean
          ai_model: string | null
          author_id: string
          clinical_reasoning: string | null
          common_mistakes: Json
          conclusion: string | null
          content_hash: string
          content_id: string
          created_at: string
          editorial_reviewer_id: string | null
          editorial_status: string
          estimated_cost: number | null
          estimated_minutes: number
          exam_application: string | null
          generation_id: string | null
          id: string
          input_tokens: number | null
          is_synthetic: boolean
          key_points: Json
          language: string
          objectives: Json
          output_tokens: number | null
          prompt_version: string | null
          provenance: Json
          published_at: string | null
          quick_review: Json
          reviewed_at: string | null
          schema_version: number
          sections: Json
          subtitle: string | null
          summary: string
          title: string
          valid_from: string | null
          valid_until: string | null
          version_number: number
          video: Json | null
        }
        Insert: {
          ai_assisted?: boolean
          ai_model?: string | null
          author_id: string
          clinical_reasoning?: string | null
          common_mistakes?: Json
          conclusion?: string | null
          content_hash: string
          content_id: string
          created_at?: string
          editorial_reviewer_id?: string | null
          editorial_status: string
          estimated_cost?: number | null
          estimated_minutes: number
          exam_application?: string | null
          generation_id?: string | null
          id?: string
          input_tokens?: number | null
          is_synthetic?: boolean
          key_points?: Json
          language?: string
          objectives?: Json
          output_tokens?: number | null
          prompt_version?: string | null
          provenance?: Json
          published_at?: string | null
          quick_review?: Json
          reviewed_at?: string | null
          schema_version?: number
          sections?: Json
          subtitle?: string | null
          summary: string
          title: string
          valid_from?: string | null
          valid_until?: string | null
          version_number: number
          video?: Json | null
        }
        Update: {
          ai_assisted?: boolean
          ai_model?: string | null
          author_id?: string
          clinical_reasoning?: string | null
          common_mistakes?: Json
          conclusion?: string | null
          content_hash?: string
          content_id?: string
          created_at?: string
          editorial_reviewer_id?: string | null
          editorial_status?: string
          estimated_cost?: number | null
          estimated_minutes?: number
          exam_application?: string | null
          generation_id?: string | null
          id?: string
          input_tokens?: number | null
          is_synthetic?: boolean
          key_points?: Json
          language?: string
          objectives?: Json
          output_tokens?: number | null
          prompt_version?: string | null
          provenance?: Json
          published_at?: string | null
          quick_review?: Json
          reviewed_at?: string | null
          schema_version?: number
          sections?: Json
          subtitle?: string | null
          summary?: string
          title?: string
          valid_from?: string | null
          valid_until?: string | null
          version_number?: number
          video?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_content_versions_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_content_versions_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "learning_contents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_content_versions_editorial_reviewer_id_fkey"
            columns: ["editorial_reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_contents: {
        Row: {
          archived_at: string | null
          area_id: string | null
          assigned_mentor_id: string | null
          canonical_key: string
          competency_id: string | null
          created_at: string
          created_by: string
          current_published_version_id: string | null
          exam_program_id: string | null
          guideline_id: string | null
          id: string
          slug: string
          specialty_id: string
          subtheme_id: string | null
          theme_id: string | null
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          area_id?: string | null
          assigned_mentor_id?: string | null
          canonical_key: string
          competency_id?: string | null
          created_at?: string
          created_by: string
          current_published_version_id?: string | null
          exam_program_id?: string | null
          guideline_id?: string | null
          id?: string
          slug: string
          specialty_id: string
          subtheme_id?: string | null
          theme_id?: string | null
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          area_id?: string | null
          assigned_mentor_id?: string | null
          canonical_key?: string
          competency_id?: string | null
          created_at?: string
          created_by?: string
          current_published_version_id?: string | null
          exam_program_id?: string | null
          guideline_id?: string | null
          id?: string
          slug?: string
          specialty_id?: string
          subtheme_id?: string | null
          theme_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_contents_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "medical_areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_contents_assigned_mentor_id_fkey"
            columns: ["assigned_mentor_id"]
            isOneToOne: false
            referencedRelation: "mentor_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "learning_contents_competency_id_fkey"
            columns: ["competency_id"]
            isOneToOne: false
            referencedRelation: "competencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_contents_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_contents_current_version_fk"
            columns: ["current_published_version_id", "id"]
            isOneToOne: false
            referencedRelation: "learning_content_versions"
            referencedColumns: ["id", "content_id"]
          },
          {
            foreignKeyName: "learning_contents_exam_program_id_fkey"
            columns: ["exam_program_id"]
            isOneToOne: false
            referencedRelation: "exam_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_contents_guideline_id_fkey"
            columns: ["guideline_id"]
            isOneToOne: false
            referencedRelation: "guidelines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_contents_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_contents_subtheme_id_fkey"
            columns: ["subtheme_id"]
            isOneToOne: false
            referencedRelation: "subthemes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_contents_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "themes"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_dna_policies: {
        Row: {
          algorithm_version: string
          created_at: string
          is_active: boolean
          is_synthetic: boolean
          limitations: string[]
          parameters: Json
          version: string
        }
        Insert: {
          algorithm_version: string
          created_at?: string
          is_active?: boolean
          is_synthetic?: boolean
          limitations?: string[]
          parameters: Json
          version: string
        }
        Update: {
          algorithm_version?: string
          created_at?: string
          is_active?: boolean
          is_synthetic?: boolean
          limitations?: string[]
          parameters?: Json
          version?: string
        }
        Relationships: []
      }
      learning_dna_snapshots: {
        Row: {
          algorithm_version: string
          calculated_at: string
          coverage: number
          event_origins: string[]
          evidence_count: number
          id: string
          indicators: Json
          limitations: string[]
          policy_version: string
          scope_id: string | null
          scope_type: string
          source_hash: string
          student_id: string
          sufficiency: string
          window_end: string | null
          window_start: string | null
        }
        Insert: {
          algorithm_version: string
          calculated_at?: string
          coverage: number
          event_origins?: string[]
          evidence_count: number
          id?: string
          indicators: Json
          limitations?: string[]
          policy_version: string
          scope_id?: string | null
          scope_type: string
          source_hash: string
          student_id: string
          sufficiency: string
          window_end?: string | null
          window_start?: string | null
        }
        Update: {
          algorithm_version?: string
          calculated_at?: string
          coverage?: number
          event_origins?: string[]
          evidence_count?: number
          id?: string
          indicators?: Json
          limitations?: string[]
          policy_version?: string
          scope_id?: string | null
          scope_type?: string
          source_hash?: string
          student_id?: string
          sufficiency?: string
          window_end?: string | null
          window_start?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "learning_dna_snapshots_policy_version_fkey"
            columns: ["policy_version"]
            isOneToOne: false
            referencedRelation: "learning_dna_policies"
            referencedColumns: ["version"]
          },
          {
            foreignKeyName: "learning_dna_snapshots_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_event_types: {
        Row: {
          code: string
          created_at: string
          description: string
          name: string
          produces_evidence: boolean
        }
        Insert: {
          code: string
          created_at?: string
          description: string
          name: string
          produces_evidence?: boolean
        }
        Update: {
          code?: string
          created_at?: string
          description?: string
          name?: string
          produces_evidence?: boolean
        }
        Relationships: []
      }
      learning_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          idempotency_key: string
          occurred_at: string
          payload: Json
          schema_version: number
          student_id: string
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          idempotency_key: string
          occurred_at: string
          payload?: Json
          schema_version?: number
          student_id: string
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          idempotency_key?: string
          occurred_at?: string
          payload?: Json
          schema_version?: number
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "learning_events_event_type_fkey"
            columns: ["event_type"]
            isOneToOne: false
            referencedRelation: "learning_event_types"
            referencedColumns: ["code"]
          },
          {
            foreignKeyName: "learning_events_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      learning_evidence: {
        Row: {
          algorithm_version: string
          competency_id: string
          created_at: string
          difficulty: number
          id: string
          is_correct: boolean
          observed_at: string
          response_time_ms: number | null
          source_event_id: string
          student_id: string
          weight: number
        }
        Insert: {
          algorithm_version: string
          competency_id: string
          created_at?: string
          difficulty: number
          id?: string
          is_correct: boolean
          observed_at: string
          response_time_ms?: number | null
          source_event_id: string
          student_id: string
          weight: number
        }
        Update: {
          algorithm_version?: string
          competency_id?: string
          created_at?: string
          difficulty?: number
          id?: string
          is_correct?: boolean
          observed_at?: string
          response_time_ms?: number | null
          source_event_id?: string
          student_id?: string
          weight?: number
        }
        Relationships: [
          {
            foreignKeyName: "learning_evidence_competency_id_fkey"
            columns: ["competency_id"]
            isOneToOne: false
            referencedRelation: "competencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_evidence_source_event_id_fkey"
            columns: ["source_event_id"]
            isOneToOne: false
            referencedRelation: "learning_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "learning_evidence_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mastery_snapshots: {
        Row: {
          algorithm_version: string
          calculated_at: string
          competency_id: string
          confidence: number
          evidence_count: number
          id: string
          last_evidence_at: string
          mastery: number
          source_event_id: string
          student_id: string
          trend: string
        }
        Insert: {
          algorithm_version: string
          calculated_at?: string
          competency_id: string
          confidence: number
          evidence_count: number
          id?: string
          last_evidence_at: string
          mastery: number
          source_event_id: string
          student_id: string
          trend: string
        }
        Update: {
          algorithm_version?: string
          calculated_at?: string
          competency_id?: string
          confidence?: number
          evidence_count?: number
          id?: string
          last_evidence_at?: string
          mastery?: number
          source_event_id?: string
          student_id?: string
          trend?: string
        }
        Relationships: [
          {
            foreignKeyName: "mastery_snapshots_competency_id_fkey"
            columns: ["competency_id"]
            isOneToOne: false
            referencedRelation: "competencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mastery_snapshots_source_event_id_fkey"
            columns: ["source_event_id"]
            isOneToOne: false
            referencedRelation: "learning_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mastery_snapshots_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_areas: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      medical_specialty_ownership_history: {
        Row: {
          assigned_by: string | null
          authorization_reference: string
          ends_at: string | null
          id: string
          mentor_id: string
          operation: string
          owner_role: string
          ownership_id: string
          reason: string | null
          recorded_at: string
          request_id: string
          scope: string
          specialty_id: string
          starts_at: string
          status: string
          unavailable_until: string | null
        }
        Insert: {
          assigned_by?: string | null
          authorization_reference: string
          ends_at?: string | null
          id?: string
          mentor_id: string
          operation: string
          owner_role: string
          ownership_id: string
          reason?: string | null
          recorded_at?: string
          request_id: string
          scope: string
          specialty_id: string
          starts_at: string
          status: string
          unavailable_until?: string | null
        }
        Update: {
          assigned_by?: string | null
          authorization_reference?: string
          ends_at?: string | null
          id?: string
          mentor_id?: string
          operation?: string
          owner_role?: string
          ownership_id?: string
          reason?: string | null
          recorded_at?: string
          request_id?: string
          scope?: string
          specialty_id?: string
          starts_at?: string
          status?: string
          unavailable_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "medical_specialty_ownership_history_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_specialty_ownership_history_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentor_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "medical_specialty_ownership_history_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_specialty_owners: {
        Row: {
          authorization_reference: string
          authorized_by: string | null
          created_at: string
          ends_at: string | null
          id: string
          mentor_id: string
          owner_role: string
          reason: string | null
          scope: string
          specialty_id: string
          starts_at: string
          status: string
          unavailable_until: string | null
          updated_at: string
        }
        Insert: {
          authorization_reference: string
          authorized_by?: string | null
          created_at?: string
          ends_at?: string | null
          id?: string
          mentor_id: string
          owner_role: string
          reason?: string | null
          scope?: string
          specialty_id: string
          starts_at?: string
          status?: string
          unavailable_until?: string | null
          updated_at?: string
        }
        Update: {
          authorization_reference?: string
          authorized_by?: string | null
          created_at?: string
          ends_at?: string | null
          id?: string
          mentor_id?: string
          owner_role?: string
          reason?: string | null
          scope?: string
          specialty_id?: string
          starts_at?: string
          status?: string
          unavailable_until?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_specialty_owners_authorized_by_fkey"
            columns: ["authorized_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "medical_specialty_owners_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentor_profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "medical_specialty_owners_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      mentor_profiles: {
        Row: {
          authorization_status: string
          created_at: string
          mfa_required: boolean
          professional_name: string
          professional_registration: string | null
          specialty_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          authorization_status?: string
          created_at?: string
          mfa_required?: boolean
          professional_name: string
          professional_registration?: string | null
          specialty_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          authorization_status?: string
          created_at?: string
          mfa_required?: boolean
          professional_name?: string
          professional_registration?: string | null
          specialty_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mentor_profiles_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_item_material_versions: {
        Row: {
          assigned_at: string
          content_id: string
          plan_item_id: string
          version_id: string
        }
        Insert: {
          assigned_at?: string
          content_id: string
          plan_item_id: string
          version_id: string
        }
        Update: {
          assigned_at?: string
          content_id?: string
          plan_item_id?: string
          version_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_item_material_versions_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "learning_contents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_item_material_versions_plan_item_id_fkey"
            columns: ["plan_item_id"]
            isOneToOne: true
            referencedRelation: "study_plan_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_item_material_versions_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "learning_content_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string
          email: string
          id: string
          onboarding_status: Database["public"]["Enums"]["onboarding_status"]
          onboarding_step: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name: string
          email: string
          id: string
          onboarding_status?: Database["public"]["Enums"]["onboarding_status"]
          onboarding_step?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string
          email?: string
          id?: string
          onboarding_status?: Database["public"]["Enums"]["onboarding_status"]
          onboarding_step?: number
          updated_at?: string
        }
        Relationships: []
      }
      program_specialties: {
        Row: {
          created_at: string
          exam_program_id: string
          specialty_id: string
        }
        Insert: {
          created_at?: string
          exam_program_id: string
          specialty_id: string
        }
        Update: {
          created_at?: string
          exam_program_id?: string
          specialty_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_specialties_exam_program_id_fkey"
            columns: ["exam_program_id"]
            isOneToOne: false
            referencedRelation: "exam_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_specialties_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      question_assets: {
        Row: {
          alt_text: string | null
          asset_type: string
          id: string
          position: number
          question_version_id: string
          storage_path: string
        }
        Insert: {
          alt_text?: string | null
          asset_type: string
          id?: string
          position?: number
          question_version_id: string
          storage_path: string
        }
        Update: {
          alt_text?: string | null
          asset_type?: string
          id?: string
          position?: number
          question_version_id?: string
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_assets_question_version_id_fkey"
            columns: ["question_version_id"]
            isOneToOne: false
            referencedRelation: "question_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      question_attempts: {
        Row: {
          answered_at: string
          assessment_id: string
          evidence_algorithm_version: string | null
          evidence_signal: string | null
          id: string
          is_correct: boolean
          learning_event_id: string
          origin: string
          question_version_id: string
          response_time_ms: number
          selected_option_id: string
          stated_confidence: string | null
          student_id: string
        }
        Insert: {
          answered_at?: string
          assessment_id: string
          evidence_algorithm_version?: string | null
          evidence_signal?: string | null
          id?: string
          is_correct: boolean
          learning_event_id: string
          origin?: string
          question_version_id: string
          response_time_ms: number
          selected_option_id: string
          stated_confidence?: string | null
          student_id: string
        }
        Update: {
          answered_at?: string
          assessment_id?: string
          evidence_algorithm_version?: string | null
          evidence_signal?: string | null
          id?: string
          is_correct?: boolean
          learning_event_id?: string
          origin?: string
          question_version_id?: string
          response_time_ms?: number
          selected_option_id?: string
          stated_confidence?: string | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_attempts_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "diagnostic_assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_attempts_learning_event_id_fkey"
            columns: ["learning_event_id"]
            isOneToOne: false
            referencedRelation: "learning_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_attempts_question_version_id_fkey"
            columns: ["question_version_id"]
            isOneToOne: false
            referencedRelation: "question_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_attempts_selected_option_id_fkey"
            columns: ["selected_option_id"]
            isOneToOne: false
            referencedRelation: "question_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_attempts_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      question_options: {
        Row: {
          content: string
          id: string
          is_correct: boolean
          label: string
          position: number
          question_version_id: string
        }
        Insert: {
          content: string
          id?: string
          is_correct?: boolean
          label: string
          position: number
          question_version_id: string
        }
        Update: {
          content?: string
          id?: string
          is_correct?: boolean
          label?: string
          position?: number
          question_version_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_options_question_version_id_fkey"
            columns: ["question_version_id"]
            isOneToOne: false
            referencedRelation: "question_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      question_version_competencies: {
        Row: {
          competency_id: string
          question_version_id: string
          relevance: number
        }
        Insert: {
          competency_id: string
          question_version_id: string
          relevance?: number
        }
        Update: {
          competency_id?: string
          question_version_id?: string
          relevance?: number
        }
        Relationships: [
          {
            foreignKeyName: "question_version_competencies_competency_id_fkey"
            columns: ["competency_id"]
            isOneToOne: false
            referencedRelation: "competencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_version_competencies_question_version_id_fkey"
            columns: ["question_version_id"]
            isOneToOne: false
            referencedRelation: "question_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      question_version_guidelines: {
        Row: {
          guideline_id: string
          question_version_id: string
        }
        Insert: {
          guideline_id: string
          question_version_id: string
        }
        Update: {
          guideline_id?: string
          question_version_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_version_guidelines_guideline_id_fkey"
            columns: ["guideline_id"]
            isOneToOne: false
            referencedRelation: "guidelines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_version_guidelines_question_version_id_fkey"
            columns: ["question_version_id"]
            isOneToOne: false
            referencedRelation: "question_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      question_version_programs: {
        Row: {
          exam_program_id: string
          question_version_id: string
        }
        Insert: {
          exam_program_id: string
          question_version_id: string
        }
        Update: {
          exam_program_id?: string
          question_version_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_version_programs_exam_program_id_fkey"
            columns: ["exam_program_id"]
            isOneToOne: false
            referencedRelation: "exam_programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_version_programs_question_version_id_fkey"
            columns: ["question_version_id"]
            isOneToOne: false
            referencedRelation: "question_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      question_version_provenance: {
        Row: {
          author_name: string | null
          authorship_kind: string
          content_type: string
          correction_history: Json
          created_at: string
          editorial_status: string
          effective_from: string | null
          effective_until: string | null
          external_identifier: string
          homologator_name: string | null
          id: string
          import_batch_id: string | null
          legal_basis: string
          obtained_on: string
          origin: string
          provenance_version: number
          question_version_id: string
          responsible_party: string
          reviewer_name: string | null
          rights_holder: string
          source_title: string
          source_url: string | null
          updated_at: string
          usage_restrictions: string[]
        }
        Insert: {
          author_name?: string | null
          authorship_kind: string
          content_type?: string
          correction_history?: Json
          created_at?: string
          editorial_status: string
          effective_from?: string | null
          effective_until?: string | null
          external_identifier: string
          homologator_name?: string | null
          id?: string
          import_batch_id?: string | null
          legal_basis: string
          obtained_on: string
          origin: string
          provenance_version?: number
          question_version_id: string
          responsible_party: string
          reviewer_name?: string | null
          rights_holder: string
          source_title: string
          source_url?: string | null
          updated_at?: string
          usage_restrictions?: string[]
        }
        Update: {
          author_name?: string | null
          authorship_kind?: string
          content_type?: string
          correction_history?: Json
          created_at?: string
          editorial_status?: string
          effective_from?: string | null
          effective_until?: string | null
          external_identifier?: string
          homologator_name?: string | null
          id?: string
          import_batch_id?: string | null
          legal_basis?: string
          obtained_on?: string
          origin?: string
          provenance_version?: number
          question_version_id?: string
          responsible_party?: string
          reviewer_name?: string | null
          rights_holder?: string
          source_title?: string
          source_url?: string | null
          updated_at?: string
          usage_restrictions?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "question_version_provenance_import_batch_id_fkey"
            columns: ["import_batch_id"]
            isOneToOne: false
            referencedRelation: "content_import_batches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_version_provenance_question_version_id_fkey"
            columns: ["question_version_id"]
            isOneToOne: true
            referencedRelation: "question_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      question_version_references: {
        Row: {
          question_version_id: string
          reference_id: string
        }
        Insert: {
          question_version_id: string
          reference_id: string
        }
        Update: {
          question_version_id?: string
          reference_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_version_references_question_version_id_fkey"
            columns: ["question_version_id"]
            isOneToOne: false
            referencedRelation: "question_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_version_references_reference_id_fkey"
            columns: ["reference_id"]
            isOneToOne: false
            referencedRelation: "academic_references"
            referencedColumns: ["id"]
          },
        ]
      }
      question_version_specialties: {
        Row: {
          question_version_id: string
          specialty_id: string
        }
        Insert: {
          question_version_id: string
          specialty_id: string
        }
        Update: {
          question_version_id?: string
          specialty_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_version_specialties_question_version_id_fkey"
            columns: ["question_version_id"]
            isOneToOne: false
            referencedRelation: "question_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_version_specialties_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      question_version_subthemes: {
        Row: {
          question_version_id: string
          subtheme_id: string
        }
        Insert: {
          question_version_id: string
          subtheme_id: string
        }
        Update: {
          question_version_id?: string
          subtheme_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_version_subthemes_question_version_id_fkey"
            columns: ["question_version_id"]
            isOneToOne: false
            referencedRelation: "question_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_version_subthemes_subtheme_id_fkey"
            columns: ["subtheme_id"]
            isOneToOne: false
            referencedRelation: "subthemes"
            referencedColumns: ["id"]
          },
        ]
      }
      question_version_tags: {
        Row: {
          question_version_id: string
          tag_id: string
        }
        Insert: {
          question_version_id: string
          tag_id: string
        }
        Update: {
          question_version_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_version_tags_question_version_id_fkey"
            columns: ["question_version_id"]
            isOneToOne: false
            referencedRelation: "question_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_version_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      question_version_themes: {
        Row: {
          question_version_id: string
          theme_id: string
        }
        Insert: {
          question_version_id: string
          theme_id: string
        }
        Update: {
          question_version_id?: string
          theme_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_version_themes_question_version_id_fkey"
            columns: ["question_version_id"]
            isOneToOne: false
            referencedRelation: "question_versions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_version_themes_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "themes"
            referencedColumns: ["id"]
          },
        ]
      }
      question_versions: {
        Row: {
          change_note: string | null
          cognitive_level: string | null
          commentary: string | null
          created_at: string
          difficulty: number | null
          id: string
          institution_id: string | null
          question_id: string
          status: string
          stem: string
          version: number
        }
        Insert: {
          change_note?: string | null
          cognitive_level?: string | null
          commentary?: string | null
          created_at?: string
          difficulty?: number | null
          id?: string
          institution_id?: string | null
          question_id: string
          status?: string
          stem: string
          version: number
        }
        Update: {
          change_note?: string | null
          cognitive_level?: string | null
          commentary?: string | null
          created_at?: string
          difficulty?: number | null
          id?: string
          institution_id?: string | null
          question_id?: string
          status?: string
          stem?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "question_versions_institution_id_fkey"
            columns: ["institution_id"]
            isOneToOne: false
            referencedRelation: "institutions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "question_versions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          canonical_hash: string
          created_at: string
          current_version: number
          id: string
          source_key: string | null
          status: string
          updated_at: string
        }
        Insert: {
          canonical_hash: string
          created_at?: string
          current_version?: number
          id?: string
          source_key?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          canonical_hash?: string
          created_at?: string
          current_version?: number
          id?: string
          source_key?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      specialties: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      specialty_areas: {
        Row: {
          area_id: string
          created_at: string
          specialty_id: string
        }
        Insert: {
          area_id: string
          created_at?: string
          specialty_id: string
        }
        Update: {
          area_id?: string
          created_at?: string
          specialty_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "specialty_areas_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "medical_areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "specialty_areas_specialty_id_fkey"
            columns: ["specialty_id"]
            isOneToOne: false
            referencedRelation: "specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      student_availability: {
        Row: {
          created_at: string
          id: string
          minutes_available: number
          updated_at: string
          user_id: string
          weekday: number
        }
        Insert: {
          created_at?: string
          id?: string
          minutes_available: number
          updated_at?: string
          user_id: string
          weekday: number
        }
        Update: {
          created_at?: string
          id?: string
          minutes_available?: number
          updated_at?: string
          user_id?: string
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "student_availability_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_profiles: {
        Row: {
          assessment_preference: string | null
          created_at: string
          experience_level: string | null
          graduation_year: number | null
          preferred_session_minutes: number | null
          residency_year: number | null
          updated_at: string
          user_id: string
          weekly_study_hours: number | null
        }
        Insert: {
          assessment_preference?: string | null
          created_at?: string
          experience_level?: string | null
          graduation_year?: number | null
          preferred_session_minutes?: number | null
          residency_year?: number | null
          updated_at?: string
          user_id: string
          weekly_study_hours?: number | null
        }
        Update: {
          assessment_preference?: string | null
          created_at?: string
          experience_level?: string | null
          graduation_year?: number | null
          preferred_session_minutes?: number | null
          residency_year?: number | null
          updated_at?: string
          user_id?: string
          weekly_study_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "student_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_target_exams: {
        Row: {
          created_at: string
          exam_edition_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          exam_edition_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          exam_edition_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "student_target_exams_exam_edition_id_fkey"
            columns: ["exam_edition_id"]
            isOneToOne: false
            referencedRelation: "amrigs_content_metadata"
            referencedColumns: ["exam_edition_id"]
          },
          {
            foreignKeyName: "student_target_exams_exam_edition_id_fkey"
            columns: ["exam_edition_id"]
            isOneToOne: false
            referencedRelation: "exam_editions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "student_target_exams_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      study_plan_item_actions: {
        Row: {
          action: string
          actual_minutes: number | null
          from_status: string
          id: string
          item_id: string
          learning_event_id: string | null
          occurred_at: string
          reason: string | null
          student_id: string
          to_status: string
        }
        Insert: {
          action: string
          actual_minutes?: number | null
          from_status: string
          id?: string
          item_id: string
          learning_event_id?: string | null
          occurred_at?: string
          reason?: string | null
          student_id: string
          to_status: string
        }
        Update: {
          action?: string
          actual_minutes?: number | null
          from_status?: string
          id?: string
          item_id?: string
          learning_event_id?: string | null
          occurred_at?: string
          reason?: string | null
          student_id?: string
          to_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_plan_item_actions_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "study_plan_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_plan_item_actions_learning_event_id_fkey"
            columns: ["learning_event_id"]
            isOneToOne: false
            referencedRelation: "learning_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_plan_item_actions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      study_plan_items: {
        Row: {
          algorithm_version: string
          competency_id: string
          created_at: string
          estimated_minutes: number
          id: string
          item_type: string
          justification: Json
          plan_version_id: string
          planned_date: string | null
          position: number | null
          priority: number
          recommendation_origin: string
          replan_count: number
          source_snapshot: Json
          status: string
          updated_at: string
        }
        Insert: {
          algorithm_version: string
          competency_id: string
          created_at?: string
          estimated_minutes: number
          id?: string
          item_type: string
          justification: Json
          plan_version_id: string
          planned_date?: string | null
          position?: number | null
          priority: number
          recommendation_origin: string
          replan_count?: number
          source_snapshot: Json
          status: string
          updated_at?: string
        }
        Update: {
          algorithm_version?: string
          competency_id?: string
          created_at?: string
          estimated_minutes?: number
          id?: string
          item_type?: string
          justification?: Json
          plan_version_id?: string
          planned_date?: string | null
          position?: number | null
          priority?: number
          recommendation_origin?: string
          replan_count?: number
          source_snapshot?: Json
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_plan_items_competency_id_fkey"
            columns: ["competency_id"]
            isOneToOne: false
            referencedRelation: "competencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_plan_items_plan_version_id_fkey"
            columns: ["plan_version_id"]
            isOneToOne: false
            referencedRelation: "study_plan_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      study_plan_versions: {
        Row: {
          algorithm_version: string
          availability_snapshot: Json
          generated_at: string
          id: string
          input_hash: string
          input_snapshot: Json
          period_end: string
          period_start: string
          plan_id: string
          status: string
          total_available_minutes: number
          total_planned_minutes: number
          trigger_reason: string
          version: number
        }
        Insert: {
          algorithm_version: string
          availability_snapshot: Json
          generated_at?: string
          id?: string
          input_hash: string
          input_snapshot: Json
          period_end: string
          period_start: string
          plan_id: string
          status?: string
          total_available_minutes: number
          total_planned_minutes: number
          trigger_reason: string
          version: number
        }
        Update: {
          algorithm_version?: string
          availability_snapshot?: Json
          generated_at?: string
          id?: string
          input_hash?: string
          input_snapshot?: Json
          period_end?: string
          period_start?: string
          plan_id?: string
          status?: string
          total_available_minutes?: number
          total_planned_minutes?: number
          trigger_reason?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "study_plan_versions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "study_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      study_plans: {
        Row: {
          algorithm: string
          algorithm_version: string
          created_at: string
          current_version: number
          id: string
          objective: string
          status: string
          student_id: string
          target_exam_edition_id: string | null
          updated_at: string
        }
        Insert: {
          algorithm?: string
          algorithm_version?: string
          created_at?: string
          current_version?: number
          id?: string
          objective: string
          status?: string
          student_id: string
          target_exam_edition_id?: string | null
          updated_at?: string
        }
        Update: {
          algorithm?: string
          algorithm_version?: string
          created_at?: string
          current_version?: number
          id?: string
          objective?: string
          status?: string
          student_id?: string
          target_exam_edition_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_plans_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_plans_target_exam_edition_id_fkey"
            columns: ["target_exam_edition_id"]
            isOneToOne: false
            referencedRelation: "amrigs_content_metadata"
            referencedColumns: ["exam_edition_id"]
          },
          {
            foreignKeyName: "study_plans_target_exam_edition_id_fkey"
            columns: ["target_exam_edition_id"]
            isOneToOne: false
            referencedRelation: "exam_editions"
            referencedColumns: ["id"]
          },
        ]
      }
      subthemes: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          theme_id: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          theme_id: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          theme_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subthemes_theme_id_fkey"
            columns: ["theme_id"]
            isOneToOne: false
            referencedRelation: "themes"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          id: string
          name: string
          slug: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      themes: {
        Row: {
          area_id: string
          code: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          area_id: string
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          area_id?: string
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "themes_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "medical_areas"
            referencedColumns: ["id"]
          },
        ]
      }
      tutor_context_references: {
        Row: {
          created_at: string
          entity_id: string | null
          generation_id: string
          id: string
          label: string
          position: number
          reference_type: string
          snapshot: Json
        }
        Insert: {
          created_at?: string
          entity_id?: string | null
          generation_id: string
          id?: string
          label: string
          position: number
          reference_type: string
          snapshot?: Json
        }
        Update: {
          created_at?: string
          entity_id?: string | null
          generation_id?: string
          id?: string
          label?: string
          position?: number
          reference_type?: string
          snapshot?: Json
        }
        Relationships: [
          {
            foreignKeyName: "tutor_context_references_generation_id_fkey"
            columns: ["generation_id"]
            isOneToOne: false
            referencedRelation: "tutor_generations"
            referencedColumns: ["id"]
          },
        ]
      }
      tutor_conversations: {
        Row: {
          archived_at: string | null
          created_at: string
          id: string
          mode: string
          origin_id: string | null
          origin_type: string | null
          retention_until: string
          status: string
          student_id: string
          title: string
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          created_at?: string
          id?: string
          mode: string
          origin_id?: string | null
          origin_type?: string | null
          retention_until?: string
          status?: string
          student_id: string
          title?: string
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          created_at?: string
          id?: string
          mode?: string
          origin_id?: string | null
          origin_type?: string | null
          retention_until?: string
          status?: string
          student_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      tutor_generations: {
        Row: {
          assistant_message_id: string
          completed_at: string | null
          conversation_id: string
          created_at: string
          error_code: string | null
          estimated_cost_microusd: number | null
          id: string
          input_tokens: number
          latency_ms: number | null
          model: string
          openai_response_id: string | null
          output_tokens: number
          prompt_version: string
          request_id: string
          status: string
          student_id: string
          total_tokens: number
          user_message_id: string
        }
        Insert: {
          assistant_message_id: string
          completed_at?: string | null
          conversation_id: string
          created_at?: string
          error_code?: string | null
          estimated_cost_microusd?: number | null
          id?: string
          input_tokens?: number
          latency_ms?: number | null
          model: string
          openai_response_id?: string | null
          output_tokens?: number
          prompt_version: string
          request_id: string
          status: string
          student_id: string
          total_tokens?: number
          user_message_id: string
        }
        Update: {
          assistant_message_id?: string
          completed_at?: string | null
          conversation_id?: string
          created_at?: string
          error_code?: string | null
          estimated_cost_microusd?: number | null
          id?: string
          input_tokens?: number
          latency_ms?: number | null
          model?: string
          openai_response_id?: string | null
          output_tokens?: number
          prompt_version?: string
          request_id?: string
          status?: string
          student_id?: string
          total_tokens?: number
          user_message_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tutor_generations_assistant_message_id_fkey"
            columns: ["assistant_message_id"]
            isOneToOne: false
            referencedRelation: "tutor_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tutor_generations_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "tutor_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tutor_generations_prompt_version_fkey"
            columns: ["prompt_version"]
            isOneToOne: false
            referencedRelation: "tutor_prompt_versions"
            referencedColumns: ["version"]
          },
          {
            foreignKeyName: "tutor_generations_user_message_id_fkey"
            columns: ["user_message_id"]
            isOneToOne: false
            referencedRelation: "tutor_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      tutor_messages: {
        Row: {
          completed_at: string | null
          content: string
          conversation_id: string
          created_at: string
          error_code: string | null
          id: string
          model: string | null
          request_id: string | null
          response_to_id: string | null
          role: string
          status: string
        }
        Insert: {
          completed_at?: string | null
          content: string
          conversation_id: string
          created_at?: string
          error_code?: string | null
          id?: string
          model?: string | null
          request_id?: string | null
          response_to_id?: string | null
          role: string
          status: string
        }
        Update: {
          completed_at?: string | null
          content?: string
          conversation_id?: string
          created_at?: string
          error_code?: string | null
          id?: string
          model?: string | null
          request_id?: string | null
          response_to_id?: string | null
          role?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "tutor_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "tutor_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tutor_messages_response_to_id_fkey"
            columns: ["response_to_id"]
            isOneToOne: false
            referencedRelation: "tutor_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      tutor_prompt_versions: {
        Row: {
          active: boolean
          content_sha256: string
          created_at: string
          id: string
          version: string
        }
        Insert: {
          active?: boolean
          content_sha256: string
          created_at?: string
          id?: string
          version: string
        }
        Update: {
          active?: boolean
          content_sha256?: string
          created_at?: string
          id?: string
          version?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          granted_at: string
          granted_by: string | null
          role: string
          user_id: string
        }
        Insert: {
          granted_at?: string
          granted_by?: string | null
          role: string
          user_id: string
        }
        Update: {
          granted_at?: string
          granted_by?: string | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      amrigs_content_metadata: {
        Row: {
          competency_count: number | null
          edition: string | null
          exam_edition_id: string | null
          non_published_count: number | null
          program_code: string | null
          provenance_count: number | null
          published_count: number | null
          question_count: number | null
          year: number | null
        }
        Relationships: []
      }
      current_mastery: {
        Row: {
          algorithm_version: string | null
          calculated_at: string | null
          competency_id: string | null
          confidence: number | null
          evidence_count: number | null
          id: string | null
          last_evidence_at: string | null
          mastery: number | null
          source_event_id: string | null
          student_id: string | null
          trend: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mastery_snapshots_competency_id_fkey"
            columns: ["competency_id"]
            isOneToOne: false
            referencedRelation: "competencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mastery_snapshots_source_event_id_fkey"
            columns: ["source_event_id"]
            isOneToOne: false
            referencedRelation: "learning_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mastery_snapshots_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      answer_diagnostic_question: {
        Args: {
          p_assessment_id: string
          p_question_version_id: string
          p_response_time_ms: number
          p_selected_option_id: string
          p_stated_confidence?: string
        }
        Returns: string
      }
      answer_diagnostic_question_once: {
        Args: {
          p_assessment_id: string
          p_question_version_id: string
          p_response_time_ms: number
          p_selected_option_id: string
          p_stated_confidence?: string
        }
        Returns: string
      }
      archive_tutor_conversation: {
        Args: { p_conversation_id: string }
        Returns: undefined
      }
      assign_medical_specialty_owner: {
        Args: {
          p_authorization_reference: string
          p_mentor_id: string
          p_owner_role: string
          p_request_id: string
          p_specialty_id: string
        }
        Returns: string
      }
      begin_tutor_generation: {
        Args: {
          p_content: string
          p_conversation_id: string
          p_model: string
          p_prompt_version: string
          p_request_id: string
        }
        Returns: Json
      }
      calculate_diagnostic_confidence: {
        Args: { p_as_of: string; p_competency_id: string; p_student_id: string }
        Returns: number
      }
      can_manage_editorial: { Args: never; Returns: boolean }
      create_learning_content_draft: {
        Args: {
          p_ai_assisted?: boolean
          p_ai_model?: string
          p_canonical_key: string
          p_common_mistakes: Json
          p_competency_id?: string
          p_conclusion: string
          p_estimated_minutes: number
          p_exam_application: string
          p_is_synthetic?: boolean
          p_key_points: Json
          p_objectives: Json
          p_prompt_version?: string
          p_quick_review: Json
          p_request_id?: string
          p_sections: Json
          p_slug: string
          p_specialty_id?: string
          p_summary: string
          p_title: string
        }
        Returns: string
      }
      create_learning_content_version: {
        Args: {
          p_content_id: string
          p_request_id: string
          p_sections: Json
          p_source_version_id: string
          p_summary: string
          p_title: string
        }
        Returns: string
      }
      create_tutor_conversation: {
        Args: { p_mode: string; p_origin_id?: string; p_origin_type?: string }
        Returns: string
      }
      editorial_version_hash: {
        Args: {
          p_clinical_reasoning: string
          p_common_mistakes: Json
          p_conclusion: string
          p_exam_application: string
          p_key_points: Json
          p_objectives: Json
          p_quick_review: Json
          p_sections: Json
          p_subtitle: string
          p_summary: string
          p_title: string
          p_video: Json
        }
        Returns: string
      }
      finish_diagnostic_assessment: {
        Args: { p_assessment_id: string }
        Returns: string
      }
      finish_diagnostic_assessment_v2: {
        Args: {
          p_assessment_id: string
          p_completion_reason: string
          p_evidence_sufficient: boolean
        }
        Returns: string
      }
      finish_tutor_generation: {
        Args: {
          p_content: string
          p_error_code: string
          p_input_tokens: number
          p_latency_ms: number
          p_output_tokens: number
          p_references?: Json
          p_request_id: string
          p_response_id: string
          p_status: string
          p_total_tokens: number
        }
        Returns: undefined
      }
      has_app_role: { Args: { p_role: string }; Returns: boolean }
      import_amrigs_content: { Args: { p_payload: Json }; Returns: string }
      learning_dna_indicator_json: {
        Args: {
          p_area_ids: string[]
          p_competency_ids: string[]
          p_event_count: number
          p_limitations: string[]
          p_message: string
          p_period_end: string
          p_period_start: string
          p_rule: string
          p_state: string
          p_sufficient: boolean
          p_type: string
        }
        Returns: Json
      }
      owns_medical_specialty: {
        Args: { p_specialty_id: string }
        Returns: boolean
      }
      pause_diagnostic_assessment: {
        Args: { p_assessment_id: string }
        Returns: undefined
      }
      persist_study_plan: {
        Args: {
          p_availability_snapshot: Json
          p_input_hash: string
          p_input_snapshot: Json
          p_items: Json
          p_objective: string
          p_period_end: string
          p_period_start: string
          p_target_exam_edition_id: string
          p_total_available_minutes: number
          p_trigger_reason: string
        }
        Returns: string
      }
      publish_learning_content: {
        Args: { p_request_id: string; p_version_id: string }
        Returns: string
      }
      record_editorial_email_event: {
        Args: {
          p_error_code?: string
          p_event_type: string
          p_idempotency_key: string
          p_provider_id?: string
        }
        Returns: string
      }
      record_learning_event:
        | {
            Args: {
              p_event_type: string
              p_idempotency_key: string
              p_occurred_at: string
              p_payload: Json
              p_schema_version: number
              p_student_id: string
            }
            Returns: string
          }
        | {
            Args: {
              p_event_type: string
              p_idempotency_key: string
              p_occurred_at: string
              p_payload: Json
              p_schema_version?: number
              p_student_id: string
            }
            Returns: string
          }
      record_study_plan_item_action: {
        Args: {
          p_action: string
          p_actual_minutes?: number
          p_item_id: string
          p_reason?: string
        }
        Returns: string
      }
      request_content_review_priority: {
        Args: { p_request_id: string; p_version_id: string }
        Returns: string
      }
      resume_diagnostic_assessment: {
        Args: { p_assessment_id: string }
        Returns: undefined
      }
      review_assignment_email_payload: {
        Args: { p_version_id: string }
        Returns: Json
      }
      review_learning_content: {
        Args: {
          p_comment: string
          p_decision: string
          p_declaration: string
          p_issue_category: string
          p_request_id: string
          p_version_id: string
        }
        Returns: string
      }
      save_onboarding: {
        Args: {
          p_assessment_preference?: string
          p_availability?: Json
          p_complete?: boolean
          p_display_name?: string
          p_exam_edition_ids?: string[]
          p_experience_level?: string
          p_graduation_year?: number
          p_preferred_session_minutes?: number
          p_residency_year?: number
          p_step: number
        }
        Returns: undefined
      }
      select_assessment_question: {
        Args: {
          p_assessment_id: string
          p_question_version_id: string
          p_rationale: Json
          p_selection_order: number
        }
        Returns: string
      }
      set_medical_specialty_owner_status: {
        Args: {
          p_ownership_id: string
          p_reason: string
          p_request_id: string
          p_status: string
          p_unavailable_until: string
        }
        Returns: string
      }
      start_diagnostic_assessment: {
        Args: {
          p_competency_ids: string[]
          p_duration_minutes: number
          p_exam_program_id: string
          p_objective: string
          p_question_count: number
          p_specialty_id: string
        }
        Returns: string
      }
      start_diagnostic_assessment_v3: {
        Args: {
          p_competency_ids: string[]
          p_duration_minutes: number
          p_exam_program_id: string
          p_mode: string
          p_objective: string
          p_question_count: number
          p_specialty_id: string
        }
        Returns: string
      }
      submit_content_for_review: {
        Args: {
          p_mentor_id: string
          p_request_id: string
          p_version_id: string
        }
        Returns: string
      }
    }
    Enums: {
      onboarding_status: "not_started" | "in_progress" | "completed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      onboarding_status: ["not_started", "in_progress", "completed"],
    },
  },
} as const
