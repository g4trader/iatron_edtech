import { createHash } from 'node:crypto';
import type { GenerateStudyPlanInput, StudyPlan } from '@iatron/contracts';
import { identifyLearningGaps } from './learning-engine.js';
import type { LearningRepository } from './learning-repository.js';
import {
  generateSevenDayPlan,
  STUDY_PLAN_ALGORITHM_VERSION,
} from './study-plan-engine.js';
import type { StudyPlanRepository } from './study-plan-repository.js';

const canonical = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(canonical);
  if (typeof value === 'object' && value !== null)
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nested]) => [key, canonical(nested)]),
    );
  return value;
};
const date = (value: Date) => value.toISOString().slice(0, 10);

export async function generateStudyPlan(
  input: GenerateStudyPlanInput,
  dependencies: {
    plans: StudyPlanRepository;
    learning: LearningRepository;
    clock: () => Date;
  },
): Promise<StudyPlan> {
  const asOf = dependencies.clock();
  const [context, competencies, mastery] = await Promise.all([
    dependencies.plans.context(),
    dependencies.learning.listCompetencies(),
    dependencies.learning.listCurrentMastery(),
  ]);
  const gaps = identifyLearningGaps(competencies, mastery, asOf);
  const generated = generateSevenDayPlan({
    gaps,
    availability: context.availability,
    preferredSessionMinutes: context.preferredSessionMinutes,
    targetExam: context.targetExam,
    history: context.history,
    asOf,
    horizonDays: input.horizonDays,
  });
  const periodStart = date(asOf);
  const periodEndDate = new Date(asOf);
  periodEndDate.setUTCDate(periodEndDate.getUTCDate() + input.horizonDays - 1);
  const periodEnd = date(periodEndDate);
  const inputSnapshot = canonical({
    algorithmVersion: STUDY_PLAN_ALGORITHM_VERSION,
    asOf: periodStart,
    horizonDays: input.horizonDays,
    mastery,
    gaps,
    availability: generated.availabilitySnapshot,
    preferredSessionMinutes: context.preferredSessionMinutes,
    targetExam: context.targetExam,
    executionRevision: context.executionRevision,
  }) as Record<string, unknown>;
  const inputHash = createHash('sha256')
    .update(JSON.stringify(inputSnapshot))
    .digest('hex');
  const versionId = await dependencies.plans.persist({
    objective: input.objective,
    targetExamId: context.targetExam?.id ?? null,
    periodStart,
    periodEnd,
    totalAvailableMinutes: generated.totalAvailableMinutes,
    availabilitySnapshot: generated.availabilitySnapshot,
    inputSnapshot,
    inputHash,
    triggerReason: input.triggerReason,
    items: generated.items,
  });
  const plan = (await dependencies.plans.history()).find(
    (item) => item.versionId === versionId,
  );
  if (!plan) throw new Error('Persisted study plan version was not found.');
  return plan;
}
