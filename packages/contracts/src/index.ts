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

export const learningEvidenceSchema = z.object({
  id: uuidSchema,
  eventId: uuidSchema,
  competencyId: uuidSchema,
  competencyCode: z.string(),
  competencyName: z.string(),
  weight: z.number().positive(),
  difficulty: z.int().min(1).max(5),
  responseTimeMs: z.int().nonnegative().nullable(),
  isCorrect: z.boolean(),
  observedAt: z.iso.datetime({ offset: true }),
  algorithmVersion: z.string(),
});
export type LearningEvidence = z.infer<typeof learningEvidenceSchema>;

export const masteryStateSchema = z.object({
  competencyId: uuidSchema,
  competencyCode: z.string(),
  competencyName: z.string(),
  mastery: z.number().min(0).max(1),
  confidence: z.number().min(0).max(1),
  evidenceCount: z.int().nonnegative(),
  trend: z.enum(['improving', 'stable', 'declining']),
  lastEvidenceAt: z.iso.datetime({ offset: true }).nullable(),
  algorithmVersion: z.string(),
});
export type MasteryState = z.infer<typeof masteryStateSchema>;

export const learningGapSchema = masteryStateSchema.extend({
  reasons: z.array(z.string()),
  priority: z.number().min(0).max(1),
});
export type LearningGap = z.infer<typeof learningGapSchema>;

export const scheduleItemSchema = learningGapSchema.extend({
  rank: z.int().positive(),
  recommendedMinutes: z.int().positive(),
});
export type ScheduleItem = z.infer<typeof scheduleItemSchema>;

export const learningTimelineItemSchema = z.object({
  id: uuidSchema,
  occurredAt: z.iso.datetime({ offset: true }),
  type: z.string(),
  title: z.string(),
  detail: z.string(),
  competencyId: uuidSchema.nullable(),
});
export type LearningTimelineItem = z.infer<typeof learningTimelineItemSchema>;

export const startAssessmentInputSchema = z.object({
  objective: z.string().min(3).max(300),
  examProgramId: uuidSchema.nullable().default(null),
  specialtyId: uuidSchema.nullable().default(null),
  durationMinutes: z.int().min(5).max(360).default(30),
  questionCount: z.int().min(1).max(100).default(10),
});
export type StartAssessmentInput = z.infer<typeof startAssessmentInputSchema>;

export const answerAssessmentInputSchema = z.object({
  questionVersionId: uuidSchema,
  selectedOptionId: uuidSchema,
  responseTimeMs: z.int().min(0).max(7_200_000),
  statedConfidence: z.enum(['low', 'medium', 'high']),
});
export type AnswerAssessmentInput = z.infer<typeof answerAssessmentInputSchema>;

export const assessmentQuestionSchema = z.object({
  assessmentId: uuidSchema,
  questionVersionId: uuidSchema,
  number: z.int().positive(),
  total: z.int().positive(),
  stem: z.string(),
  difficulty: z.int().min(1).max(5),
  options: z
    .array(z.object({ id: uuidSchema, label: z.string(), content: z.string() }))
    .min(2),
  competencies: z
    .array(z.object({ id: uuidSchema, code: z.string(), name: z.string() }))
    .min(1),
  selectionReason: z.string(),
});
export type AssessmentQuestion = z.infer<typeof assessmentQuestionSchema>;

export const assessmentSummarySchema = z.object({
  id: uuidSchema,
  objective: z.string(),
  status: z.string(),
  algorithmVersion: z.string(),
  durationMinutes: z.int(),
  questionCount: z.int(),
  answeredCount: z.int(),
  startedAt: z.iso.datetime({ offset: true }),
  completedAt: z.iso.datetime({ offset: true }).nullable(),
});
export type AssessmentSummary = z.infer<typeof assessmentSummarySchema>;

export const assessmentCompetencyResultSchema = masteryStateSchema
  .pick({
    competencyId: true,
    competencyCode: true,
    competencyName: true,
    mastery: true,
    confidence: true,
    evidenceCount: true,
  })
  .extend({
    confidenceLevel: z.enum(['low', 'medium', 'high']),
    classification: z.enum(['strong', 'weak', 'unmeasured', 'developing']),
  });
export type AssessmentCompetencyResult = z.infer<
  typeof assessmentCompetencyResultSchema
>;

export const assessmentResultSchema = z.object({
  id: uuidSchema,
  assessmentId: uuidSchema,
  correctCount: z.int().nonnegative(),
  answeredCount: z.int().nonnegative(),
  overallConfidence: z.number().min(0).max(1),
  diagnosticCoverage: z.number().min(0).max(1),
  algorithmVersion: z.string(),
  createdAt: z.iso.datetime({ offset: true }),
  competencies: z.array(assessmentCompetencyResultSchema),
});
export type AssessmentResult = z.infer<typeof assessmentResultSchema>;

export const studyPlanReasonSchema = z.object({
  code: z.string(),
  contribution: z.number().min(0).max(1),
  detail: z.string(),
});
export type StudyPlanReason = z.infer<typeof studyPlanReasonSchema>;

export const studyPlanItemSchema = z.object({
  id: uuidSchema,
  competencyId: uuidSchema,
  competencyCode: z.string(),
  competencyName: z.string(),
  itemType: z.enum([
    'competency_study',
    'review',
    'question_practice',
    'gap_reinforcement',
    'complementary_diagnosis',
  ]),
  priority: z.number().min(0).max(1),
  estimatedMinutes: z.int().positive(),
  plannedDate: z.iso.date().nullable(),
  position: z.int().positive().nullable(),
  status: z.enum([
    'planned',
    'in_progress',
    'completed',
    'deferred',
    'skipped',
    'unallocated',
  ]),
  origin: z.string(),
  reasons: z.array(studyPlanReasonSchema).min(1),
  replanCount: z.int().nonnegative(),
});
export type StudyPlanItem = z.infer<typeof studyPlanItemSchema>;

export const studyPlanSchema = z.object({
  planId: uuidSchema,
  versionId: uuidSchema,
  version: z.int().positive(),
  objective: z.string(),
  algorithmVersion: z.string(),
  periodStart: z.iso.date(),
  periodEnd: z.iso.date(),
  generatedAt: z.iso.datetime({ offset: true }),
  totalPlannedMinutes: z.int().nonnegative(),
  totalAvailableMinutes: z.int().nonnegative(),
  triggerReason: z.string(),
  items: z.array(studyPlanItemSchema),
});
export type StudyPlan = z.infer<typeof studyPlanSchema>;

export const generateStudyPlanInputSchema = z.object({
  objective: z.string().min(3).max(300).default('Plano adaptativo de 7 dias'),
  horizonDays: z.int().min(1).max(14).default(7),
  triggerReason: z
    .enum([
      'manual',
      'assessment_completed',
      'mastery_changed',
      'availability_changed',
      'target_exam_changed',
      'item_completed',
      'item_deferred',
      'item_skipped',
    ])
    .default('manual'),
});
export type GenerateStudyPlanInput = z.infer<
  typeof generateStudyPlanInputSchema
>;

export const studyPlanItemActionSchema = z.object({
  actualMinutes: z.int().min(0).max(720).nullable().default(null),
  reason: z.string().min(3).max(500).nullable().default(null),
});
export type StudyPlanItemAction = z.infer<typeof studyPlanItemActionSchema>;

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

export const tutorModeSchema = z.enum([
  'general',
  'competency_explanation',
  'question_explanation',
  'gap_coaching',
  'plan_explanation',
  'study_guidance',
]);
export type TutorMode = z.infer<typeof tutorModeSchema>;

export const tutorOriginTypeSchema = z.enum([
  'competency',
  'question',
  'gap',
  'plan_item',
  'assessment',
]);
export type TutorOriginType = z.infer<typeof tutorOriginTypeSchema>;

export const createTutorConversationSchema = z
  .object({
    mode: tutorModeSchema.default('general'),
    originType: tutorOriginTypeSchema.nullable().default(null),
    originId: uuidSchema.nullable().default(null),
  })
  .refine((input) => (input.originType === null) === (input.originId === null), {
    message: 'Origem e identificador devem ser informados juntos.',
  });

export const sendTutorMessageSchema = z.object({
  requestId: uuidSchema,
  text: z.string().trim().min(1).max(4000),
});

export const tutorConversationSchema = z.object({
  id: uuidSchema,
  title: z.string(),
  mode: tutorModeSchema,
  originType: tutorOriginTypeSchema.nullable(),
  originId: uuidSchema.nullable(),
  status: z.enum(['active', 'archived']),
  createdAt: z.iso.datetime({ offset: true }),
  updatedAt: z.iso.datetime({ offset: true }),
});
export type TutorConversation = z.infer<typeof tutorConversationSchema>;

export const tutorMessageSchema = z.object({
  id: uuidSchema,
  role: z.enum(['user', 'assistant']),
  content: z.string(),
  status: z.enum([
    'pending',
    'streaming',
    'complete',
    'partial',
    'failed',
    'cancelled',
  ]),
  requestId: uuidSchema.nullable(),
  createdAt: z.iso.datetime({ offset: true }),
});
export type TutorMessage = z.infer<typeof tutorMessageSchema>;

export const tutorReferenceSchema = z.object({
  type: z.enum([
    'profile',
    'target_exam',
    'study_plan',
    'competency',
    'mastery',
    'gap',
    'evidence',
    'question',
    'guideline',
    'assessment',
  ]),
  entityId: uuidSchema.nullable(),
  label: z.string(),
  snapshot: z.record(z.string(), z.unknown()),
});
export type TutorReference = z.infer<typeof tutorReferenceSchema>;
