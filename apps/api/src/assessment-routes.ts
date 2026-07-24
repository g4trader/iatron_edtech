import {
  answerAssessmentInputSchema,
  startAssessmentInputSchema,
} from '@iatron/contracts';
import type { FastifyInstance, FastifyRequest } from 'fastify';
import {
  DIAGNOSTIC_POLICY_V2,
  evaluateDiagnosticStop,
  selectNextQuestion,
} from './assessment-engine.js';
import type { AssessmentRepository } from './assessment-repository.js';
import type { ExamIntelligenceRepository } from './exam-intelligence-repository.js';
import { selectActiveExamProfile } from './exam-intelligence-service.js';
import type { LearningRepository } from './learning-repository.js';

const params = (request: FastifyRequest) =>
  (request.params as { id: string }).id;

export async function registerAssessmentRoutes(
  app: FastifyInstance,
  assessmentFactory: (token: string) => AssessmentRepository,
  learningFactory: (token: string) => LearningRepository,
  examIntelligenceFactory: (token: string) => ExamIntelligenceRepository,
) {
  const repositories = (request: FastifyRequest) => ({
    assessment: assessmentFactory(request.auth.accessToken),
    learning: learningFactory(request.auth.accessToken),
  });
  app.post(
    '/assessments',
    { schema: { tags: ['assessments'] } },
    async (request, reply) => {
      const input = startAssessmentInputSchema.parse(request.body);
      const repository = assessmentFactory(request.auth.accessToken);
      const competencyIds = await repository.targetCompetencies(input);
      const id = await repository.start(input, competencyIds);
      return reply.status(201).send({ id });
    },
  );
  app.get(
    '/assessments',
    { schema: { tags: ['assessments'] } },
    async (request) =>
      assessmentFactory(request.auth.accessToken).listHistory(),
  );
  app.get(
    '/assessments/:id/next',
    { schema: { tags: ['assessments'] } },
    async (request, reply) => {
      const id = params(request);
      const { assessment, learning } = repositories(request);
      const state = await assessment.getAssessment(id);
      if (!state || state.status !== 'active')
        return reply.status(404).send({
          error: {
            code: 'ACTIVE_ASSESSMENT_NOT_FOUND',
            message: 'Avaliação ativa não encontrada.',
            requestId: request.id,
          },
        });
      if (state.answeredCount >= state.questionCount)
        return reply.status(204).send();
      const [candidates, mastery, attempted, pending, observations] =
        await Promise.all([
          assessment.listCandidates(),
          learning.listCurrentMastery(),
          assessment.attempted(id),
          assessment.pendingSelection(id),
          assessment.observations(id),
        ]);
      const examRepository = examIntelligenceFactory(request.auth.accessToken);
      const [targetExam, profiles] = await Promise.all([
        examRepository.getTargetExam(),
        examRepository.listProfiles(),
      ]);
      const activeProfile = targetExam
        ? selectActiveExamProfile(profiles, targetExam.programId, new Date())
        : null;
      const blueprint = activeProfile
        ? await examRepository.getBlueprint(activeProfile.id)
        : null;
      const examWeights = new Map(
        blueprint?.areas.map((area) => [area.id, area.expectedProportion]) ??
          [],
      );
      const candidatesWithExamContext = candidates.map((candidate) => ({
        ...candidate,
        examRelevance: Math.max(
          0,
          ...candidate.areaIds.map((areaId) => examWeights.get(areaId) ?? 0),
        ),
      }));
      if (pending) {
        const question = candidatesWithExamContext.find(
          (item) => item.questionVersionId === pending.questionVersionId,
        );
        if (!question)
          return reply.status(409).send({
            error: {
              code: 'ASSESSMENT_QUESTION_UNAVAILABLE',
              message: 'A questão selecionada não está mais disponível.',
              requestId: request.id,
            },
          });
        return {
          assessmentId: id,
          questionVersionId: question.questionVersionId,
          number: pending.selectionOrder,
          total: state.questionCount,
          stem: question.stem,
          difficulty: question.difficulty,
          options: question.options,
          competencies: question.competencies,
          selectionReason: pending.reason,
        };
      }
      const stopping = evaluateDiagnosticStop({
        observations,
        policy: {
          ...DIAGNOSTIC_POLICY_V2,
          maximumQuestions: Math.min(
            state.questionCount,
            DIAGNOSTIC_POLICY_V2.maximumQuestions,
          ),
          maximumDurationMinutes: Math.min(
            state.durationMinutes,
            DIAGNOSTIC_POLICY_V2.maximumDurationMinutes,
          ),
        },
      });
      if (stopping.shouldStop) return reply.status(204).send();
      const selection = selectNextQuestion({
        candidates: candidatesWithExamContext,
        mastery,
        attemptedQuestionIds: attempted.questionIds,
        usedThemeIds: attempted.themeIds,
        observations,
        policy: DIAGNOSTIC_POLICY_V2,
      });
      if (!selection) return reply.status(204).send();
      await assessment.recordSelection(
        id,
        selection.candidate.questionVersionId,
        attempted.questionIds.length + 1,
        {
          score: selection.score,
          reason: selection.reason,
          algorithmVersion: 'assessment-v2',
          policyVersion: DIAGNOSTIC_POLICY_V2.version,
        },
      );
      const question = candidatesWithExamContext.find(
        (item) =>
          item.questionVersionId === selection.candidate.questionVersionId,
      )!;
      return {
        assessmentId: id,
        questionVersionId: question.questionVersionId,
        number: attempted.questionIds.length + 1,
        total: state.questionCount,
        stem: question.stem,
        difficulty: question.difficulty,
        options: question.options,
        competencies: question.competencies,
        selectionReason: selection.reason,
      };
    },
  );
  app.post(
    '/assessments/:id/answers',
    { schema: { tags: ['assessments'] } },
    async (request, reply) => {
      const attemptId = await assessmentFactory(
        request.auth.accessToken,
      ).answer(
        params(request),
        answerAssessmentInputSchema.parse(request.body),
      );
      return reply.status(201).send({ attemptId });
    },
  );
  app.post(
    '/assessments/:id/finish',
    { schema: { tags: ['assessments'] } },
    async (request, reply) => {
      const repository = assessmentFactory(request.auth.accessToken);
      const state = await repository.getAssessment(params(request));
      if (!state || state.status !== 'active')
        return reply.status(404).send({
          error: {
            code: 'ACTIVE_ASSESSMENT_NOT_FOUND',
            message: 'Avaliação ativa não encontrada.',
            requestId: request.id,
          },
        });
      const observations = await repository.observations(params(request));
      const stopping = evaluateDiagnosticStop({
        observations,
        policy: {
          ...DIAGNOSTIC_POLICY_V2,
          maximumQuestions: Math.min(
            state.questionCount,
            DIAGNOSTIC_POLICY_V2.maximumQuestions,
          ),
          maximumDurationMinutes: Math.min(
            state.durationMinutes,
            DIAGNOSTIC_POLICY_V2.maximumDurationMinutes,
          ),
        },
        contentAvailable:
          state.answeredCount >= state.questionCount ? false : undefined,
      });
      if (!stopping.shouldStop)
        return reply.status(409).send({
          error: {
            code: 'ASSESSMENT_INCOMPLETE',
            message:
              'Continue o diagnóstico para completar a cobertura mínima necessária.',
            requestId: request.id,
          },
        });
      return {
        resultId: await repository.finish(params(request), {
          reason: stopping.reason ?? 'insufficient_evidence',
          evidenceSufficient: stopping.evidenceSufficient,
        }),
      };
    },
  );
  app.get(
    '/assessments/:id/result',
    { schema: { tags: ['assessments'] } },
    async (request, reply) =>
      (await assessmentFactory(request.auth.accessToken).result(
        params(request),
      )) ??
      reply.status(404).send({
        error: {
          code: 'RESULT_NOT_FOUND',
          message: 'Resultado não encontrado.',
          requestId: request.id,
        },
      }),
  );
  app.get(
    '/assessments/:id/confidence',
    { schema: { tags: ['assessments'] } },
    async (request, reply) => {
      const result = await assessmentFactory(request.auth.accessToken).result(
        params(request),
      );
      return result
        ? {
            overallConfidence: result.overallConfidence,
            competencies: result.competencies.map(
              ({
                competencyId,
                competencyCode,
                competencyName,
                confidence,
                confidenceLevel,
              }) => ({
                competencyId,
                competencyCode,
                competencyName,
                confidence,
                confidenceLevel,
              }),
            ),
          }
        : reply.status(404).send();
    },
  );
  app.get(
    '/assessments/:id/coverage',
    { schema: { tags: ['assessments'] } },
    async (request, reply) => {
      const result = await assessmentFactory(request.auth.accessToken).result(
        params(request),
      );
      return result
        ? {
            diagnosticCoverage: result.diagnosticCoverage,
            measured: result.competencies.filter(
              (item) => item.evidenceCount > 0,
            ).length,
            total: result.competencies.length,
          }
        : reply.status(404).send();
    },
  );
  app.get(
    '/assessments/:id/competencies',
    { schema: { tags: ['assessments'] } },
    async (request, reply) => {
      const result = await assessmentFactory(request.auth.accessToken).result(
        params(request),
      );
      return result?.competencies ?? reply.status(404).send();
    },
  );
}
