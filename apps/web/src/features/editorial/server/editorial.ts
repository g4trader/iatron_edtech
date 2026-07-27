import {
  appRoleSchema,
  learningContentVersionSchema,
  medicalSpecialtyDashboardSchema,
  medicalSpecialtySummarySchema,
  mentorReviewHistorySchema,
  type LearningContentVersion,
} from '@iatron/contracts';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const baseUrl = () =>
  `${(process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8080/v1').replace(/\/$/, '')}`;

async function request(path: string, init?: RequestInit) {
  const client = await createClient();
  const { data } = await client.auth.getSession();
  if (!data.session) throw new Error('Sessão editorial indisponível.');
  return fetch(`${baseUrl()}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${data.session.access_token}`,
      'content-type': 'application/json',
      'x-request-id': crypto.randomUUID(),
      ...init?.headers,
    },
    cache: 'no-store',
  });
}

async function versions(path: string) {
  const response = await request(path);
  if (!response.ok)
    throw new Error(`Conteúdo indisponível (${response.status}).`);
  return z.array(learningContentVersionSchema).parse(await response.json());
}

export const editorial = {
  async roles() {
    const response = await request('/editorial/me/roles');
    if (!response.ok) return [];
    return z.array(appRoleSchema).parse(await response.json());
  },
  studentContents: () => versions('/learning-content'),
  reviewQueue: () => versions('/review/contents'),
  async specialties() {
    const response = await request('/review/specialties');
    if (!response.ok)
      throw new Error('Suas especialidades estão indisponíveis agora.');
    return z.array(medicalSpecialtySummarySchema).parse(await response.json());
  },
  async specialty(id: string) {
    const response = await request(`/review/specialties/${id}`);
    if (response.status === 404) return null;
    if (!response.ok)
      throw new Error('Esta especialidade está indisponível agora.');
    return medicalSpecialtyDashboardSchema.parse(await response.json());
  },
  adminContents: () => versions('/admin/editorial/contents'),
  async version(id: string): Promise<LearningContentVersion | null> {
    const response = await request(`/learning-content/versions/${id}`);
    if (response.status === 404) return null;
    if (!response.ok) throw new Error('Versão do material indisponível.');
    return learningContentVersionSchema.parse(await response.json());
  },
  async reviewVersion(id: string) {
    const response = await request(`/review/contents/${id}`);
    if (!response.ok) throw new Error('Material de revisão indisponível.');
    return learningContentVersionSchema.parse(await response.json());
  },
  async previousReviewVersion(id: string) {
    const response = await request(`/review/contents/${id}/previous`);
    if (!response.ok) throw new Error('Comparação de versões indisponível.');
    const body: unknown = await response.json();
    return body === null ? null : learningContentVersionSchema.parse(body);
  },
  async reviewHistory(page = 1, pageSize = 20) {
    const response = await request(
      `/review/history?page=${page}&pageSize=${pageSize}`,
    );
    if (!response.ok) throw new Error('Histórico de revisões indisponível.');
    return mentorReviewHistorySchema.parse(await response.json());
  },
  async mutate(path: string, body: Record<string, unknown>) {
    const response = await request(path, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    if (!response.ok)
      throw new Error(`Ação editorial recusada (${response.status}).`);
    return z.object({ id: z.uuid() }).parse(await response.json()).id;
  },
};
