import { describe, expect, it } from 'vitest';
import { serviceStatusSchema } from './index.js';

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
