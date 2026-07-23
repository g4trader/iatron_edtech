import { studyPlanItemSchema, studyPlanSchema } from '@iatron/contracts';
import { z } from 'zod';
import { isAuthBypassEnabled } from '@/lib/auth-bypass';
import { createClient } from '@/lib/supabase/server';

const baseUrl = () =>
  `${(process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8080/v1').replace(/\/$/, '')}/plans`;

async function request(path: string, init?: RequestInit) {
  const client = await createClient();
  const { data } = await client.auth.getSession();
  if (!data.session && isAuthBypassEnabled(process.env)) {
    return new Response(path === '/history' ? '[]' : null, {
      status: path === '/history' ? 200 : 404,
      headers: { 'content-type': 'application/json' },
    });
  }
  if (!data.session) throw new Error('Sessão de plano indisponível.');
  return fetch(`${baseUrl()}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${data.session.access_token}`,
      'content-type': 'application/json',
      ...init?.headers,
    },
    cache: 'no-store',
  });
}

async function plan(path: string) {
  const response = await request(path);
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`Plano indisponível (${response.status}).`);
  return studyPlanSchema.parse(await response.json());
}

export const studyPlans = {
  current: () => plan('/current'),
  today: () => plan('/today'),
  week: () => plan('/week'),
  unallocated: () => plan('/unallocated'),
  async history() {
    const response = await request('/history');
    if (!response.ok) throw new Error('Histórico de planos indisponível.');
    return z.array(studyPlanSchema).parse(await response.json());
  },
  async item(id: string) {
    const response = await request(`/items/${id}`);
    if (!response.ok) throw new Error('Item do plano indisponível.');
    return studyPlanItemSchema.parse(await response.json());
  },
  async generate(triggerReason = 'manual') {
    const response = await request('/generate', {
      method: 'POST',
      body: JSON.stringify({
        objective: 'Plano adaptativo de 7 dias',
        horizonDays: 7,
        triggerReason,
      }),
    });
    if (!response.ok) throw new Error('Não foi possível gerar o plano.');
    return studyPlanSchema.parse(await response.json());
  },
  async action(
    id: string,
    action: 'start' | 'complete' | 'defer' | 'skip',
    body: { actualMinutes: number | null; reason: string | null },
  ) {
    const response = await request(`/items/${id}/${action}`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
    if (!response.ok)
      throw new Error(`Não foi possível executar ${action} no item.`);
  },
};
