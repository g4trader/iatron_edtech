import { z } from 'zod';

export const curriculumQuerySchema = z.object({
  id: z.uuid().optional(),
  specialtyId: z.uuid().optional(),
  areaId: z.uuid().optional(),
  search: z.string().trim().max(160).default(''),
  coverage: z.enum(['', 'covered', 'partial', 'uncovered']).default(''),
  missing: z.enum(['', 'content', 'questions', 'references']).default(''),
  status: z
    .enum(['', 'legacy_unreviewed', 'draft', 'pending_review'])
    .default(''),
  page: z.coerce.number().int().min(1).max(100000).default(1),
});
export const curriculumItemSchema = z.object({
  id: z.uuid(),
  code: z.string(),
  name: z.string(),
  description: z.string(),
  active: z.boolean(),
  status: z.enum(['legacy_unreviewed', 'draft', 'pending_review']),
  source: z.string().nullable(),
  revision: z.number().int().positive(),
  terms: z.array(z.string()),
  objectives: z.array(z.string()),
  subtheme_id: z.uuid(),
  area_id: z.uuid(),
  subarea: z.string(),
  specialty_ids: z.array(z.uuid()),
  contents: z.number().nonnegative(),
  questions: z.number().nonnegative(),
  verified_references: z.number().nonnegative(),
  academic_references: z.number().nonnegative(),
  coverage: z.enum(['covered', 'partial', 'uncovered']),
});
export const curriculumPageSchema = z.object({
  items: z.array(curriculumItemSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().positive(),
  pageSize: z.literal(25),
  summary: z.object({
    total: z.number(),
    covered: z.number(),
    uncovered: z.number(),
    withQuestions: z.number(),
    pendingReview: z.number(),
  }),
  specialties: z.array(
    z.object({ id: z.uuid(), name: z.string(), count: z.number() }),
  ),
  areas: z.array(z.object({ id: z.uuid(), name: z.string() })),
});
export const saveCurriculumSchema = z
  .object({
    name: z.string().trim().min(10).max(240),
    description: z.string().trim().min(20).max(4000),
    objectives: z.array(z.string().trim().min(10).max(600)).min(1).max(12),
    terms: z.array(z.string().trim().min(1).max(100)).max(20),
    status: z.enum(['draft', 'pending_review']),
    revision: z.number().int().positive(),
    reason: z.string().trim().min(10).max(1000),
    requestId: z.uuid(),
  })
  .strict();
export type CurriculumQuery = z.infer<typeof curriculumQuerySchema>;
export type CurriculumPage = z.infer<typeof curriculumPageSchema>;
export type CurriculumItem = z.infer<typeof curriculumItemSchema>;
export type SaveCurriculum = z.infer<typeof saveCurriculumSchema>;
