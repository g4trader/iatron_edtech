import type {
  CatalogQuery,
  LearningEvidence,
  LearningTimelineItem,
  MasteryState,
} from '@iatron/contracts';
import type { ApiEnvironment } from './config/environment.js';
import type { CompetencyIdentity } from './learning-engine.js';
import { RepositoryError } from './student-repository.js';

type Row = Record<string, unknown>;
const object = (value: unknown): Row =>
  typeof value === 'object' && value !== null ? (value as Row) : {};
const rows = (value: unknown): Row[] =>
  Array.isArray(value) ? value.map(object) : [];
const text = (row: Row, key: string) => String(row[key] ?? '');
const number = (row: Row, key: string) => Number(row[key]);

export interface LearningRepository {
  listCompetencies(): Promise<CompetencyIdentity[]>;
  listEvidence(query: CatalogQuery): Promise<LearningEvidence[]>;
  listCurrentMastery(): Promise<MasteryState[]>;
  listTimeline(query: CatalogQuery): Promise<LearningTimelineItem[]>;
}

export function createLearningRepository(
  environment: ApiEnvironment,
  accessToken: string,
): LearningRepository {
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
        `Learning repository request failed with ${response.status}`,
        'LEARNING_REPOSITORY_ERROR',
      );
    return rows(await response.json());
  };

  const listCompetencies = async () =>
    (
      await get('competencies', {
        select: 'id,code,name',
        order: 'code.asc',
        limit: '1000',
      })
    ).map((row) => ({
      id: text(row, 'id'),
      code: text(row, 'code'),
      name: text(row, 'name'),
    }));

  const listEvidence = async (query: CatalogQuery) =>
    (
      await get('learning_evidence', {
        select:
          'id,source_event_id,competency_id,weight,difficulty,response_time_ms,is_correct,observed_at,algorithm_version,competencies!inner(code,name)',
        order: 'observed_at.desc,id.desc',
        limit: String(query.limit),
        offset: String(query.offset),
      })
    ).map((row) => {
      const competency = object(row.competencies);
      return {
        id: text(row, 'id'),
        eventId: text(row, 'source_event_id'),
        competencyId: text(row, 'competency_id'),
        competencyCode: text(competency, 'code'),
        competencyName: text(competency, 'name'),
        weight: number(row, 'weight'),
        difficulty: number(row, 'difficulty'),
        responseTimeMs:
          row.response_time_ms === null
            ? null
            : number(row, 'response_time_ms'),
        isCorrect: Boolean(row.is_correct),
        observedAt: text(row, 'observed_at'),
        algorithmVersion: text(row, 'algorithm_version'),
      };
    });

  return {
    listCompetencies,
    listEvidence,
    async listCurrentMastery() {
      const [competencies, masteryRows] = await Promise.all([
        listCompetencies(),
        get('current_mastery', {
          select:
            'competency_id,mastery,confidence,evidence_count,trend,last_evidence_at,algorithm_version',
          order: 'competency_id.asc',
          limit: '1000',
        }),
      ]);
      return masteryRows.map((row) => {
        const competency = competencies.find(
          (item) => item.id === text(row, 'competency_id'),
        );
        if (!competency)
          throw new RepositoryError(
            'Mastery references an unknown competency',
            'LEARNING_INTEGRITY_ERROR',
          );
        return {
          competencyId: competency.id,
          competencyCode: competency.code,
          competencyName: competency.name,
          mastery: number(row, 'mastery'),
          confidence: number(row, 'confidence'),
          evidenceCount: number(row, 'evidence_count'),
          trend: text(row, 'trend') as MasteryState['trend'],
          lastEvidenceAt: text(row, 'last_evidence_at'),
          algorithmVersion: text(row, 'algorithm_version'),
        };
      });
    },
    async listTimeline(query) {
      const perSource = String(Math.min(100, query.limit + query.offset));
      const [eventRows, evidenceRows, snapshotRows] = await Promise.all([
        get('learning_events', {
          select: 'id,event_type,occurred_at',
          order: 'occurred_at.desc,id.desc',
          limit: perSource,
        }),
        get('learning_evidence', {
          select:
            'id,competency_id,is_correct,difficulty,observed_at,competencies!inner(code,name)',
          order: 'observed_at.desc,id.desc',
          limit: perSource,
        }),
        get('mastery_snapshots', {
          select:
            'id,competency_id,mastery,confidence,trend,calculated_at,competencies!inner(code,name)',
          order: 'calculated_at.desc,id.desc',
          limit: perSource,
        }),
      ]);
      const items: LearningTimelineItem[] = [
        ...eventRows.map((row) => ({
          id: text(row, 'id'),
          occurredAt: text(row, 'occurred_at'),
          type: 'event',
          title: text(row, 'event_type'),
          detail: 'Evento de aprendizagem registrado',
          competencyId: null,
        })),
        ...evidenceRows.map((row) => {
          const competency = object(row.competencies);
          return {
            id: text(row, 'id'),
            occurredAt: text(row, 'observed_at'),
            type: 'evidence',
            title: `${text(competency, 'code')} · evidência`,
            detail: `${row.is_correct ? 'Acerto' : 'Erro'} · dificuldade ${number(row, 'difficulty')}`,
            competencyId: text(row, 'competency_id'),
          };
        }),
        ...snapshotRows.map((row) => {
          const competency = object(row.competencies);
          return {
            id: text(row, 'id'),
            occurredAt: text(row, 'calculated_at'),
            type: 'mastery',
            title: `${text(competency, 'code')} · mastery`,
            detail: `${Math.round(number(row, 'mastery') * 100)}% · confiança ${Math.round(number(row, 'confidence') * 100)}% · ${text(row, 'trend')}`,
            competencyId: text(row, 'competency_id'),
          };
        }),
      ];
      return items
        .sort(
          (left, right) =>
            Date.parse(right.occurredAt) - Date.parse(left.occurredAt) ||
            right.id.localeCompare(left.id),
        )
        .slice(query.offset, query.offset + query.limit);
    },
  };
}
