import type {
  AssessmentResult,
  AssessmentSummary,
  StartAssessmentInput,
} from '@iatron/contracts';
import type { ApiEnvironment } from './config/environment.js';
import { RepositoryError } from './student-repository.js';
import type {
  AssessmentCandidate,
  DeclaredSafety,
  DiagnosticEvidenceSignal,
} from './assessment-engine.js';

type Row = Record<string, unknown>;
const object = (value: unknown): Row =>
  typeof value === 'object' && value !== null ? (value as Row) : {};
const rows = (value: unknown): Row[] =>
  Array.isArray(value) ? value.map(object) : [];
const text = (row: Row, key: string) => String(row[key] ?? '');
const number = (row: Row, key: string) => Number(row[key]);

export interface CandidateQuestion extends AssessmentCandidate {
  stem: string;
  options: Array<{ id: string; label: string; content: string }>;
  competencies: Array<{ id: string; code: string; name: string }>;
}

export interface AssessmentObservation {
  questionVersionId: string;
  areaIds: string[];
  competencyIds: string[];
  difficulty: number;
  isCorrect: boolean;
  statedConfidence: DeclaredSafety;
  responseTimeMs: number;
  evidenceSignal: DiagnosticEvidenceSignal | null;
}

export interface AssessmentRepository {
  targetCompetencies(input: StartAssessmentInput): Promise<string[]>;
  start(input: StartAssessmentInput, competencyIds: string[]): Promise<string>;
  getAssessment(id: string): Promise<AssessmentSummary | null>;
  listHistory(): Promise<AssessmentSummary[]>;
  listCandidates(): Promise<CandidateQuestion[]>;
  attempted(id: string): Promise<{ questionIds: string[]; themeIds: string[] }>;
  observations(id: string): Promise<AssessmentObservation[]>;
  pendingSelection(id: string): Promise<{
    questionVersionId: string;
    selectionOrder: number;
    reason: string;
  } | null>;
  recordSelection(
    assessmentId: string,
    questionId: string,
    order: number,
    rationale: object,
  ): Promise<void>;
  answer(
    assessmentId: string,
    input: {
      questionVersionId: string;
      selectedOptionId: string;
      responseTimeMs: number;
      statedConfidence?: string;
    },
  ): Promise<string>;
  finish(
    id: string,
    outcome?: { reason: string; evidenceSufficient: boolean },
  ): Promise<string>;
  result(id: string): Promise<AssessmentResult | null>;
}

export function createAssessmentRepository(
  environment: ApiEnvironment,
  token: string,
): AssessmentRepository {
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
        `Assessment repository failed with ${response.status}`,
        'ASSESSMENT_REPOSITORY_ERROR',
      );
    const body = await response.text();
    return body ? (JSON.parse(body) as unknown) : null;
  };
  const get = (path: string) => request(path);
  const rpc = (name: string, body: object) =>
    request(`rpc/${name}`, { method: 'POST', body: JSON.stringify(body) });
  const summary = (row: Row): AssessmentSummary => ({
    id: text(row, 'id'),
    objective: text(row, 'objective'),
    status: text(row, 'status'),
    algorithmVersion: text(row, 'algorithm_version'),
    durationMinutes: number(row, 'duration_minutes'),
    questionCount: number(row, 'question_count'),
    answeredCount: rows(row.question_attempts).length,
    startedAt: text(row, 'started_at'),
    completedAt: row.completed_at === null ? null : text(row, 'completed_at'),
  });
  return {
    async targetCompetencies() {
      const parameters = new URLSearchParams({
        select: 'id',
        order: 'code.asc',
        limit: '1000',
      });
      const result = rows(await get(`competencies?${parameters}`));
      return result.map((row) => text(row, 'id'));
    },
    async start(input, competencyIds) {
      return String(
        await rpc('start_diagnostic_assessment', {
          p_objective: input.objective,
          p_exam_program_id: input.examProgramId,
          p_specialty_id: input.specialtyId,
          p_duration_minutes: input.durationMinutes,
          p_question_count: input.questionCount,
          p_competency_ids: competencyIds,
        }),
      );
    },
    async getAssessment(id) {
      const result = rows(
        await get(
          `diagnostic_assessments?select=*,question_attempts(id)&id=eq.${id}&limit=1`,
        ),
      );
      return result[0] ? summary(result[0]) : null;
    },
    async listHistory() {
      return rows(
        await get(
          'diagnostic_assessments?select=*,question_attempts(id)&order=started_at.desc&limit=100',
        ),
      ).map(summary);
    },
    async listCandidates() {
      const result = rows(
        await get(
          'question_versions?select=id,stem,difficulty,question_options(id,label,content),question_version_competencies(competencies(id,code,name)),question_version_themes(theme_id),question_version_specialties(specialty_id)&status=eq.published&order=id.asc&limit=1000',
        ),
      );
      return result
        .map((row) => {
          const competencies = rows(row.question_version_competencies)
            .map((link) => object(link.competencies))
            .map((competency) => ({
              id: text(competency, 'id'),
              code: text(competency, 'code'),
              name: text(competency, 'name'),
            }));
          return {
            questionVersionId: text(row, 'id'),
            stem: text(row, 'stem'),
            difficulty: number(row, 'difficulty') || 3,
            options: rows(row.question_options)
              .map((option) => ({
                id: text(option, 'id'),
                label: text(option, 'label'),
                content: text(option, 'content'),
              }))
              .sort((a, b) => a.label.localeCompare(b.label)),
            competencies,
            competencyIds: competencies.map((item) => item.id),
            themeIds: rows(row.question_version_themes).map((theme) =>
              text(theme, 'theme_id'),
            ),
            areaIds: rows(row.question_version_specialties).map((specialty) =>
              text(specialty, 'specialty_id'),
            ),
          };
        })
        .filter(
          (candidate) =>
            candidate.competencies.length > 0 && candidate.options.length >= 2,
        );
    },
    async attempted(id) {
      const [attemptRows, selectionRows] = await Promise.all([
        get(
          `question_attempts?select=question_version_id&assessment_id=eq.${id}&order=answered_at.asc`,
        ),
        get(
          `assessment_question_selections?select=question_versions(question_version_themes(theme_id))&assessment_id=eq.${id}&order=selection_order.asc`,
        ),
      ]);
      return {
        questionIds: rows(attemptRows).map((row) =>
          text(row, 'question_version_id'),
        ),
        themeIds: rows(selectionRows).flatMap((row) =>
          rows(object(row.question_versions).question_version_themes).map(
            (theme) => text(theme, 'theme_id'),
          ),
        ),
      };
    },
    async observations(id) {
      const result = rows(
        await get(
          `question_attempts?select=question_version_id,is_correct,response_time_ms,stated_confidence,evidence_signal,question_versions(difficulty,question_version_competencies(competency_id),question_version_specialties(specialty_id))&assessment_id=eq.${id}&order=answered_at.asc`,
        ),
      );
      return result.map((row) => {
        const question = object(row.question_versions);
        return {
          questionVersionId: text(row, 'question_version_id'),
          areaIds: rows(question.question_version_specialties).map(
            (specialty) => text(specialty, 'specialty_id'),
          ),
          competencyIds: rows(question.question_version_competencies).map(
            (competency) => text(competency, 'competency_id'),
          ),
          difficulty: number(question, 'difficulty') || 3,
          isCorrect: Boolean(row.is_correct),
          statedConfidence:
            row.stated_confidence === null
              ? null
              : (text(row, 'stated_confidence') as DeclaredSafety),
          responseTimeMs: number(row, 'response_time_ms'),
          evidenceSignal:
            row.evidence_signal === null
              ? null
              : (text(row, 'evidence_signal') as DiagnosticEvidenceSignal),
        };
      });
    },
    async pendingSelection(id) {
      const [selectionRows, attemptRows] = await Promise.all([
        get(
          `assessment_question_selections?select=question_version_id,selection_order,rationale&assessment_id=eq.${id}&order=selection_order.desc&limit=1`,
        ),
        get(
          `question_attempts?select=question_version_id&assessment_id=eq.${id}`,
        ),
      ]);
      const selection = rows(selectionRows)[0];
      if (!selection) return null;
      const questionVersionId = text(selection, 'question_version_id');
      const answered = rows(attemptRows).some(
        (attempt) => text(attempt, 'question_version_id') === questionVersionId,
      );
      if (answered) return null;
      return {
        questionVersionId,
        selectionOrder: number(selection, 'selection_order'),
        reason:
          text(object(selection.rationale), 'reason') ||
          'continuidade da questão já selecionada',
      };
    },
    async recordSelection(assessmentId, questionId, order, rationale) {
      await rpc('select_assessment_question', {
        p_assessment_id: assessmentId,
        p_question_version_id: questionId,
        p_selection_order: order,
        p_rationale: rationale,
      });
    },
    async answer(assessmentId, input) {
      return String(
        await rpc('answer_diagnostic_question', {
          p_assessment_id: assessmentId,
          p_question_version_id: input.questionVersionId,
          p_selected_option_id: input.selectedOptionId,
          p_response_time_ms: input.responseTimeMs,
          p_stated_confidence: input.statedConfidence ?? null,
        }),
      );
    },
    async finish(id, outcome) {
      return String(
        await rpc(
          outcome
            ? 'finish_diagnostic_assessment_v2'
            : 'finish_diagnostic_assessment',
          outcome
            ? {
                p_assessment_id: id,
                p_completion_reason: outcome.reason,
                p_evidence_sufficient: outcome.evidenceSufficient,
              }
            : { p_assessment_id: id },
        ),
      );
    },
    async result(id) {
      const resultRows = rows(
        await get(
          `assessment_results?select=*,assessment_result_competencies(*,competencies(code,name)),assessment_result_areas(*,specialties(name))&assessment_id=eq.${id}&limit=1`,
        ),
      );
      const row = resultRows[0];
      if (!row) return null;
      return {
        id: text(row, 'id'),
        assessmentId: text(row, 'assessment_id'),
        correctCount: number(row, 'correct_count'),
        answeredCount: number(row, 'answered_count'),
        overallConfidence: number(row, 'overall_confidence'),
        diagnosticCoverage: number(row, 'diagnostic_coverage'),
        algorithmVersion: text(row, 'algorithm_version'),
        createdAt: text(row, 'created_at'),
        completionReason:
          row.completion_reason === null
            ? null
            : (text(
                row,
                'completion_reason',
              ) as AssessmentResult['completionReason']),
        evidenceSufficient: Boolean(row.evidence_sufficient),
        areas: rows(row.assessment_result_areas).map((item) => ({
          areaId: text(item, 'area_id'),
          areaName: text(object(item.specialties), 'name'),
          observedLevel: text(
            item,
            'observed_level',
          ) as AssessmentResult['areas'][number]['observedLevel'],
          evidenceCount: number(item, 'evidence_count'),
          evidenceQuality: text(
            item,
            'evidence_quality',
          ) as AssessmentResult['areas'][number]['evidenceQuality'],
          calibratedSafety: text(
            item,
            'calibrated_safety',
          ) as AssessmentResult['areas'][number]['calibratedSafety'],
          strengths: Array.isArray(item.strengths)
            ? item.strengths.map(String)
            : [],
          weaknesses: Array.isArray(item.weaknesses)
            ? item.weaknesses.map(String)
            : [],
          uncertainties: Array.isArray(item.uncertainties)
            ? item.uncertainties.map(String)
            : [],
          targetExamInfluence: text(item, 'target_exam_influence'),
          recommendedNextStep: text(item, 'recommended_next_step'),
        })),
        competencies: rows(row.assessment_result_competencies).map((item) => {
          const competency = object(item.competencies);
          return {
            competencyId: text(item, 'competency_id'),
            competencyCode: text(competency, 'code'),
            competencyName: text(competency, 'name'),
            mastery: number(item, 'mastery'),
            confidence: number(item, 'confidence'),
            evidenceCount: number(item, 'evidence_count'),
            confidenceLevel: text(item, 'confidence_level') as
              | 'low'
              | 'medium'
              | 'high',
            classification: text(item, 'classification') as
              | 'strong'
              | 'weak'
              | 'unmeasured'
              | 'developing',
          };
        }),
      };
    },
  };
}
