import type {
  ExamBlueprint,
  ExamIntelligenceProfile,
  ExamRecurrenceStatistic,
} from '@iatron/contracts';
import type { ApiEnvironment } from './config/environment.js';
import type { TargetExamReference } from './exam-intelligence-service.js';
import { RepositoryError } from './student-repository.js';

type Row = Record<string, unknown>;
const object = (value: unknown): Row =>
  typeof value === 'object' && value !== null ? (value as Row) : {};
const rows = (value: unknown): Row[] =>
  Array.isArray(value) ? value.map(object) : [];
const text = (row: Row, key: string) => String(row[key] ?? '');
const nullableText = (row: Row, key: string) =>
  row[key] === null || row[key] === undefined ? null : String(row[key]);
const number = (row: Row, key: string) => Number(row[key]);
const boolean = (row: Row, key: string) => row[key] === true;
const stringArray = (row: Row, key: string) =>
  Array.isArray(row[key]) ? (row[key] as unknown[]).map(String) : [];

export interface ExamIntelligenceRepository {
  listProfiles(): Promise<ExamIntelligenceProfile[]>;
  getProfile(id: string): Promise<ExamIntelligenceProfile | null>;
  getBlueprint(profileId: string): Promise<ExamBlueprint | null>;
  listStatistics(profileId: string): Promise<ExamRecurrenceStatistic[]>;
  getTargetExam(): Promise<TargetExamReference | null>;
}

export function createExamIntelligenceRepository(
  environment: ApiEnvironment,
  token: string,
): ExamIntelligenceRepository {
  const headers = {
    apikey: environment.SUPABASE_PUBLISHABLE_KEY,
    authorization: `Bearer ${token}`,
  };
  const request = async (path: string) => {
    const response = await fetch(
      new URL(`/rest/v1/${path}`, environment.SUPABASE_URL),
      { headers },
    );
    if (!response.ok)
      throw new RepositoryError(
        `Exam intelligence repository failed with ${response.status}`,
        'EXAM_INTELLIGENCE_REPOSITORY_ERROR',
      );
    return rows(await response.json());
  };

  const mapProfile = (row: Row): ExamIntelligenceProfile => {
    const program = object(row.exam_programs);
    const boardValue = program.exam_boards;
    const board = boardValue ? object(boardValue) : null;
    const institution = object(program.institutions);
    return {
      id: text(row, 'id'),
      displayName: text(row, 'display_name'),
      version: number(row, 'version'),
      validFrom: text(row, 'valid_from'),
      validUntil: nullableText(row, 'valid_until'),
      editorialStatus: text(
        row,
        'editorial_status',
      ) as ExamIntelligenceProfile['editorialStatus'],
      isActive: boolean(row, 'is_active'),
      analysisPeriod: {
        start: nullableText(row, 'analysis_period_start'),
        end: nullableText(row, 'analysis_period_end'),
      },
      examsAnalyzed: number(row, 'exams_analyzed'),
      questionsAnalyzed: number(row, 'questions_analyzed'),
      coverage: number(row, 'coverage'),
      confidence: text(
        row,
        'confidence',
      ) as ExamIntelligenceProfile['confidence'],
      limitations: stringArray(row, 'limitations'),
      source: {
        title: text(row, 'source_title'),
        url: nullableText(row, 'source_url'),
        origin: text(row, 'source_origin'),
      },
      responsibleEditorial: text(row, 'responsible_editorial'),
      responsibleStatistical: nullableText(row, 'responsible_statistical'),
      notes: nullableText(row, 'notes'),
      methodVersion: text(row, 'method_version'),
      isSynthetic: boolean(row, 'is_synthetic'),
      lastUpdatedAt: text(row, 'last_updated_at'),
      program: {
        id: text(program, 'id'),
        code: text(program, 'code'),
        name: text(program, 'name'),
        board: board
          ? {
              id: text(board, 'id'),
              name: text(board, 'name'),
              acronym: nullableText(board, 'acronym'),
            }
          : null,
        institution: {
          id: text(institution, 'id'),
          name: text(institution, 'name'),
          acronym: text(institution, 'acronym'),
        },
      },
    };
  };

  const profileSelect =
    'id,display_name,version,valid_from,valid_until,editorial_status,is_active,analysis_period_start,analysis_period_end,exams_analyzed,questions_analyzed,coverage,confidence,limitations,source_title,source_url,source_origin,responsible_editorial,responsible_statistical,notes,method_version,is_synthetic,last_updated_at,exam_programs!inner(id,code,name,exam_boards(id,name,acronym),institutions(id,name,acronym))';

  return {
    async listProfiles() {
      return (
        await request(
          `exam_intelligence_profiles?select=${profileSelect}&order=version.desc`,
        )
      ).map(mapProfile);
    },
    async getProfile(id) {
      const result = await request(
        `exam_intelligence_profiles?select=${profileSelect}&id=eq.${encodeURIComponent(id)}&limit=1`,
      );
      return result[0] ? mapProfile(result[0]) : null;
    },
    async getBlueprint(profileId) {
      const result = await request(
        `exam_blueprints?select=id,profile_id,version,is_active,expected_question_count,duration_minutes,format_description,correction_rules,notes,source_title,source_url,period_start,period_end,confidence,editorial_status,is_synthetic,exam_blueprint_areas(expected_proportion,expected_question_count,weight,notes,position,specialties!inner(id,code,name))&profile_id=eq.${encodeURIComponent(profileId)}&is_active=eq.true&order=version.desc&limit=1`,
      );
      const row = result[0];
      if (!row) return null;
      return {
        id: text(row, 'id'),
        profileId: text(row, 'profile_id'),
        version: number(row, 'version'),
        isActive: boolean(row, 'is_active'),
        expectedQuestionCount:
          row.expected_question_count === null
            ? null
            : number(row, 'expected_question_count'),
        durationMinutes:
          row.duration_minutes === null
            ? null
            : number(row, 'duration_minutes'),
        formatDescription: text(row, 'format_description'),
        correctionRules: text(row, 'correction_rules'),
        notes: nullableText(row, 'notes'),
        source: {
          title: text(row, 'source_title'),
          url: nullableText(row, 'source_url'),
        },
        period: {
          start: nullableText(row, 'period_start'),
          end: nullableText(row, 'period_end'),
        },
        confidence: text(row, 'confidence') as ExamBlueprint['confidence'],
        editorialStatus: text(
          row,
          'editorial_status',
        ) as ExamBlueprint['editorialStatus'],
        isSynthetic: boolean(row, 'is_synthetic'),
        areas: rows(row.exam_blueprint_areas)
          .map((link) => {
            const specialty = object(link.specialties);
            return {
              id: text(specialty, 'id'),
              code: text(specialty, 'code'),
              name: text(specialty, 'name'),
              expectedProportion: number(link, 'expected_proportion'),
              expectedQuestionCount:
                link.expected_question_count === null
                  ? null
                  : number(link, 'expected_question_count'),
              weight: link.weight === null ? null : number(link, 'weight'),
              notes: nullableText(link, 'notes'),
              position: number(link, 'position'),
            };
          })
          .sort((left, right) => left.position - right.position),
      };
    },
    async listStatistics(profileId) {
      const result = await request(
        `exam_recurrence_statistics?select=id,profile_id,version,dimension_type,area_id,theme_id,subtheme_id,competency_id,period_start,period_end,sample_size,sample_unit,occurrences,denominator,coverage,relevance,confidence,origin,method_version,missing_data,limitations,responsible_statistical,editorial_status,is_synthetic,last_updated_at,medical_areas(id,code,name),themes(id,code,name),subthemes(id,code,name),competencies(id,code,name)&profile_id=eq.${encodeURIComponent(profileId)}&order=version.desc`,
      );
      return result.map((row) => {
        const type = text(
          row,
          'dimension_type',
        ) as ExamRecurrenceStatistic['dimension']['type'];
        const relation =
          type === 'area'
            ? object(row.medical_areas)
            : type === 'theme'
              ? object(row.themes)
              : type === 'subtheme'
                ? object(row.subthemes)
                : object(row.competencies);
        return {
          id: text(row, 'id'),
          profileId: text(row, 'profile_id'),
          version: number(row, 'version'),
          dimension: {
            type,
            id: text(relation, 'id'),
            code: text(relation, 'code'),
            name: text(relation, 'name'),
          },
          period: {
            start: nullableText(row, 'period_start'),
            end: nullableText(row, 'period_end'),
          },
          sampleSize: number(row, 'sample_size'),
          sampleUnit: text(row, 'sample_unit'),
          occurrences: number(row, 'occurrences'),
          denominator: number(row, 'denominator'),
          coverage: number(row, 'coverage'),
          relevance: text(
            row,
            'relevance',
          ) as ExamRecurrenceStatistic['relevance'],
          confidence: text(
            row,
            'confidence',
          ) as ExamRecurrenceStatistic['confidence'],
          origin: text(row, 'origin'),
          methodVersion: text(row, 'method_version'),
          missingData: stringArray(row, 'missing_data'),
          limitations: stringArray(row, 'limitations'),
          responsibleStatistical: nullableText(row, 'responsible_statistical'),
          editorialStatus: text(
            row,
            'editorial_status',
          ) as ExamRecurrenceStatistic['editorialStatus'],
          isSynthetic: boolean(row, 'is_synthetic'),
          lastUpdatedAt: text(row, 'last_updated_at'),
        };
      });
    },
    async getTargetExam() {
      const result = await request(
        'student_target_exams?select=exam_edition_id,exam_editions!inner(exam_program_id)&order=created_at.asc&limit=1',
      );
      const row = result[0];
      if (!row) return null;
      return {
        editionId: text(row, 'exam_edition_id'),
        programId: text(object(row.exam_editions), 'exam_program_id'),
      };
    },
  };
}
