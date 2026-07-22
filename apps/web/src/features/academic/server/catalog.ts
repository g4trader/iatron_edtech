import {
  areaCatalogSchema,
  boardCatalogSchema,
  competencyCatalogSchema,
  examCatalogSchema,
  guidelineCatalogSchema,
  specialtyCatalogSchema,
  themeCatalogSchema,
} from '@iatron/contracts';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const apiUrl = () =>
  (process.env.NEXT_PUBLIC_API_URL ?? 'http://127.0.0.1:8080/v1').replace(
    /\/$/,
    '',
  );

async function catalog<T>(path: string, schema: z.ZodType<T>): Promise<T> {
  const client = await createClient();
  const { data } = await client.auth.getSession();
  if (!data.session) throw new Error('Sessão acadêmica indisponível.');
  const response = await fetch(`${apiUrl()}/academic/${path}?limit=100`, {
    headers: { authorization: `Bearer ${data.session.access_token}` },
    cache: 'no-store',
  });
  if (!response.ok)
    throw new Error(`Catálogo acadêmico indisponível (${response.status}).`);
  return schema.parse(await response.json());
}

export const academicCatalog = {
  specialties: () => catalog('specialties', z.array(specialtyCatalogSchema)),
  areas: () => catalog('areas', z.array(areaCatalogSchema)),
  themes: () => catalog('themes', z.array(themeCatalogSchema)),
  competencies: () => catalog('competencies', z.array(competencyCatalogSchema)),
  boards: () => catalog('boards', z.array(boardCatalogSchema)),
  exams: () => catalog('exams', z.array(examCatalogSchema)),
  guidelines: () => catalog('guidelines', z.array(guidelineCatalogSchema)),
};
