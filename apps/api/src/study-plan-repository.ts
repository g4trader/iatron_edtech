import type { StudyPlan, StudyPlanItem } from '@iatron/contracts';
import type { ApiEnvironment } from './config/environment.js';
import type {
  Availability,
  PlanHistory,
  PlannedRecommendation,
  TargetExam,
} from './study-plan-engine.js';
import { RepositoryError } from './student-repository.js';

type Row = Record<string, unknown>;
const object = (value: unknown): Row =>
  typeof value === 'object' && value !== null ? (value as Row) : {};
const rows = (value: unknown): Row[] =>
  Array.isArray(value) ? value.map(object) : [];
const text = (row: Row, key: string) => String(row[key] ?? '');
const number = (row: Row, key: string) => Number(row[key]);

export interface StudyPlanContext {
  availability: Availability[];
  preferredSessionMinutes: number;
  targetExam: TargetExam | null;
  history: PlanHistory[];
  executionRevision: string;
}

export interface PersistPlanInput {
  objective: string;
  targetExamId: string | null;
  periodStart: string;
  periodEnd: string;
  totalAvailableMinutes: number;
  availabilitySnapshot: unknown[];
  inputSnapshot: Record<string, unknown>;
  inputHash: string;
  triggerReason: string;
  items: PlannedRecommendation[];
}

export interface StudyPlanRepository {
  context(): Promise<StudyPlanContext>;
  persist(input: PersistPlanInput): Promise<string>;
  current(): Promise<StudyPlan | null>;
  history(): Promise<StudyPlan[]>;
  item(id: string): Promise<StudyPlanItem | null>;
  action(
    id: string,
    action: string,
    actualMinutes: number | null,
    reason: string | null,
  ): Promise<string>;
}

export function createStudyPlanRepository(
  environment: ApiEnvironment,
  token: string,
): StudyPlanRepository {
  const headers = {
    apikey: environment.SUPABASE_PUBLISHABLE_KEY,
    authorization: `Bearer ${token}`,
    'content-type': 'application/json',
  };
  const request = async (path: string, init?: RequestInit) => {
    const response = await fetch(
      new URL(`/rest/v1/${path}`, environment.SUPABASE_URL),
      { ...init, headers: { ...headers, ...init?.headers } },
    );
    if (!response.ok)
      throw new RepositoryError(
        `Study plan repository failed with ${response.status}`,
        'STUDY_PLAN_REPOSITORY_ERROR',
      );
    const body = await response.text();
    return body ? (JSON.parse(body) as unknown) : null;
  };
  const rpc = (name: string, body: object) =>
    request(`rpc/${name}`, { method: 'POST', body: JSON.stringify(body) });

  const mapItem = (row: Row): StudyPlanItem => {
    const competency = object(row.competencies);
    const justification = object(row.justification);
    return {
      id: text(row, 'id'),
      competencyId: text(row, 'competency_id'),
      competencyCode: text(competency, 'code'),
      competencyName: text(competency, 'name'),
      itemType: text(row, 'item_type') as StudyPlanItem['itemType'],
      priority: number(row, 'priority'),
      estimatedMinutes: number(row, 'estimated_minutes'),
      plannedDate: row.planned_date === null ? null : text(row, 'planned_date'),
      position: row.position === null ? null : number(row, 'position'),
      status: text(row, 'status') as StudyPlanItem['status'],
      origin: text(row, 'recommendation_origin'),
      reasons: rows(justification.reasons).map((reason) => ({
        code: text(reason, 'code'),
        contribution: number(reason, 'contribution'),
        detail: text(reason, 'detail'),
      })),
      replanCount: number(row, 'replan_count'),
    };
  };

  const getPlans = async (currentOnly: boolean) => {
    const filter = currentOnly ? '&status=eq.active&limit=1' : '&limit=50';
    const planRows = rows(
      await request(
        `study_plans?select=id,objective,algorithm_version,current_version,study_plan_versions(id,version,period_start,period_end,generated_at,total_planned_minutes,total_available_minutes,trigger_reason,status,study_plan_items(id,competency_id,item_type,priority,estimated_minutes,planned_date,position,status,recommendation_origin,justification,replan_count,competencies(code,name)))&order=created_at.desc${filter}`,
      ),
    );
    return planRows.flatMap<StudyPlan>((plan) => {
      const currentVersion = number(plan, 'current_version');
      const versions = rows(plan.study_plan_versions)
        .filter(
          (version) =>
            !currentOnly || number(version, 'version') === currentVersion,
        )
        .sort((a, b) => number(b, 'version') - number(a, 'version'));
      return versions.map((version) => ({
        planId: text(plan, 'id'),
        versionId: text(version, 'id'),
        version: number(version, 'version'),
        objective: text(plan, 'objective'),
        algorithmVersion: text(plan, 'algorithm_version'),
        periodStart: text(version, 'period_start'),
        periodEnd: text(version, 'period_end'),
        generatedAt: text(version, 'generated_at'),
        totalPlannedMinutes: number(version, 'total_planned_minutes'),
        totalAvailableMinutes: number(version, 'total_available_minutes'),
        triggerReason: text(version, 'trigger_reason'),
        items: rows(version.study_plan_items)
          .map(mapItem)
          .sort(
            (a, b) =>
              (a.plannedDate ?? '9999').localeCompare(
                b.plannedDate ?? '9999',
              ) ||
              (a.position ?? 999) - (b.position ?? 999) ||
              b.priority - a.priority,
          ),
      }));
    });
  };

  return {
    async context() {
      const [availabilityRows, profileRows, targetRows, actionRows] =
        await Promise.all([
          request(
            'student_availability?select=weekday,minutes_available&order=weekday.asc',
          ),
          request('student_profiles?select=preferred_session_minutes&limit=1'),
          request(
            'student_target_exams?select=exam_edition_id,exam_editions(application_date,exam_program_id)&order=created_at.asc&limit=1',
          ),
          request(
            'study_plan_item_actions?select=id,action,occurred_at,study_plan_items(competency_id)&order=occurred_at.asc,id.asc&limit=1000',
          ),
        ]);
      const targetRow = rows(targetRows)[0];
      let targetExam: TargetExam | null = null;
      if (targetRow) {
        const edition = object(targetRow.exam_editions);
        const programId = text(edition, 'exam_program_id');
        const links = rows(
          await request(
            `question_version_programs?select=question_versions(question_version_competencies(competency_id))&exam_program_id=eq.${programId}&limit=1000`,
          ),
        );
        targetExam = {
          id: text(targetRow, 'exam_edition_id'),
          applicationDate:
            edition.application_date === null
              ? null
              : text(edition, 'application_date'),
          relevantCompetencyIds: [
            ...new Set(
              links.flatMap((link) =>
                rows(
                  object(link.question_versions).question_version_competencies,
                ).map((item) => text(item, 'competency_id')),
              ),
            ),
          ].sort(),
        };
      }
      const history = new Map<
        string,
        { deferredCount: number; completedCount: number; skippedCount: number }
      >();
      for (const row of rows(actionRows)) {
        const competencyId = text(
          object(row.study_plan_items),
          'competency_id',
        );
        const counts = history.get(competencyId) ?? {
          deferredCount: 0,
          completedCount: 0,
          skippedCount: 0,
        };
        const action = text(row, 'action');
        if (action === 'deferred') counts.deferredCount += 1;
        if (action === 'completed') counts.completedCount += 1;
        if (action === 'skipped') counts.skippedCount += 1;
        history.set(competencyId, counts);
      }
      return {
        availability: rows(availabilityRows).map((row) => ({
          weekday: number(row, 'weekday'),
          minutesAvailable: number(row, 'minutes_available'),
        })),
        preferredSessionMinutes:
          number(rows(profileRows)[0] ?? {}, 'preferred_session_minutes') || 30,
        targetExam,
        history: [...history].map(([competencyId, counts]) => ({
          competencyId,
          ...counts,
        })),
        executionRevision: rows(actionRows)
          .map(
            (row) =>
              `${text(row, 'id')}:${text(row, 'action')}:${text(row, 'occurred_at')}`,
          )
          .join('|'),
      };
    },
    async persist(input) {
      return String(
        await rpc('persist_study_plan', {
          p_objective: input.objective,
          p_target_exam_edition_id: input.targetExamId,
          p_period_start: input.periodStart,
          p_period_end: input.periodEnd,
          p_total_available_minutes: input.totalAvailableMinutes,
          p_availability_snapshot: input.availabilitySnapshot,
          p_input_snapshot: input.inputSnapshot,
          p_input_hash: input.inputHash,
          p_trigger_reason: input.triggerReason,
          p_items: input.items.map((item) => ({
            competencyId: item.competencyId,
            itemType: item.itemType,
            priority: item.priority,
            estimatedMinutes: item.estimatedMinutes,
            plannedDate: item.plannedDate,
            position: item.position,
            status: item.status,
            origin: item.origin,
            justification: item.justification,
            sourceSnapshot: item.sourceSnapshot,
            replanCount: item.replanCount,
          })),
        }),
      );
    },
    async current() {
      return (await getPlans(true))[0] ?? null;
    },
    async history() {
      return getPlans(false);
    },
    async item(id) {
      const itemRows = rows(
        await request(
          `study_plan_items?select=id,competency_id,item_type,priority,estimated_minutes,planned_date,position,status,recommendation_origin,justification,replan_count,competencies(code,name)&id=eq.${id}&limit=1`,
        ),
      );
      return itemRows[0] ? mapItem(itemRows[0]) : null;
    },
    async action(id, action, actualMinutes, reason) {
      return String(
        await rpc('record_study_plan_item_action', {
          p_item_id: id,
          p_action: action,
          p_actual_minutes: actualMinutes,
          p_reason: reason,
        }),
      );
    },
  };
}
