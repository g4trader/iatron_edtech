import {
  learningEvidenceSchema,
  learningGapSchema,
  learningTimelineItemSchema,
  masteryStateSchema,
  scheduleItemSchema,
} from '@iatron/contracts';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const apiUrl = () =>
  (process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8080/v1').replace(
    /\/$/,
    '',
  );

async function learning<T>(path: string, schema: z.ZodType<T>): Promise<T> {
  const client = await createClient();
  const { data } = await client.auth.getSession();
  if (!data.session) throw new Error('Sessão pedagógica indisponível.');
  const response = await fetch(`${apiUrl()}/learning/${path}?limit=100`, {
    headers: { authorization: `Bearer ${data.session.access_token}` },
    cache: 'no-store',
  });
  if (!response.ok)
    throw new Error(`Learning Engine indisponível (${response.status}).`);
  return schema.parse(await response.json());
}

export const learningState = {
  mastery: () => learning('mastery', z.array(masteryStateSchema)),
  evidence: () => learning('evidence', z.array(learningEvidenceSchema)),
  gaps: () => learning('gaps', z.array(learningGapSchema)),
  timeline: () => learning('timeline', z.array(learningTimelineItemSchema)),
  schedule: () => learning('schedule', z.array(scheduleItemSchema)),
};
