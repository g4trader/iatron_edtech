import {
  assignMedicalSpecialtyOwnerSchema,
  createLearningContentDraftSchema,
  reviewLearningContentSchema,
  setMedicalSpecialtyOwnerStatusSchema,
  type AppRole,
} from '@iatron/contracts';
import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { safeUserIdentifier } from './auth.js';
import type { EditorialRepository } from './editorial-repository.js';
import type { EditorialEmailGateway } from './editorial-email.js';

const uuid = z.uuid();
const requestId = (request: FastifyRequest) =>
  String(request.headers['x-request-id'] ?? request.id);
const versionId = (request: FastifyRequest) =>
  uuid.parse((request.params as { versionId: string }).versionId);
const contentId = (request: FastifyRequest) =>
  uuid.parse((request.params as { contentId: string }).contentId);

async function requireRole(
  request: FastifyRequest,
  reply: FastifyReply,
  repository: EditorialRepository,
  allowed: AppRole[],
) {
  const roles = await repository.roles();
  if (!roles.some((role) => allowed.includes(role) || role === 'super_admin')) {
    await reply.status(403).send({
      error: {
        code: 'EDITORIAL_FORBIDDEN',
        message: 'Você não possui permissão para esta área.',
        requestId: request.id,
      },
    });
    return null;
  }
  return roles;
}

export async function registerEditorialRoutes(
  app: FastifyInstance,
  factory: (token: string) => EditorialRepository,
  emailGateway: EditorialEmailGateway,
) {
  const repository = (request: FastifyRequest) =>
    factory(request.auth.accessToken);

  app.get('/editorial/me/roles', async (request) =>
    repository(request).roles(),
  );
  app.get('/learning-content', async (request) =>
    repository(request).list('student'),
  );
  app.get(
    '/learning-content/versions/:versionId',
    async (request, reply) =>
      (await repository(request).get(versionId(request))) ??
      reply.status(404).send(),
  );
  app.post(
    '/learning-content/versions/:versionId/review-priority',
    async (request, reply) => {
      const id = versionId(request);
      const priorityRequestId = await repository(request).requestPriority(
        id,
        requestId(request),
      );
      request.log.info(
        {
          event: 'editorial_journey',
          actor: safeUserIdentifier(request.auth.userId),
          role: 'student',
          versionId: id,
          action: 'review_priority_requested',
          status: 'completed',
        },
        'editorial_action_completed',
      );
      return reply.status(201).send({ id: priorityRequestId });
    },
  );

  app.get('/review/contents', async (request, reply) => {
    const repo = repository(request);
    if (!(await requireRole(request, reply, repo, ['mentor']))) return;
    return repo.list('review');
  });
  app.get('/review/contents/:versionId', async (request, reply) => {
    const repo = repository(request);
    if (!(await requireRole(request, reply, repo, ['mentor']))) return;
    return (await repo.get(versionId(request))) ?? reply.status(404).send();
  });
  app.get('/review/contents/:versionId/previous', async (request, reply) => {
    const repo = repository(request);
    if (!(await requireRole(request, reply, repo, ['mentor']))) return;
    const current = await repo.get(versionId(request));
    if (!current) return reply.status(404).send();
    return repo.previousVersion(current.contentId, current.versionNumber);
  });
  app.get('/review/history', async (request, reply) => {
    const repo = repository(request);
    if (!(await requireRole(request, reply, repo, ['mentor']))) return;
    const query = z
      .object({
        page: z.coerce.number().int().positive().default(1),
        pageSize: z.coerce.number().int().min(1).max(50).default(20),
      })
      .parse(request.query);
    return repo.reviewHistory(query.page, query.pageSize);
  });
  app.get('/review/specialties', async (request, reply) => {
    const repo = repository(request);
    if (!(await requireRole(request, reply, repo, ['mentor']))) return;
    return repo.specialties(request.auth.userId);
  });
  app.get('/review/specialties/:specialtyId', async (request, reply) => {
    const repo = repository(request);
    if (!(await requireRole(request, reply, repo, ['mentor']))) return;
    const specialtyId = uuid.parse(
      (request.params as { specialtyId: string }).specialtyId,
    );
    return (
      (await repo.specialty(request.auth.userId, specialtyId)) ??
      reply.status(404).send()
    );
  });
  app.post('/review/contents/:versionId/decision', async (request, reply) => {
    const repo = repository(request);
    if (!(await requireRole(request, reply, repo, ['mentor']))) return;
    const id = versionId(request);
    const input = reviewLearningContentSchema.parse(request.body);
    const reviewId = await repo.review(id, input);
    request.log.info(
      {
        event: 'editorial_journey',
        actor: safeUserIdentifier(request.auth.userId),
        role: 'mentor',
        versionId: id,
        reviewId,
        action: input.decision,
        status: 'completed',
      },
      'editorial_action_completed',
    );
    return reply.status(201).send({ id: reviewId });
  });

  app.get('/admin/editorial/contents', async (request, reply) => {
    const repo = repository(request);
    if (!(await requireRole(request, reply, repo, ['editor', 'admin']))) return;
    return repo.list('admin');
  });
  app.post('/admin/editorial/contents', async (request, reply) => {
    const repo = repository(request);
    if (!(await requireRole(request, reply, repo, ['editor', 'admin']))) return;
    const input = createLearningContentDraftSchema.parse(request.body);
    const id = await repo.createDraft(input);
    return reply.status(201).send({ id });
  });
  app.post(
    '/admin/editorial/contents/:versionId/assign-review',
    async (request, reply) => {
      const repo = repository(request);
      if (!(await requireRole(request, reply, repo, ['editor', 'admin'])))
        return;
      const body = z.object({ mentorId: uuid }).parse(request.body);
      const id = await repo.submit(
        versionId(request),
        body.mentorId,
        requestId(request),
      );
      const payload = await repo.reviewAssignmentEmail(versionId(request));
      try {
        const sent = await emailGateway.sendReviewAssignment(payload);
        await repo.recordEmailEvent(
          payload.idempotencyKey,
          'sent',
          sent.providerId,
          null,
        );
        return reply.status(201).send({ id, email: 'sent' });
      } catch (error) {
        const code =
          error instanceof Error ? error.message.slice(0, 80) : 'EMAIL_FAILED';
        await repo.recordEmailEvent(
          payload.idempotencyKey,
          'failed',
          null,
          code,
        );
        request.log.error(
          {
            event: 'editorial_email_failed',
            contentId: id,
            versionId: versionId(request),
            actor: safeUserIdentifier(request.auth.userId),
            errorCode: code,
          },
          'editorial_email_failed',
        );
        return reply.status(201).send({ id, email: 'failed' });
      }
    },
  );
  app.post(
    '/admin/editorial/contents/:contentId/versions',
    async (request, reply) => {
      const repo = repository(request);
      if (!(await requireRole(request, reply, repo, ['editor', 'admin'])))
        return;
      const body = z
        .object({
          sourceVersionId: uuid,
          title: z.string().min(3),
          summary: z.string().min(20),
          sections: z.array(
            z.object({ heading: z.string(), body: z.string() }),
          ),
          requestId: uuid,
        })
        .parse(request.body);
      const id = await repo.createVersion({
        contentId: contentId(request),
        ...body,
      });
      return reply.status(201).send({ id });
    },
  );
  app.post(
    '/admin/editorial/contents/:versionId/publish',
    async (request, reply) => {
      const repo = repository(request);
      if (!(await requireRole(request, reply, repo, ['admin']))) return;
      const id = await repo.publish(versionId(request), requestId(request));
      request.log.info(
        {
          event: 'editorial_journey',
          actor: safeUserIdentifier(request.auth.userId),
          role: 'admin',
          versionId: versionId(request),
          publishEventId: request.id,
          action: 'published',
          status: 'completed',
        },
        'editorial_action_completed',
      );
      return reply.status(201).send({ id });
    },
  );
  app.get(
    '/admin/editorial/contents/:contentId/audit',
    async (request, reply) => {
      const repo = repository(request);
      if (!(await requireRole(request, reply, repo, ['admin']))) return;
      return repo.audit(contentId(request));
    },
  );
  app.get(
    '/admin/editorial/contents/:contentId/email-events',
    async (request, reply) => {
      const repo = repository(request);
      if (!(await requireRole(request, reply, repo, ['editor', 'admin'])))
        return;
      return repo.emailEvents(contentId(request));
    },
  );
  app.get('/editorial/notifications', async (request) =>
    repository(request).notifications(),
  );
  app.get('/editorial/specialties', async (request, reply) => {
    const repo = repository(request);
    if (!(await requireRole(request, reply, repo, ['editor', 'admin']))) return;
    return repo.managedSpecialties();
  });
  app.get('/admin/specialties', async (request, reply) => {
    const repo = repository(request);
    if (!(await requireRole(request, reply, repo, ['admin']))) return;
    return repo.managedSpecialties();
  });
  app.get(
    '/admin/specialties/:specialtyId/ownership-history',
    async (request, reply) => {
      const repo = repository(request);
      if (!(await requireRole(request, reply, repo, ['admin']))) return;
      const specialtyId = uuid.parse(
        (request.params as { specialtyId: string }).specialtyId,
      );
      return repo.ownershipHistory(specialtyId);
    },
  );
  app.post(
    '/editorial/specialties/:specialtyId/owners',
    async (request, reply) => {
      const repo = repository(request);
      if (!(await requireRole(request, reply, repo, ['admin']))) return;
      const specialtyId = uuid.parse(
        (request.params as { specialtyId: string }).specialtyId,
      );
      const input = assignMedicalSpecialtyOwnerSchema.parse(request.body);
      const id = await repo.assignSpecialtyOwner(specialtyId, input);
      request.log.info(
        {
          event: 'specialty_owner_assigned',
          actor: safeUserIdentifier(request.auth.userId),
          specialtyId,
          mentorId: input.mentorId,
          requestId: input.requestId,
        },
        'editorial_action_completed',
      );
      return reply.status(201).send({ id, status: 'recorded' });
    },
  );
  app.post(
    '/admin/specialty-owners/:ownershipId/status',
    async (request, reply) => {
      const repo = repository(request);
      if (!(await requireRole(request, reply, repo, ['admin']))) return;
      const ownershipId = uuid.parse(
        (request.params as { ownershipId: string }).ownershipId,
      );
      const input = setMedicalSpecialtyOwnerStatusSchema.parse(request.body);
      const id = await repo.setSpecialtyOwnerStatus(ownershipId, input);
      request.log.info(
        {
          event: 'specialty_owner_status_changed',
          actor: safeUserIdentifier(request.auth.userId),
          ownershipId,
          status: input.status,
          requestId: input.requestId,
        },
        'admin_action_completed',
      );
      return reply.status(201).send({ id, status: 'recorded' });
    },
  );
}
