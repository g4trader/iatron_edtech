import {
  generateStudyPlanInputSchema,
  studyPlanItemActionSchema,
} from '@iatron/contracts';
import type { FastifyInstance, FastifyRequest } from 'fastify';
import type { LearningRepository } from './learning-repository.js';
import type { StudyPlanRepository } from './study-plan-repository.js';
import { generateStudyPlan } from './study-plan-service.js';

const itemId = (request: FastifyRequest) =>
  (request.params as { id: string }).id;

export async function registerStudyPlanRoutes(
  app: FastifyInstance,
  planFactory: (token: string) => StudyPlanRepository,
  learningFactory: (token: string) => LearningRepository,
  clock: () => Date = () => new Date(),
) {
  const dependencies = (request: FastifyRequest) => ({
    plans: planFactory(request.auth.accessToken),
    learning: learningFactory(request.auth.accessToken),
    clock,
  });
  app.post(
    '/plans/generate',
    { schema: { tags: ['study-plans'] } },
    async (request, reply) =>
      reply
        .status(201)
        .send(
          await generateStudyPlan(
            generateStudyPlanInputSchema.parse(request.body ?? {}),
            dependencies(request),
          ),
        ),
  );
  app.post(
    '/plans/recalculate',
    { schema: { tags: ['study-plans'] } },
    async (request) =>
      generateStudyPlan(
        generateStudyPlanInputSchema.parse(request.body ?? {}),
        dependencies(request),
      ),
  );
  app.get(
    '/plans/current',
    { schema: { tags: ['study-plans'] } },
    async (request, reply) =>
      (await planFactory(request.auth.accessToken).current()) ??
      reply.status(404).send(),
  );
  app.get(
    '/plans/today',
    { schema: { tags: ['study-plans'] } },
    async (request, reply) => {
      const plan = await planFactory(request.auth.accessToken).current();
      if (!plan) return reply.status(404).send();
      const today = clock().toISOString().slice(0, 10);
      return {
        ...plan,
        items: plan.items.filter((item) => item.plannedDate === today),
      };
    },
  );
  app.get(
    '/plans/week',
    { schema: { tags: ['study-plans'] } },
    async (request, reply) =>
      (await planFactory(request.auth.accessToken).current()) ??
      reply.status(404).send(),
  );
  app.get(
    '/plans/history',
    { schema: { tags: ['study-plans'] } },
    async (request) => planFactory(request.auth.accessToken).history(),
  );
  app.get(
    '/plans/unallocated',
    { schema: { tags: ['study-plans'] } },
    async (request, reply) => {
      const plan = await planFactory(request.auth.accessToken).current();
      return plan
        ? {
            ...plan,
            items: plan.items.filter((item) => item.status === 'unallocated'),
          }
        : reply.status(404).send();
    },
  );
  app.get(
    '/plans/items/:id',
    { schema: { tags: ['study-plans'] } },
    async (request, reply) =>
      (await planFactory(request.auth.accessToken).item(itemId(request))) ??
      reply.status(404).send(),
  );
  app.get(
    '/plans/items/:id/justifications',
    { schema: { tags: ['study-plans'] } },
    async (request, reply) => {
      const item = await planFactory(request.auth.accessToken).item(
        itemId(request),
      );
      return item ? item.reasons : reply.status(404).send();
    },
  );

  for (const action of ['start', 'complete', 'defer', 'skip'] as const) {
    app.post(
      `/plans/items/:id/${action}`,
      { schema: { tags: ['study-plans'] } },
      async (request, reply) => {
        const body = studyPlanItemActionSchema.parse(request.body ?? {});
        const plans = planFactory(request.auth.accessToken);
        const actionName =
          action === 'start'
            ? 'started'
            : action === 'complete'
              ? 'completed'
              : action === 'defer'
                ? 'deferred'
                : 'skipped';
        const actionId = await plans.action(
          itemId(request),
          actionName,
          body.actualMinutes,
          body.reason,
        );
        if (action === 'start') return reply.status(201).send({ actionId });
        const triggerReason =
          action === 'complete'
            ? 'item_completed'
            : action === 'defer'
              ? 'item_deferred'
              : 'item_skipped';
        const plan = await generateStudyPlan(
          generateStudyPlanInputSchema.parse({
            triggerReason,
            objective: 'Plano adaptativo de 7 dias',
          }),
          { plans, learning: learningFactory(request.auth.accessToken), clock },
        );
        return reply.status(201).send({ actionId, plan });
      },
    );
  }
}
