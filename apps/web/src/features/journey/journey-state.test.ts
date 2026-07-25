import type { AssessmentSummary, StudyPlan } from '@iatron/contracts';
import { describe, expect, it } from 'vitest';
import { resolveJourneyState } from './journey-state';

const assessment = (
  id: string,
  status: 'active' | 'completed',
  startedAt: string,
): AssessmentSummary => ({
  id,
  objective: 'Diagnóstico',
  status,
  algorithmVersion: 'assessment-v2',
  durationMinutes: 30,
  questionCount: 10,
  answeredCount: status === 'completed' ? 10 : 2,
  startedAt,
  completedAt: status === 'completed' ? startedAt : null,
  mode: 'quick_screening',
  policyVersion: 'diagnostic-policy-v3-quick-synthetic',
  blueprintVersion: null,
  currentBlock: 1,
  pausedAt: null,
});

const plan = (withActivity: boolean): StudyPlan => ({
  planId: '10000000-0000-4000-8000-000000000001',
  versionId: '10000000-0000-4000-8000-000000000002',
  version: 1,
  objective: 'Plano',
  algorithmVersion: 'plan-v1',
  periodStart: '2026-07-25',
  periodEnd: '2026-07-31',
  generatedAt: '2026-07-25T12:00:00Z',
  totalPlannedMinutes: withActivity ? 30 : 0,
  totalAvailableMinutes: 300,
  triggerReason: 'assessment_completed',
  items: withActivity
    ? [
        {
          id: '10000000-0000-4000-8000-000000000003',
          competencyId: '10000000-0000-4000-8000-000000000004',
          competencyCode: 'COMP.001',
          competencyName: 'Reconhecer choque séptico',
          itemType: 'competency_study',
          priority: 0.9,
          estimatedMinutes: 30,
          plannedDate: '2026-07-25',
          position: 1,
          status: 'planned',
          origin: 'diagnostic',
          reasons: [{ code: 'critical_gap', contribution: 0.9, detail: 'Gap' }],
          replanCount: 0,
        },
      ]
    : [],
});

describe('resolveJourneyState', () => {
  it('marca Banca concluída pela prova persistida, mesmo sem perfil estatístico', () => {
    const state = resolveJourneyState({
      hasTargetExam: true,
      assessments: [],
      currentPlan: null,
    });
    expect(state.steps.find(({ label }) => label === 'Banca')?.status).toBe(
      'complete',
    );
    expect(state.targetExamState).toBe('selected');
    expect(state.completedSteps).toContain('Banca');
  });

  it('mantém Banca atual enquanto não há prova-alvo', () => {
    const state = resolveJourneyState({
      hasTargetExam: false,
      assessments: [],
      currentPlan: null,
    });
    expect(state.steps.find(({ label }) => label === 'Banca')?.status).toBe(
      'current',
    );
  });

  it('continua somente um diagnóstico realmente em andamento', () => {
    const state = resolveJourneyState({
      hasTargetExam: true,
      assessments: [
        assessment(
          '10000000-0000-4000-8000-000000000005',
          'active',
          '2026-07-25T12:00:00Z',
        ),
      ],
      currentPlan: null,
    });
    expect(state.mission.title).toBe('Continuar seu diagnóstico');
    expect(state.assessmentState).toBe('in_progress');
    expect(
      state.steps.find(({ label }) => label === 'Diagnóstico')?.status,
    ).toBe('current');
  });

  it('não deixa sessão antiga aberta prevalecer sobre conclusão mais recente', () => {
    const state = resolveJourneyState({
      hasTargetExam: true,
      assessments: [
        assessment(
          '10000000-0000-4000-8000-000000000005',
          'active',
          '2026-07-24T12:00:00Z',
        ),
        assessment(
          '10000000-0000-4000-8000-000000000006',
          'completed',
          '2026-07-25T12:00:00Z',
        ),
      ],
      currentPlan: null,
    });
    expect(state.mission.title).toBe('Transformar seu diagnóstico em um plano');
    expect(state.activeAssessment).toBeNull();
    expect(
      state.steps.find(({ label }) => label === 'Diagnóstico')?.status,
    ).toBe('complete');
    expect(state.assessmentState).toBe('completed');
  });

  it('mostra atividade real quando o diagnóstico tem plano disponível', () => {
    const state = resolveJourneyState({
      hasTargetExam: true,
      assessments: [
        assessment(
          '10000000-0000-4000-8000-000000000006',
          'completed',
          '2026-07-25T12:00:00Z',
        ),
      ],
      currentPlan: plan(true),
    });
    expect(state.mission.title).toBe('Reconhecer choque séptico');
    expect(state.mission.href).toBe('/app/plan/today');
    expect(state.planState).toBe('available');
  });

  it('produz no máximo uma etapa atual e nunca reabre diagnóstico concluído', () => {
    const state = resolveJourneyState({
      hasTargetExam: true,
      assessments: [
        assessment(
          '10000000-0000-4000-8000-000000000006',
          'completed',
          '2026-07-25T12:00:00Z',
        ),
      ],
      currentPlan: plan(false),
    });
    expect(
      state.steps.filter(({ status }) => status === 'current'),
    ).toHaveLength(1);
    expect(state.mission.title).not.toMatch(/continuar.*diagnóstico/i);
  });
});
