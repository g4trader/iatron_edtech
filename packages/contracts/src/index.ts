import { z } from 'zod';

export const serviceStatusSchema = z.object({
  status: z.enum(['ok', 'ready']),
  service: z.string().min(1),
  timestamp: z.iso.datetime(),
});

export type ServiceStatus = z.infer<typeof serviceStatusSchema>;

export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    requestId: z.string(),
  }),
});

export type ApiError = z.infer<typeof apiErrorSchema>;

export const uuidSchema = z.uuid();

export const profileSchema = z.object({
  id: uuidSchema,
  displayName: z.string().min(2).max(100),
  email: z.email(),
  onboardingStatus: z.enum(['not_started', 'in_progress', 'completed']),
  onboardingStep: z.int().min(0).max(4),
});
export type Profile = z.infer<typeof profileSchema>;

export const profileUpdateSchema = z
  .object({
    displayName: z.string().trim().min(2).max(100),
  })
  .strict();
export type ProfileUpdate = z.infer<typeof profileUpdateSchema>;

export const studentProfileSchema = z.object({
  weeklyStudyHours: z.number().min(1).max(80).nullable(),
  residencyYear: z.int().min(1).max(6).nullable(),
  graduationYear: z.int().min(1950).max(2100).nullable(),
  experienceLevel: z
    .enum(['medical_student', 'recent_graduate', 'practicing_physician'])
    .nullable(),
  preferredSessionMinutes: z.int().min(15).max(180).nullable(),
  assessmentPreference: z.enum(['guided', 'independent', 'mixed']).nullable(),
});
export type StudentProfile = z.infer<typeof studentProfileSchema>;

export const availabilityItemSchema = z
  .object({
    weekday: z.int().min(0).max(6),
    minutesAvailable: z.int().min(0).max(1440),
  })
  .strict();
export const availabilityInputSchema = z
  .object({
    items: z
      .array(availabilityItemSchema)
      .max(7)
      .refine(
        (items) =>
          new Set(items.map((item) => item.weekday)).size === items.length,
        'Cada dia da semana deve aparecer apenas uma vez.',
      ),
  })
  .strict();
export type AvailabilityInput = z.infer<typeof availabilityInputSchema>;

export const institutionSchema = z.object({
  id: uuidSchema,
  name: z.string(),
  acronym: z.string(),
  stateCode: z.string().length(2),
});
export const examBoardSchema = z.object({ id: uuidSchema, name: z.string() });
export const examProgramSchema = z.object({
  id: uuidSchema,
  institutionId: uuidSchema,
  examBoardId: uuidSchema.nullable(),
  name: z.string(),
  institution: institutionSchema.optional(),
  examBoard: examBoardSchema.nullable().optional(),
});
export type ExamProgram = z.infer<typeof examProgramSchema>;

export const examEditionSchema = z.object({
  id: uuidSchema,
  examProgramId: uuidSchema,
  year: z.int().min(2000).max(2100),
  applicationDate: z.iso.date().nullable(),
  registrationDeadline: z.iso.date().nullable(),
});
export type ExamEdition = z.infer<typeof examEditionSchema>;

export const targetExamsInputSchema = z
  .object({
    examEditionIds: z.array(uuidSchema).max(20),
  })
  .strict();
export type TargetExamsInput = z.infer<typeof targetExamsInputSchema>;

export const onboardingInputSchema = z
  .object({
    step: z.int().min(1).max(4),
    displayName: z.string().trim().min(2).max(100).optional(),
    residencyYear: z.int().min(1).max(6).nullable().optional(),
    graduationYear: z.int().min(1950).max(2100).nullable().optional(),
    experienceLevel: z
      .enum(['medical_student', 'recent_graduate', 'practicing_physician'])
      .optional(),
    preferredSessionMinutes: z.int().min(15).max(180).optional(),
    assessmentPreference: z.enum(['guided', 'independent', 'mixed']).optional(),
    availability: availabilityInputSchema.optional(),
    examEditionIds: z.array(uuidSchema).max(20).optional(),
    complete: z.boolean().default(false),
  })
  .strict();
export type OnboardingInput = z.infer<typeof onboardingInputSchema>;

export const onboardingSchema = z.object({
  profile: profileSchema,
  studentProfile: studentProfileSchema,
  availability: z.array(availabilityItemSchema),
  targetExamEditionIds: z.array(uuidSchema),
});
export type Onboarding = z.infer<typeof onboardingSchema>;

export const paginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const catalogQuerySchema = paginationSchema.extend({
  search: z.string().trim().max(100).optional(),
});
export type CatalogQuery = z.infer<typeof catalogQuerySchema>;

export const academicEntitySchema = z.object({
  id: uuidSchema,
  code: z.string(),
  name: z.string(),
  description: z.string().nullable(),
});
export type AcademicEntity = z.infer<typeof academicEntitySchema>;

export const specialtyCatalogSchema = academicEntitySchema.extend({
  areas: z.array(
    academicEntitySchema.pick({ id: true, code: true, name: true }),
  ),
  programs: z.array(z.object({ id: uuidSchema, name: z.string() })),
});
export type SpecialtyCatalog = z.infer<typeof specialtyCatalogSchema>;

export const areaCatalogSchema = academicEntitySchema.extend({
  specialties: z.array(
    academicEntitySchema.pick({ id: true, code: true, name: true }),
  ),
});
export type AreaCatalog = z.infer<typeof areaCatalogSchema>;

export const themeCatalogSchema = academicEntitySchema.extend({
  area: academicEntitySchema.pick({ id: true, code: true, name: true }),
  subthemeCount: z.int().min(0),
});
export type ThemeCatalog = z.infer<typeof themeCatalogSchema>;

export const competencyCatalogSchema = academicEntitySchema.extend({
  subtheme: z.object({
    id: uuidSchema,
    code: z.string(),
    name: z.string(),
    theme: z.object({
      id: uuidSchema,
      code: z.string(),
      name: z.string(),
      area: academicEntitySchema.pick({ id: true, code: true, name: true }),
    }),
  }),
  objectives: z.array(
    z.object({ position: z.int().positive(), description: z.string() }),
  ),
});
export type CompetencyCatalog = z.infer<typeof competencyCatalogSchema>;

export const boardCatalogSchema = z.object({
  id: uuidSchema,
  name: z.string(),
  acronym: z.string().nullable(),
});
export type BoardCatalog = z.infer<typeof boardCatalogSchema>;

export const examCatalogSchema = z.object({
  id: uuidSchema,
  year: z.int(),
  edition: z.string().nullable(),
  city: z.string().nullable(),
  modality: z.string().nullable(),
  durationMinutes: z.int().nullable(),
  questionCount: z.int().nullable(),
  program: z.object({ id: uuidSchema, name: z.string() }),
  board: boardCatalogSchema.nullable(),
});
export type ExamCatalog = z.infer<typeof examCatalogSchema>;

export const guidelineCatalogSchema = z.object({
  id: uuidSchema,
  stableKey: z.string(),
  title: z.string(),
  version: z.string(),
  issuedOn: z.iso.date().nullable(),
  effectiveFrom: z.iso.date().nullable(),
  effectiveUntil: z.iso.date().nullable(),
  url: z.url().nullable(),
  notes: z.string().nullable(),
  status: z.string(),
  issuer: z.object({
    id: uuidSchema,
    name: z.string(),
    acronym: z.string().nullable(),
  }),
});
export type GuidelineCatalog = z.infer<typeof guidelineCatalogSchema>;

export type ChatRole = 'user' | 'assistant' | 'system';
export type ConfidenceLevel = 'low' | 'medium' | 'high';

export interface AnswerOptionViewModel {
  id: string;
  label: string;
  text: string;
}

export interface QuestionViewModel {
  id: string;
  number: number;
  total: number;
  area: string;
  stem: string;
  clinicalContext?: string;
  options: AnswerOptionViewModel[];
  selectedOptionId?: string;
  confidence?: ConfidenceLevel;
  markedForReview: boolean;
  status: 'unanswered' | 'answered' | 'paused';
  readOnly?: boolean;
}

export interface ToolStatusViewModel {
  id: string;
  label: string;
  status: 'running' | 'complete' | 'error';
  detail?: string;
}

export interface GapSummaryViewModel {
  id: string;
  area: string;
  topic: string;
  priority: 'high' | 'medium' | 'low';
  mastery: number;
}

export interface StudySessionViewModel {
  id: string;
  title: string;
  durationMinutes: number;
  status: 'pending' | 'active' | 'complete';
}

export interface StudyPlanViewModel {
  title: string;
  progress: number;
  sessions: StudySessionViewModel[];
}

export interface SimulationResultViewModel {
  title: string;
  answered: number;
  total: number;
  label: string;
}

export interface ReferenceViewModel {
  id: string;
  title: string;
  source: string;
  version: string;
  reviewStatus: 'reviewed' | 'demonstration';
}

export type ChatMessagePart =
  | { type: 'text'; text: string }
  | { type: 'question'; question: QuestionViewModel }
  | { type: 'tool-status'; tool: ToolStatusViewModel }
  | { type: 'gap-summary'; data: GapSummaryViewModel }
  | { type: 'study-plan'; data: StudyPlanViewModel }
  | { type: 'simulation-result'; data: SimulationResultViewModel }
  | { type: 'references'; items: ReferenceViewModel[] };

export interface ChatMessage {
  id: string;
  role: ChatRole;
  createdAt: string;
  parts: ChatMessagePart[];
  status?: 'complete' | 'streaming' | 'error';
}

export interface SendMessageInput {
  requestId: string;
  conversationId: string;
  text: string;
}

export type ChatTransportEvent =
  | { type: 'start'; requestId: string }
  | { type: 'text-delta'; requestId: string; delta: string }
  | { type: 'part'; requestId: string; part: ChatMessagePart }
  | { type: 'complete'; requestId: string }
  | { type: 'error'; requestId: string; message: string }
  | { type: 'reconnecting'; requestId: string };

export interface ChatTransport {
  sendMessage(input: SendMessageInput): AsyncIterable<ChatTransportEvent>;
  cancel(requestId: string): Promise<void>;
}
