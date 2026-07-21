import { describe, expect, it } from 'vitest';
import {
  availabilityInputSchema,
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
