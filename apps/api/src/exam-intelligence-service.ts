import type {
  ExamBlueprint,
  ExamIntelligenceContext,
  ExamIntelligenceExplanation,
  ExamIntelligenceProfile,
  ExamRecurrenceStatistic,
  ExamRelevanceQuery,
} from '@iatron/contracts';

export interface TargetExamReference {
  editionId: string;
  programId: string;
}

export function selectActiveExamProfile(
  profiles: ExamIntelligenceProfile[],
  programId: string,
  asOf: Date,
): ExamIntelligenceProfile | null {
  const date = asOf.toISOString().slice(0, 10);
  return (
    profiles
      .filter(
        (profile) =>
          profile.program.id === programId &&
          profile.isActive &&
          profile.validFrom <= date &&
          (profile.validUntil === null || profile.validUntil >= date),
      )
      .sort((left, right) => right.version - left.version)[0] ?? null
  );
}

export function formatExamIntelligenceExplanation(input: {
  profile: ExamIntelligenceProfile;
  statistic: ExamRecurrenceStatistic | null;
}): string {
  if (input.profile.isSynthetic)
    return 'O perfil atual é demonstrativo e ainda não deve orientar decisões reais de estudo.';
  if (
    input.statistic === null ||
    input.statistic.confidence === 'insufficient' ||
    input.statistic.sampleSize === 0
  )
    return 'Ainda não temos provas licenciadas suficientes para estimar a recorrência deste conteúdo com segurança.';
  if (input.statistic.relevance === 'high')
    return 'Este conteúdo integra uma área relevante nas provas analisadas. A estimativa considera apenas o período e a amostra informados.';
  if (input.statistic.relevance === 'moderate')
    return 'Este conteúdo apareceu nas provas analisadas, mas deve ser interpretado junto das demais prioridades da sua preparação.';
  return 'A evidência disponível não sustenta uma prioridade específica para este conteúdo.';
}

export function explainExamRelevance(
  profile: ExamIntelligenceProfile,
  blueprint: ExamBlueprint,
  statistics: ExamRecurrenceStatistic[],
  query: ExamRelevanceQuery,
): ExamIntelligenceExplanation {
  const statistic =
    query.dimensionType && query.dimensionId
      ? (statistics.find(
          (candidate) =>
            candidate.dimension.type === query.dimensionType &&
            candidate.dimension.id === query.dimensionId,
        ) ?? null)
      : null;
  const blueprintArea =
    query.dimensionType === 'large_area' && query.dimensionId
      ? (blueprint.areas.find((area) => area.id === query.dimensionId) ?? null)
      : null;
  const limitations = [
    ...new Set([
      ...profile.limitations,
      ...(statistic?.limitations ?? []),
      ...(blueprintArea?.notes ? [blueprintArea.notes] : []),
    ]),
  ];
  const synthetic = profile.isSynthetic || (statistic?.isSynthetic ?? false);
  return {
    targetExam: profile.program.code,
    profileId: profile.id,
    profileVersion: profile.version,
    dimension:
      statistic?.dimension ??
      (blueprintArea
        ? {
            type: 'large_area' as const,
            id: blueprintArea.id,
            code: blueprintArea.code,
            name: blueprintArea.name,
          }
        : null),
    relevance: statistic?.relevance ?? 'insufficient',
    expectedDistribution: blueprintArea?.expectedProportion ?? null,
    evidence: {
      status: synthetic
        ? 'synthetic'
        : statistic && statistic.sampleSize > 0
          ? 'authorized'
          : 'insufficient',
      sampleSize: statistic?.sampleSize ?? 0,
      occurrences: statistic?.occurrences ?? 0,
      denominator: statistic?.denominator ?? 0,
      coverage: statistic?.coverage ?? profile.coverage,
      periodStart: statistic?.period.start ?? profile.analysisPeriod.start,
      periodEnd: statistic?.period.end ?? profile.analysisPeriod.end,
      confidence: statistic?.confidence ?? profile.confidence,
    },
    limitations,
    explanation: formatExamIntelligenceExplanation({ profile, statistic }),
    isSynthetic: synthetic,
  };
}

export function buildExamIntelligenceContext(input: {
  target: TargetExamReference | null;
  profiles: ExamIntelligenceProfile[];
  blueprint: ExamBlueprint | null;
  statistics: ExamRecurrenceStatistic[];
  asOf: Date;
}): ExamIntelligenceContext {
  if (input.target === null)
    return {
      availability: 'unavailable',
      targetExamEditionId: null,
      reason: 'no_target_exam',
      message:
        'Escolha uma prova-alvo para consultar como ela poderá orientar sua preparação.',
    };
  const profile = selectActiveExamProfile(
    input.profiles,
    input.target.programId,
    input.asOf,
  );
  if (profile === null)
    return {
      availability: 'unavailable',
      targetExamEditionId: input.target.editionId,
      reason: input.profiles.some(
        (candidate) => candidate.program.id === input.target?.programId,
      )
        ? 'no_active_profile'
        : 'unsupported_exam',
      message:
        'Ainda não há um perfil disponível para a prova escolhida. Nenhuma prioridade de banca foi aplicada.',
    };
  if (input.blueprint === null)
    return {
      availability: 'unavailable',
      targetExamEditionId: input.target.editionId,
      reason: 'no_active_profile',
      message:
        'O perfil da prova está incompleto no momento. Nenhuma prioridade de banca foi aplicada.',
    };
  const blueprint = input.blueprint;
  return {
    availability: 'available',
    targetExamEditionId: input.target.editionId,
    profile,
    blueprint,
    explanations: blueprint.areas.map((area) =>
      explainExamRelevance(profile, blueprint, input.statistics, {
        dimensionType: 'large_area',
        dimensionId: area.id,
      }),
    ),
  };
}

export interface ExamIntelligenceAdapter {
  targetExamEditionId: string;
  profileId: string;
  profileVersion: number;
  distribution: ExamBlueprint['areas'];
  explanations: ExamIntelligenceExplanation[];
  confidence: ExamIntelligenceProfile['confidence'];
  limitations: string[];
  isSynthetic: boolean;
}

export function toPedagogicalExamContext(
  context: ExamIntelligenceContext,
): ExamIntelligenceAdapter | null {
  if (context.availability === 'unavailable') return null;
  return {
    targetExamEditionId: context.targetExamEditionId,
    profileId: context.profile.id,
    profileVersion: context.profile.version,
    distribution: context.blueprint.areas,
    explanations: context.explanations,
    confidence: context.profile.confidence,
    limitations: context.profile.limitations,
    isSynthetic: context.profile.isSynthetic,
  };
}
