import 'server-only';
import type { TutorConversation, TutorMessage, TutorMode, TutorOriginType } from '@iatron/contracts';
import { createClient } from '@/lib/supabase/server';

const baseUrl = () =>
  `${(process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8080/v1').replace(/\/$/, '')}/tutor`;

async function request(path: string, init?: RequestInit) {
  const client = await createClient();
  const { data } = await client.auth.getSession();
  if (!data.session) throw new Error('Sessão indisponível.');
  const response = await fetch(`${baseUrl()}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${data.session.access_token}`,
      'content-type': 'application/json',
      ...init?.headers,
    },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('Não foi possível acessar o tutor.');
  return response.status === 204 ? null : response.json() as Promise<unknown>;
}

export async function listTutorConversations() {
  return await request('/conversations') as TutorConversation[];
}
export async function getTutorConversation(id: string) {
  return await request(`/conversations/${id}`) as TutorConversation & { messages: TutorMessage[] };
}
export async function createTutorConversation(input: {
  mode: TutorMode;
  originType: TutorOriginType | null;
  originId: string | null;
}) {
  return await request('/conversations', { method: 'POST', body: JSON.stringify(input) }) as { id: string };
}
