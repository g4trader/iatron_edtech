import {
  adminOperationsSchema,
  adminMentorListSchema,
  adminMentorSummarySchema,
  adminMutationResultSchema,
  adminOverviewSchema,
  adminStudentDetailSchema,
  adminStudentListSchema,
  adminUserListSchema,
  apiErrorSchema,
  releaseMetaSchema,
  medicalSpecialtyDashboardSchema,
  medicalSpecialtyOwnershipHistorySchema,
} from '@iatron/contracts';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const baseUrl = () =>
  `${(process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8080/v1').replace(/\/$/, '')}`;

async function request(path: string, init?: RequestInit) {
  const client = await createClient();
  const { data } = await client.auth.getSession();
  if (!data.session) throw new Error('Sessão administrativa indisponível.');
  const correlationId = crypto.randomUUID();
  const response = await fetch(`${baseUrl()}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${data.session.access_token}`,
      'content-type': 'application/json',
      'x-request-id': correlationId,
      'x-frontend-sha': process.env.VERCEL_GIT_COMMIT_SHA ?? 'local',
      ...init?.headers,
    },
    cache: 'no-store',
  });
  if (!response.ok) {
    const body = apiErrorSchema.safeParse(
      await response.json().catch(() => null),
    );
    const supportCode = body.success
      ? body.data.error.requestId
      : (response.headers.get('x-request-id') ?? correlationId);
    throw new Error(
      response.status === 403
        ? 'Você não possui permissão para esta operação.'
        : `Não foi possível concluir esta ação. Código de suporte: ${supportCode.slice(0, 12)}.`,
    );
  }
  return response;
}

const auditSchema = z.array(
  z.object({
    id: z.uuid(),
    actor_id: z.uuid(),
    action: z.string(),
    resource_id: z.uuid(),
    previous_state: z.string().nullable(),
    next_state: z.string().nullable(),
    created_at: z.iso.datetime({ offset: true }),
    request_id: z.string(),
  }),
);

export const admin = {
  async overview() {
    return adminOverviewSchema.parse(
      await (await request('/admin/overview')).json(),
    );
  },
  async operations() {
    return adminOperationsSchema.parse(
      await (await request('/admin/operations')).json(),
    );
  },
  async meta() {
    return releaseMetaSchema.parse(await (await request('/meta')).json());
  },
  async students(query = '') {
    return adminStudentListSchema.parse(
      await (await request(`/admin/students${query}`)).json(),
    );
  },
  async student(id: string) {
    return adminStudentDetailSchema.parse(
      await (await request(`/admin/students/${id}`)).json(),
    );
  },
  async mentors() {
    return adminMentorListSchema.parse(
      await (await request('/admin/mentors')).json(),
    );
  },
  async specialties() {
    return z
      .array(medicalSpecialtyDashboardSchema)
      .parse(await (await request('/admin/specialties')).json());
  },
  async specialtyOwnershipHistory(id: string) {
    return z
      .array(medicalSpecialtyOwnershipHistorySchema)
      .parse(
        await (
          await request(`/admin/specialties/${id}/ownership-history`)
        ).json(),
      );
  },
  async mentor(id: string) {
    return adminMentorSummarySchema.parse(
      await (await request(`/admin/mentors/${id}`)).json(),
    );
  },
  async users() {
    return adminUserListSchema.parse(
      await (await request('/admin/users')).json(),
    );
  },
  async audit() {
    return auditSchema.parse(await (await request('/admin/audit')).json());
  },
  async mutate(path: string, body: Record<string, unknown> = {}) {
    return adminMutationResultSchema.parse(
      await (
        await request(path, { method: 'POST', body: JSON.stringify(body) })
      ).json(),
    );
  },
};
