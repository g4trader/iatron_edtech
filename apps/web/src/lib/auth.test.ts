import { describe, expect, it } from 'vitest';
import { safeReturnTo } from './auth';

describe('safeReturnTo', () => {
  it('preserves an internal route', () => {
    expect(safeReturnTo('/app/chat/abc?focus=1')).toBe('/app/chat/abc?focus=1');
  });

  it.each([
    'https://example-malicious.invalid',
    '//example-malicious.invalid',
    'javascript:alert(1)',
    '\\example-malicious.invalid',
  ])('rejects an external or executable destination: %s', (value) => {
    expect(safeReturnTo(value)).toBe('/app');
  });
});
