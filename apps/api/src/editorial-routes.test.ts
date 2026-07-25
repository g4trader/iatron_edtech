import { beforeEach, describe, expect, it } from 'vitest';
import { buildApp } from './app.js';
import type { EditorialRepository } from './editorial-repository.js';
import { readEnvironment } from './config/environment.js';
import type { AppRole, LearningContentVersion } from '@iatron/contracts';

const versionId = '10000000-0000-4000-8000-000000000001';
const contentId = '10000000-0000-4000-8000-000000000002';
const mentorId = '10000000-0000-4000-8000-000000000003';
let roles: AppRole[] = ['student'];
let decision: Record<string, unknown> | null = null;

const material: LearningContentVersion = {
  id: versionId,
  contentId,
  canonicalKey: 'demo.sepsis',
  slug: 'ressuscitacao-choque-septico',
  versionNumber: 1,
  schemaVersion: 1,
  language: 'pt-BR',
  title: 'Ressuscitação inicial do choque séptico',
  subtitle: null,
  estimatedMinutes: 20,
  objectives: ['Reconhecer prioridades iniciais'],
  summary: 'Material sintético para validar o fluxo editorial.',
  sections: [{ heading: 'Primeiros passos', body: 'Conteúdo demonstrativo.' }],
  keyPoints: [],
  clinicalReasoning: null,
  examApplication: null,
  commonMistakes: [],
  quickReview: [],
  conclusion: null,
  video: null,
  editorialStatus: 'awaiting_mentor_review',
  aiAssisted: true,
  aiModel: 'gpt-5.6-sol',
  promptVersion: 'editorial-mvp-v1',
  isSynthetic: true,
  contentHash: 'a'.repeat(64),
  publishedAt: null,
  reviewedAt: null,
  specialtyId: null,
  competencyId: null,
  assignedMentorId: mentorId,
  mentorName: 'Mentor E2E',
  mentorSpecialty: 'Clínica Médica',
  reviewId: null,
  reviewDecision: null,
  reviewRequested: false,
  requestCount: 0,
  references: [],
};

const repository: EditorialRepository = {
  roles: async () => roles,
  list: async () => [material],
  get: async () => material,
  createDraft: async () => versionId,
  createVersion: async () => versionId,
  submit: async () => contentId,
  review: async (_id, input) => {
    decision = input;
    return '10000000-0000-4000-8000-000000000004';
  },
  publish: async () => contentId,
  requestPriority: async () => '10000000-0000-4000-8000-000000000005',
  audit: async () => [],
  notifications: async () => [],
  emailEvents: async () => [],
  reviewAssignmentEmail: async () => ({
    recipientId: mentorId,
    recipientEmail: 'mentor@example.test',
    mentorName: 'Mentor E2E',
    contentId,
    versionId,
    title: material.title,
    versionNumber: 1,
    estimatedMinutes: 20,
    requestCount: 0,
    idempotencyKey: `review-assignment:${versionId}`,
  }),
  recordEmailEvent: async () => crypto.randomUUID(),
};

const app = () =>
  buildApp({
    environment: readEnvironment(),
    logger: false,
    tokenVerifier: async () => ({
      sub: '10000000-0000-4000-8000-000000000099',
    }),
    editorialRepositoryFactory: () => repository,
    editorialEmailGateway: {
      sendReviewAssignment: async () => ({ providerId: 'email-e2e' }),
    },
  });

describe('editorial routes', () => {
  beforeEach(() => {
    roles = ['student'];
    decision = null;
  });

  it('allows students to read published content but rejects admin access', async () => {
    const server = await app();
    expect(
      (
        await server.inject({
          url: '/v1/learning-content',
          headers: { authorization: 'Bearer test' },
        })
      ).statusCode,
    ).toBe(200);
    expect(
      (
        await server.inject({
          url: '/v1/admin/editorial/contents',
          headers: { authorization: 'Bearer test' },
        })
      ).statusCode,
    ).toBe(403);
    await server.close();
  });

  it('keeps mentor and admin permissions separate', async () => {
    roles = ['mentor'];
    const server = await app();
    expect(
      (
        await server.inject({
          url: '/v1/review/contents',
          headers: { authorization: 'Bearer test' },
        })
      ).statusCode,
    ).toBe(200);
    expect(
      (
        await server.inject({
          url: `/v1/admin/editorial/contents/${versionId}/publish`,
          method: 'POST',
          headers: { authorization: 'Bearer test' },
        })
      ).statusCode,
    ).toBe(403);
    await server.close();
  });

  it('requires the mentor declaration before approval', async () => {
    roles = ['mentor'];
    const server = await app();
    const invalid = await server.inject({
      url: `/v1/review/contents/${versionId}/decision`,
      method: 'POST',
      headers: { authorization: 'Bearer test' },
      payload: {
        decision: 'approved',
        declaration: 'Confirmo.',
        requestId: crypto.randomUUID(),
      },
    });
    expect(invalid.statusCode, invalid.body).toBe(400);
    const valid = await server.inject({
      url: `/v1/review/contents/${versionId}/decision`,
      method: 'POST',
      headers: { authorization: 'Bearer test' },
      payload: {
        decision: 'approved',
        declaration:
          'Confirmo que revisei esta versão para fins educacionais dentro da minha área de atuação.',
        requestId: crypto.randomUUID(),
      },
    });
    expect(valid.statusCode).toBe(201);
    expect(decision?.decision).toBe('approved');
    await server.close();
  });

  it('consolidates a student priority request through the repository contract', async () => {
    const server = await app();
    const response = await server.inject({
      url: `/v1/learning-content/versions/${versionId}/review-priority`,
      method: 'POST',
      headers: {
        authorization: 'Bearer test',
        'x-request-id': crypto.randomUUID(),
      },
    });
    expect(response.statusCode).toBe(201);
    await server.close();
  });
});
