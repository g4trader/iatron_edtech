import { describe, expect, it, vi } from 'vitest';
import { isAuthBypassEnabled } from './auth-bypass';

describe('isAuthBypassEnabled', () => {
  it('fails closed without the explicit flag', () => {
    expect(isAuthBypassEnabled({ NODE_ENV: 'test' })).toBe(false);
  });

  it('allows an explicit bypass only outside production', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(
      isAuthBypassEnabled({ NODE_ENV: 'test', E2E_AUTH_BYPASS: '1' }),
    ).toBe(true);
    expect(
      isAuthBypassEnabled({ NODE_ENV: 'production', E2E_AUTH_BYPASS: '1' }),
    ).toBe(false);
  });

  it('does not accept truthy variants', () => {
    expect(
      isAuthBypassEnabled({ NODE_ENV: 'development', E2E_AUTH_BYPASS: 'true' }),
    ).toBe(false);
  });
});
