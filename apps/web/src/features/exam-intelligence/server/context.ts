import { examIntelligenceContextSchema } from '@iatron/contracts';
import { createClient } from '@/lib/supabase/server';

const apiUrl = () =>
  (process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8080/v1').replace(
    /\/$/,
    '',
  );

export async function examIntelligenceContext() {
  const client = await createClient();
  const { data } = await client.auth.getSession();
  if (!data.session) return null;
  const response = await fetch(`${apiUrl()}/exam-intelligence/context`, {
    headers: { authorization: `Bearer ${data.session.access_token}` },
    cache: 'no-store',
  });
  if (!response.ok) return null;
  return examIntelligenceContextSchema.parse(await response.json());
}
