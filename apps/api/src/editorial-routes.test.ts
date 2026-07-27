import { beforeEach, describe, expect, it } from 'vitest';
import { buildApp } from './app.js';
import type { EditorialRepository } from './editorial-repository.js';
import { readEnvironment } from './config/environment.js';
import type {
  AppRole,
  LearningContentVersion,
  MedicalSpecialtyDashboard,
} from '@iatron/contracts';

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
  specialtyName: 'Clínica Médica',
  themeName: 'Emergências',
  competencyName: 'Reconhecer instabilidade',
  editorName: 'Editor E2E',
  provenance: {},
  reviewId: null,
  reviewDecision: null,
  reviewRequested: false,
  requestCount: 0,
  references: [],
};
const specialty: MedicalSpecialtyDashboard = {
  id: '10000000-0000-4000-8000-000000000010',
  code: 'CLINICA_MEDICA',
  name: 'Clínica Médica',
  description: 'Conhecimento científico de Clínica Médica.',
  ownershipStatus: 'active',
  owners: [
    {
      id: '10000000-0000-4000-8000-000000000011',
      mentorId,
      professionalName: 'Mentor E2E',
      ownerRole: 'primary',
      status: 'active',
      scope: 'scientific_and_operational',
      reason: 'Autorização de teste',
      startsAt: new Date().toISOString(),
      endsAt: null,
      unavailableUntil: null,
    },
  ],
  areas: ['Emergências'],
  contents: { total: 1, pending: 1 },
  questions: 10,
  competencies: 4,
  references: { total: 2, pending: 1 },
  videos: 1,
  blueprints: 1,
  lastScientificUpdateAt: new Date().toISOString(),
  contentStatus: [{ status: 'awaiting_mentor_review', count: 1 }],
  recentReviews: [],
  competencyNames: ['Reconhecer instabilidade'],
  referenceNames: ['Diretriz demonstrativa'],
  blueprintVersions: ['1'],
  coverage: [],
  gaps: [],
  limitations: ['Cobertura científica ainda não estimada.'],
};

const repository: EditorialRepository = {
  roles: async () => roles,
  list: async () => [material],
  get: async () => material,
  previousVersion: async () => null,
  reviewHistory: async (page, pageSize) => ({
    items: [],
    page,
    pageSize,
    total: 0,
  }),
  specialties: async () => [specialty],
  specialty: async (_mentor, id) => (id === specialty.id ? specialty : null),
  managedSpecialties: async () => [specialty],
  libraryOverview: async () => ({
    publishedContents: 1,
    contentsInReview: 1,
    publishedQuestions: 1,
    diagnosticEligibleQuestions: 1,
    verifiedReferences: 1,
    pendingReferences: 1,
    activeBlueprints: 1,
    coveredCompetencies: 1,
    uncoveredCompetencies: 1,
    possibleDuplicates: 0,
    outdatedItems: 0,
    priorityGaps: 1,
  }),
  library: async (query) => ({
    items: [],
    page: query.page,
    pageSize: query.pageSize,
    total: 0,
  }),
  resolveDuplicate: async () => versionId,
  ownershipHistory: async () => [],
  assignSpecialtyOwner: async (id) => id,
  setSpecialtyOwnerStatus: async (id) => id,
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

  it('provides dedicated mentor history and version comparison data', async () => {
    roles = ['mentor'];
    const server = await app();
    const previous = await server.inject({
      method: 'GET',
      url: `/v1/review/contents/${versionId}/previous`,
      headers: { authorization: 'Bearer test-token' },
    });
    expect(previous.statusCode).toBe(200);
    expect(previous.json()).toBeNull();

    const history = await server.inject({
      method: 'GET',
      url: '/v1/review/history?page=1&pageSize=20',
      headers: { authorization: 'Bearer test-token' },
    });
    expect(history.statusCode).toBe(200);
    expect(history.json()).toMatchObject({ page: 1, pageSize: 20, total: 0 });
    await server.close();
  });

  it('exposes only the mentor specialty workspace through authenticated ownership', async () => {
    roles = ['mentor'];
    const server = await app();
    const list = await server.inject({
      url: '/v1/review/specialties',
      headers: { authorization: 'Bearer test-token' },
    });
    expect(list.statusCode).toBe(200);
    expect(list.json()[0]).toMatchObject({
      name: 'Clínica Médica',
      questions: 10,
    });
    const detail = await server.inject({
      url: `/v1/review/specialties/${specialty.id}`,
      headers: { authorization: 'Bearer test-token' },
    });
    expect(detail.statusCode).toBe(200);
    expect(detail.json().owners[0].professionalName).toBe('Mentor E2E');
    await server.close();
  });

  it('prevents editorial staff from assigning scientific ownership', async () => {
    roles = ['editor'];
    const server = await app();
    const response = await server.inject({
      method: 'POST',
      url: `/v1/editorial/specialties/${specialty.id}/owners`,
      headers: { authorization: 'Bearer test-token' },
      payload: {
        mentorId,
        ownerRole: 'primary',
        authorizationReference: 'authorization:test-record',
        requestId: crypto.randomUUID(),
      },
    });
    expect(response.statusCode).toBe(403);
    await server.close();
  });

  it('allows an admin to assign and inspect auditable ownership', async () => {
    roles = ['admin'];
    const server = await app();
    const response = await server.inject({
      method: 'POST',
      url: `/v1/editorial/specialties/${specialty.id}/owners`,
      headers: { authorization: 'Bearer test-token' },
      payload: {
        mentorId,
        ownerRole: 'primary',
        authorizationReference: 'authorization:test-record',
        requestId: crypto.randomUUID(),
      },
    });
    expect(response.statusCode).toBe(201);
    expect(response.json()).toEqual({
      id: specialty.id,
      status: 'recorded',
    });
    const list = await server.inject({
      url: '/v1/admin/specialties',
      headers: { authorization: 'Bearer test-token' },
    });
    expect(list.statusCode).toBe(200);
    await server.close();
  });

  it('isolates the knowledge library by workspace role', async () => {
    roles = ['mentor'];
    const mentorServer = await app();
    const mentor = await mentorServer.inject({
      url: '/v1/review/library?kind=contents&page=1&pageSize=20',
      headers: { authorization: 'Bearer test-token' },
    });
    expect(mentor.statusCode).toBe(200);
    expect(mentor.json()).toMatchObject({ page: 1, pageSize: 20 });
    const mentorEditorial = await mentorServer.inject({
      url: '/v1/editorial/library/overview',
      headers: { authorization: 'Bearer test-token' },
    });
    expect(mentorEditorial.statusCode).toBe(403);
    await mentorServer.close();

    roles = ['editor'];
    const editorialServer = await app();
    const editorial = await editorialServer.inject({
      url: '/v1/editorial/library/overview',
      headers: { authorization: 'Bearer test-token' },
    });
    expect(editorial.statusCode).toBe(200);
    const admin = await editorialServer.inject({
      url: '/v1/admin/library/overview',
      headers: { authorization: 'Bearer test-token' },
    });
    expect(admin.statusCode).toBe(403);
    await editorialServer.close();
  });
});
