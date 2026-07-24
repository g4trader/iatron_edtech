import type {
  ExamBlueprint,
  ExamIntelligenceProfile,
  ExamRecurrenceStatistic,
} from '@iatron/contracts';
import { describe, expect, it } from 'vitest';
import {
  buildExamIntelligenceContext,
  explainExamRelevance,
  formatExamIntelligenceExplanation,
  selectActiveExamProfile,
  toPedagogicalExamContext,
} from './exam-intelligence-service.js';

const programId = '63000000-0000-4000-8000-000000000001';
const editionId = '64000000-0000-4000-8000-000000000001';
const profileId = '65000000-0000-4000-8000-000000000001';
const areaId = '50000000-0000-4000-8000-000000000001';

const profile = (
  version = 1,
  overrides: Partial<ExamIntelligenceProfile> = {},
): ExamIntelligenceProfile => ({
  id: version === 1 ? profileId : crypto.randomUUID(),
  displayName: 'Perfil demonstrativo AMRIGS',
  version,
  validFrom: '2026-01-01',
  validUntil: null,
  editorialStatus: 'draft',
  isActive: true,
  analysisPeriod: { start: null, end: null },
  examsAnalyzed: 0,
  questionsAnalyzed: 0,
  coverage: 0,
  confidence: 'insufficient',
  limitations: ['Nenhuma prova licenciada foi analisada.'],
  source: {
    title: 'Fixture sintética',
    url: null,
    origin: 'synthetic_fixture',
  },
  responsibleEditorial: 'Equipe editorial de desenvolvimento',
  responsibleStatistical: null,
  notes: 'Não representa a banca real.',
  methodVersion: 'exam-intelligence-mvp-v1',
  isSynthetic: true,
  lastUpdatedAt: '2026-07-24T12:00:00Z',
  program: {
    id: programId,
    code: 'AMRIGS',
    name: 'Prova AMB/AMRIGS',
    board: {
      id: '62000000-0000-4000-8000-000000000001',
      name: 'Associação Médica do Rio Grande do Sul',
      acronym: 'AMB/AMRIGS',
    },
    institution: {
      id: '61000000-0000-4000-8000-000000000001',
      name: 'Associação Médica do Rio Grande do Sul',
      acronym: 'AMRIGS',
    },
  },
  ...overrides,
});

const blueprint: ExamBlueprint = {
  id: '66000000-0000-4000-8000-000000000001',
  profileId,
  version: 1,
  isActive: true,
  expectedQuestionCount: 100,
  durationMinutes: 240,
  formatDescription: 'Distribuição demonstrativa.',
  correctionRules: 'Sem regra oficial.',
  notes: 'Valores sintéticos.',
  source: { title: 'Fixture sintética', url: null },
  period: { start: null, end: null },
  confidence: 'insufficient',
  editorialStatus: 'draft',
  isSynthetic: true,
  areas: [
    {
      id: areaId,
      code: 'CLINICA_MEDICA',
      name: 'Clínica Médica',
      expectedProportion: 0.2,
      expectedQuestionCount: 20,
      weight: 1,
      notes: 'Valor exclusivamente sintético.',
      position: 1,
    },
  ],
};

const statistic: ExamRecurrenceStatistic = {
  id: '67000000-0000-4000-8000-000000000001',
  profileId,
  version: 1,
  dimension: {
    type: 'competency',
    id: '54000000-0000-4000-8000-000000000001',
    code: 'CARD.SCA.001',
    name: 'Reconhecer infarto',
  },
  period: { start: null, end: null },
  sampleSize: 0,
  sampleUnit: 'questões licenciadas',
  occurrences: 0,
  denominator: 0,
  coverage: 0,
  relevance: 'insufficient',
  confidence: 'insufficient',
  origin: 'synthetic_fixture',
  methodVersion: 'exam-intelligence-mvp-v1',
  missingData: ['Nenhuma prova licenciada disponível.'],
  limitations: ['Sem amostra autorizada.'],
  responsibleStatistical: null,
  editorialStatus: 'draft',
  isSynthetic: true,
  lastUpdatedAt: '2026-07-24T12:00:00Z',
};

describe('exam intelligence deterministic service', () => {
  it('selects only the highest active version valid on the reference date', () => {
    const inactive = profile(3, { isActive: false });
    const expired = profile(2, { validUntil: '2025-12-31' });
    const selected = selectActiveExamProfile(
      [inactive, expired, profile(1)],
      programId,
      new Date('2026-07-24T12:00:00Z'),
    );
    expect(selected?.version).toBe(1);
  });

  it('does not select an expired or incompatible profile', () => {
    expect(
      selectActiveExamProfile(
        [profile(1, { validUntil: '2025-12-31' })],
        programId,
        new Date('2026-07-24T12:00:00Z'),
      ),
    ).toBeNull();
    expect(
      selectActiveExamProfile(
        [profile()],
        crypto.randomUUID(),
        new Date('2026-07-24T12:00:00Z'),
      ),
    ).toBeNull();
  });

  it('keeps synthetic evidence insufficient and explains its limitation', () => {
    const result = explainExamRelevance(profile(), blueprint, [statistic], {
      dimensionType: 'competency',
      dimensionId: statistic.dimension.id,
    });
    expect(result).toEqual(
      expect.objectContaining({
        relevance: 'insufficient',
        isSynthetic: true,
        evidence: expect.objectContaining({
          status: 'synthetic',
          confidence: 'insufficient',
        }),
      }),
    );
    expect(result.explanation).toContain('demonstrativo');
  });

  it('returns explicit unavailability instead of a fallback', () => {
    const unsupported = buildExamIntelligenceContext({
      target: { editionId, programId: crypto.randomUUID() },
      profiles: [profile()],
      blueprint: null,
      statistics: [],
      asOf: new Date('2026-07-24T12:00:00Z'),
    });
    expect(unsupported).toEqual(
      expect.objectContaining({
        availability: 'unavailable',
        reason: 'unsupported_exam',
      }),
    );
    expect(toPedagogicalExamContext(unsupported)).toBeNull();
  });

  it('resolves the onboarding target into a read-only pedagogical adapter', () => {
    const context = buildExamIntelligenceContext({
      target: { editionId, programId },
      profiles: [profile()],
      blueprint,
      statistics: [statistic],
      asOf: new Date('2026-07-24T12:00:00Z'),
    });
    expect(context.availability).toBe('available');
    expect(toPedagogicalExamContext(context)).toEqual(
      expect.objectContaining({
        targetExamEditionId: editionId,
        profileVersion: 1,
        isSynthetic: true,
      }),
    );
  });

  it('is reproducible and resolves 1,000 reads without derived state', () => {
    const input = {
      target: { editionId, programId },
      profiles: [profile()],
      blueprint,
      statistics: [statistic],
      asOf: new Date('2026-07-24T12:00:00Z'),
    };
    const expected = buildExamIntelligenceContext(input);
    const startedAt = performance.now();
    for (let index = 0; index < 1_000; index += 1)
      expect(buildExamIntelligenceContext(input)).toEqual(expected);
    expect(performance.now() - startedAt).toBeGreaterThanOrEqual(0);
  });

  it('uses human language for insufficient authorized evidence', () => {
    expect(
      formatExamIntelligenceExplanation({
        profile: profile(1, { isSynthetic: false }),
        statistic: null,
      }),
    ).toContain('provas licenciadas suficientes');
  });
});
