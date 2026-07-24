import {
  learningDnaSnapshotSchema,
  type CatalogQuery,
  type LearningDnaSnapshot,
} from '@iatron/contracts';
import type { ApiEnvironment } from './config/environment.js';
import type {
  LearningDnaObservation,
  LearningDnaReview,
} from './learning-dna-service.js';
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

export interface LearningDnaRepository {
  listObservations(): Promise<LearningDnaObservation[]>;
  listReviews(): Promise<LearningDnaReview[]>;
  listSnapshots(query: CatalogQuery): Promise<LearningDnaSnapshot[]>;
}

export function createLearningDnaRepository(
  environment: ApiEnvironment,
  accessToken: string,
): LearningDnaRepository {
  const get = async (table: string, parameters: Record<string, string>) => {
    const url = new URL(`/rest/v1/${table}`, environment.SUPABASE_URL);
    for (const [key, value] of Object.entries(parameters))
      url.searchParams.set(key, value);
    const response = await fetch(url, {
      headers: {
        apikey: environment.SUPABASE_PUBLISHABLE_KEY,
        authorization: `Bearer ${accessToken}`,
      },
    });
    if (!response.ok)
      throw new RepositoryError(
        `Learning DNA repository request failed with ${response.status}`,
        'LEARNING_DNA_REPOSITORY_ERROR',
      );
    return rows(await response.json());
  };

  return {
    async listObservations() {
      const result = await get('question_attempts', {
        select:
          'id,student_id,is_correct,response_time_ms,stated_confidence,origin,answered_at,question_versions(difficulty,question_version_competencies(competency_id),question_version_specialties(specialty_id),question_version_themes(theme_id),question_version_subthemes(subtheme_id))',
        order: 'answered_at.asc,id.asc',
        limit: '5000',
      });
      return result.flatMap((row) => {
        const question = object(row.question_versions);
        const areaId =
          rows(question.question_version_specialties)
            .map((item) => text(item, 'specialty_id'))
            .sort()[0] ?? null;
        const themeId =
          rows(question.question_version_themes)
            .map((item) => text(item, 'theme_id'))
            .sort()[0] ?? null;
        const subthemeId =
          rows(question.question_version_subthemes)
            .map((item) => text(item, 'subtheme_id'))
            .sort()[0] ?? null;
        return rows(question.question_version_competencies).map(
          (competency): LearningDnaObservation => ({
            id: `${text(row, 'id')}:${text(competency, 'competency_id')}`,
            studentId: text(row, 'student_id'),
            occurredAt: text(row, 'answered_at'),
            competencyId: text(competency, 'competency_id'),
            areaId,
            themeId,
            subthemeId,
            difficulty: number(question, 'difficulty') || 3,
            isCorrect: Boolean(row.is_correct),
            responseTimeMs:
              row.response_time_ms === null
                ? null
                : number(row, 'response_time_ms'),
            statedConfidence: nullableText(row, 'stated_confidence'),
            origin: text(row, 'origin'),
          }),
        );
      });
    },
    async listReviews() {
      const result = await get('learning_events', {
        select: 'id,student_id,occurred_at,payload',
        event_type: 'eq.ReviewCompleted',
        order: 'occurred_at.asc,id.asc',
        limit: '1000',
      });
      return result.flatMap((row) => {
        const payload = object(row.payload);
        const competencyId = nullableText(payload, 'competencyId');
        return competencyId
          ? [
              {
                id: text(row, 'id'),
                studentId: text(row, 'student_id'),
                competencyId,
                occurredAt: text(row, 'occurred_at'),
              },
            ]
          : [];
      });
    },
    async listSnapshots(query) {
      const result = await get('learning_dna_snapshots', {
        select: '*',
        order: 'calculated_at.desc,id.desc',
        limit: String(query.limit),
        offset: String(query.offset),
      });
      return result.map((row) =>
        learningDnaSnapshotSchema.parse({
          id: text(row, 'id'),
          studentId: text(row, 'student_id'),
          scopeType: text(row, 'scope_type'),
          scopeId: nullableText(row, 'scope_id'),
          windowStart: nullableText(row, 'window_start'),
          windowEnd: nullableText(row, 'window_end'),
          calculatedAt: text(row, 'calculated_at'),
          algorithmVersion: text(row, 'algorithm_version'),
          policyVersion: text(row, 'policy_version'),
          evidenceCount: number(row, 'evidence_count'),
          coverage: number(row, 'coverage'),
          indicators: row.indicators,
          limitations: row.limitations,
          sufficiency: text(row, 'sufficiency'),
          eventOrigins: row.event_origins,
          sourceHash: text(row, 'source_hash'),
        }),
      );
    },
  };
}
