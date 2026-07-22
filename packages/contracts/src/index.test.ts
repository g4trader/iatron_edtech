import { describe, expect, it } from 'vitest';
import {
  availabilityInputSchema,
  competencyCatalogSchema,
  guidelineCatalogSchema,
  onboardingInputSchema,
  profileUpdateSchema,
  serviceStatusSchema,
  targetExamsInputSchema,
} from './index.js';

describe('serviceStatusSchema', () => {
  it('accepts a health response', () => {
    expect(
      serviceStatusSchema.parse({
        status: 'ok',
        service: 'api',
        timestamp: new Date().toISOString(),
      }).status,
    ).toBe('ok');
  });
});

describe('academic read contracts', () => {
  it('serializes a competency only at the measurable leaf level', () => {
    expect(
      competencyCatalogSchema.parse({
        id: '54000000-0000-4000-8000-000000000001',
        code: 'CARD.SCA.001',
        name: 'Reconhecer infarto',
        description: 'Reconhecer critérios diagnósticos.',
        subtheme: {
          id: '53000000-0000-4000-8000-000000000001',
          code: 'IAM_COM_SUPRA',
          name: 'Infarto com supra',
          theme: {
            id: '52000000-0000-4000-8000-000000000001',
            code: 'SINDROMES_CORONARIANAS',
            name: 'Síndromes coronarianas',
            area: {
              id: '51000000-0000-4000-8000-000000000001',
              code: 'CARDIOLOGIA',
              name: 'Cardiologia',
            },
          },
        },
        objectives: [{ position: 1, description: 'Interpretar o ECG.' }],
      }).code,
    ).toBe('CARD.SCA.001');
  });

  it('requires guideline version and issuer', () => {
    expect(() =>
      guidelineCatalogSchema.parse({
        id: crypto.randomUUID(),
        stableKey: 'guideline',
        title: 'Guideline sem versão',
      }),
    ).toThrow();
  });
});

describe('public write contracts', () => {
  it('rejects mass assignment and unknown properties', () => {
    expect(() =>
      profileUpdateSchema.parse({
        displayName: 'Ana',
        user_id: crypto.randomUUID(),
      }),
    ).toThrow();
    expect(() =>
      onboardingInputSchema.parse({ step: 1, complete: false, role: 'admin' }),
    ).toThrow();
  });

  it('enforces UUIDs, limits and unique weekdays', () => {
    expect(() =>
      targetExamsInputSchema.parse({ examEditionIds: ['not-a-uuid'] }),
    ).toThrow();
    expect(() =>
      availabilityInputSchema.parse({
        items: [
          { weekday: 1, minutesAvailable: 60 },
          { weekday: 1, minutesAvailable: 30 },
        ],
      }),
    ).toThrow();
    expect(() =>
      availabilityInputSchema.parse({
        items: [{ weekday: 1, minutesAvailable: 1441 }],
      }),
    ).toThrow();
  });

  it('rejects excessive target exam payloads', () => {
    expect(() =>
      targetExamsInputSchema.parse({
        examEditionIds: Array.from({ length: 21 }, () => crypto.randomUUID()),
      }),
    ).toThrow();
  });
});
