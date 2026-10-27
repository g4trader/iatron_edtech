import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { FastifyInstance } from 'fastify';
import { buildApp } from './app.js';
import { readEnvironment } from './config/environment.js';
import type { AssessmentRepository } from './assessment-repository.js';
import type { LearningRepository } from './learning-repository.js';
import type { ExamIntelligenceRepository } from './exam-intelligence-repository.js';
import type { StudentRepository } from './student-repository.js';

const id = '70000000-0000-4000-8000-000000000001';
const questionId = '71000000-0000-4000-8000-000000000001';
const competencyId = '54000000-0000-4000-8000-000000000001';
let answeredCount = 0;
const summary = () => ({
  id,
  objective: 'Diagnóstico inicial',
  status: 'active',
  algorithmVersion: 'assessment-v1',
  durationMinutes: 30,
  questionCount: 1,
  answeredCount,
  startedAt: '2026-07-23T00:00:00Z',
  completedAt: null,
  mode: 'quick_screening' as const,
  policyVersion: 'diagnostic-policy-v3-quick-synthetic',
  blueprintVersion: null,
  currentBlock: 1,
  pausedAt: null,
});
const result = {
  id: '72000000-0000-4000-8000-000000000001',
  assessmentId: id,
  correctCount: 1,
  answeredCount: 1,
  overallConfidence: 0.4,
  diagnosticCoverage: 1,
  algorithmVersion: 'assessment-v1',
  createdAt: '2026-07-23T00:10:00Z',
  completionReason: 'question_budget_reached' as const,
  evidenceSufficient: false,
  areas: [],
  competencies: [
    {
      competencyId,
      competencyCode: 'CARD.1',
      competencyName: 'Competência',
      mastery: 1,
      confidence: 0.4,
      evidenceCount: 2,
      confidenceLevel: 'medium' as const,
      classification: 'strong' as const,
    },
  ],
};
const assessment: AssessmentRepository = {
  targetCompetencies: async () => [competencyId],
  start: async () => id,
  getAssessment: async () => summary(),
  listHistory: async () => [summary()],
  listCandidates: async () => [
    {
      questionVersionId: questionId,
      stem: 'Pergunta?',
      difficulty: 2,
      themeIds: ['theme'],
      areaIds: ['50000000-0000-4000-8000-000000000001'],
      competencyIds: [competencyId],
      competencies: [{ id: competencyId, code: 'CARD.1', name: 'Competência' }],
      options: [
        {
          id: '73000000-0000-4000-8000-000000000001',
          label: 'A',
          content: 'Resposta A',
        },
        {
          id: '73000000-0000-4000-8000-000000000002',
          label: 'B',
          content: 'Resposta B',
        },
      ],
    },
  ],
  attempted: async () => ({ questionIds: [], themeIds: [] }),
  observations: async () =>
    answeredCount
      ? [
          {
            questionVersionId: questionId,
            areaIds: ['50000000-0000-4000-8000-000000000001'],
            competencyIds: [competencyId],
            difficulty: 2,
            isCorrect: true,
            statedConfidence: 'certain',
            responseTimeMs: 10000,
            evidenceSignal: 'evidence_of_consolidation',
          },
        ]
      : [],
  pendingSelection: async () => null,
  recordSelection: async () => undefined,
  answer: async () => {
    answeredCount = 1;
    return '74000000-0000-4000-8000-000000000001';
  },
  pause: async () => undefined,
  resume: async () => undefined,
  finish: async () => result.id,
  result: async () => result,
};
const learning: LearningRepository = {
  listCompetencies: async () => [],
  listEvidence: async () => [],
  listCurrentMastery: async () => [],
  listTimeline: async () => [],
};
const examIntelligence: ExamIntelligenceRepository = {
  listProfiles: async () => [],
  getProfile: async () => null,
  getBlueprint: async () => null,
  listStatistics: async () => [],
  getTargetExam: async () => null,
};
let app: FastifyInstance | undefined;
beforeEach(() => {
  answeredCount = 0;
});
afterEach(async () => {
  await app?.close();
  app = undefined;
});
const build = (repository: AssessmentRepository = assessment) =>
  buildApp({
    environment: readEnvironment({ NODE_ENV: 'test', ENABLE_API_DOCS: '1' }),
    logger: false,
    tokenVerifier: async () => ({ sub: 'user' }),
    repositoryFactory: () => ({}) as StudentRepository,
    assessmentRepositoryFactory: () => repository,
    learningRepositoryFactory: () => learning,
    examIntelligenceRepositoryFactory: () => examIntelligence,
  });
describe('assessment API', () => {
  it('requires authentication', async () => {
    app = await build();
    expect(
      (
        await app.inject({
          method: 'POST',
          url: '/v1/assessments',
          payload: { objective: 'Diagnóstico' },
        })
      ).statusCode,
    ).toBe(401);
  });
  it('runs start, next, answer, finish and result flow', async () => {
    app = await build();
    const auth = { authorization: 'Bearer token' };
    expect(
      (
        await app.inject({
          method: 'POST',
          url: '/v1/assessments',
          headers: auth,
          payload: {
            objective: 'Diagnóstico inicial',
            questionCount: 1,
            durationMinutes: 30,
          },
        })
      ).statusCode,
    ).toBe(201);
    expect(
      (
        await app.inject({
          method: 'GET',
          url: `/v1/assessments/${id}/next`,
          headers: auth,
        })
      ).json(),
    ).toHaveProperty('selectionReason');
    expect(
      (
        await app.inject({
          method: 'POST',
          url: `/v1/assessments/${id}/answers`,
          headers: auth,
          payload: {
            questionVersionId: questionId,
            selectedOptionId: '73000000-0000-4000-8000-000000000001',
            responseTimeMs: 10000,
            statedConfidence: 'certain',
          },
        })
      ).statusCode,
    ).toBe(201);
    expect(
      (
        await app.inject({
          method: 'POST',
          url: `/v1/assessments/${id}/finish`,
          headers: auth,
        })
      ).statusCode,
    ).toBe(200);
    expect(
      (
        await app.inject({
          method: 'GET',
          url: `/v1/assessments/${id}/result`,
          headers: auth,
        })
      ).json().diagnosticCoverage,
    ).toBe(1);
  });
  it('resumes a selected unanswered question without selecting another', async () => {
    const repository = {
      ...assessment,
      pendingSelection: async () => ({
        questionVersionId: questionId,
        selectionOrder: 1,
        reason: 'competência ainda não medida',
      }),
      recordSelection: async () => {
        throw new Error('must not select another question');
      },
    };
    app = await build(repository);
    const response = await app.inject({
      method: 'GET',
      url: `/v1/assessments/${id}/next`,
      headers: { authorization: 'Bearer token' },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      questionVersionId: questionId,
      number: 1,
      selectionReason: 'competência ainda não medida',
    });
  });
  it('refuses to finish an incomplete assessment', async () => {
    answeredCount = 1;
    const repository = {
      ...assessment,
      getAssessment: async () => ({
        ...summary(),
        questionCount: 10,
        answeredCount: 2,
      }),
      finish: async () => {
        throw new Error('must not finish');
      },
    };
    app = await build(repository);
    const response = await app.inject({
      method: 'POST',
      url: `/v1/assessments/${id}/finish`,
      headers: { authorization: 'Bearer token' },
    });
    expect(response.statusCode).toBe(409);
    expect(response.json()).toMatchObject({
      error: { code: 'ASSESSMENT_INCOMPLETE' },
    });
  });
  it('finishes with insufficient evidence when the same selector used by next exhausts content', async () => {
    answeredCount = 1;
    const finish = vi.fn().mockResolvedValue(result.id);
    app = await build({
      ...assessment,
      getAssessment: async () => ({ ...summary(), questionCount: 10 }),
      attempted: async () => ({
        questionIds: [questionId],
        themeIds: ['theme'],
      }),
      finish,
    });
    const next = await app.inject({
      method: 'GET',
      url: `/v1/assessments/${id}/next`,
      headers: { authorization: 'Bearer token' },
    });
    expect(next.statusCode).toBe(204);
    const response = await app.inject({
      method: 'POST',
      url: `/v1/assessments/${id}/finish`,
      headers: { authorization: 'Bearer token' },
    });
    expect(response.statusCode).toBe(200);
    expect(finish).toHaveBeenCalledWith(id, {
      reason: 'content_exhausted',
      evidenceSufficient: false,
    });
  });
  it('does not classify a pending unanswered selection as exhausted content', async () => {
    answeredCount = 1;
    const finish = vi.fn();
    app = await build({
      ...assessment,
      getAssessment: async () => ({ ...summary(), questionCount: 10 }),
      listCandidates: async () => [],
      pendingSelection: async () => ({
        questionVersionId: questionId,
        selectionOrder: 2,
        reason: 'pending',
      }),
      finish,
    });
    const response = await app.inject({
      method: 'POST',
      url: `/v1/assessments/${id}/finish`,
      headers: { authorization: 'Bearer token' },
    });
    expect(response.statusCode).toBe(409);
    expect(finish).not.toHaveBeenCalled();
  });
  it('propagates content lookup failure without finishing or inventing exhaustion', async () => {
    answeredCount = 1;
    const finish = vi.fn();
    app = await build({
      ...assessment,
      getAssessment: async () => ({ ...summary(), questionCount: 10 }),
      listCandidates: async () => {
        throw new Error('catalog unavailable');
      },
      finish,
    });
    const response = await app.inject({
      method: 'POST',
      url: `/v1/assessments/${id}/finish`,
      headers: { authorization: 'Bearer token' },
    });
    expect(response.statusCode).toBeGreaterThanOrEqual(500);
    expect(finish).not.toHaveBeenCalled();
  });
  it('rejects zero answers even when no content is available', async () => {
    const finish = vi.fn();
    app = await build({
      ...assessment,
      listCandidates: async () => [],
      finish,
    });
    const response = await app.inject({
      method: 'POST',
      url: `/v1/assessments/${id}/finish`,
      headers: { authorization: 'Bearer token' },
    });
    expect(response.statusCode).toBe(409);
    expect(response.json()).toMatchObject({
      error: { code: 'ASSESSMENT_NO_EVIDENCE' },
    });
    expect(finish).not.toHaveBeenCalled();
  });
  it.each(['confidence', 'coverage', 'competencies'])(
    'serves %s inspection',
    async (path) => {
      app = await build();
      expect(
        (
          await app.inject({
            method: 'GET',
            url: `/v1/assessments/${id}/${path}`,
            headers: { authorization: 'Bearer token' },
          })
        ).statusCode,
      ).toBe(200);
    },
  );
});
