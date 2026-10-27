import { describe, expect, it } from 'vitest';
import {
  safeReturnTo,
  safeCallbackDestination,
  withReturnTo,
} from './safe-return-to';
import { approvedAuthOrigin } from './auth-origin';

describe('authenticated navigation destinations', () => {
  it.each([
    '/app/assessment/entry',
    '/app/chat/abc?focus=1',
    '/admin',
    '/editorial/content',
    '/review/queue',
    '/review-preview',
  ])('preserves internal route %s', (route) =>
    expect(safeReturnTo(route)).toBe(route),
  );
  it.each([
    null,
    undefined,
    '',
    '//evil.invalid',
    '/\\evil.invalid',
    '/\t/evil.invalid',
    '/%2f%2fevil.invalid',
    '/%252f%252fevil.invalid',
    '/app/../auth/callback',
    '/app/%2e%2e/admin',
    '/application',
    '/login',
    '/auth/callback',
    '/app/onboarding',
    'https://evil.invalid',
    'javascript:alert(1)',
  ])('rejects ambiguous/unapproved route %s', (route) =>
    expect(safeReturnTo(route)).toBe('/app'),
  );
  it('encodes the destination once, preserving its query', () => {
    const url = new URL(
      withReturnTo('/login', '/app/assessment/session?id=123'),
      'https://iatron.invalid',
    );
    expect(url.searchParams.get('returnTo')).toBe(
      '/app/assessment/session?id=123',
    );
  });
  it('allows only the recovery form as an auth callback exception', () => {
    expect(
      safeCallbackDestination(
        '/redefinir-senha?returnTo=%2Fapp%2Fassessment%2Fentry',
      ),
    ).toBe('/redefinir-senha?returnTo=%2Fapp%2Fassessment%2Fentry');
    expect(
      safeCallbackDestination('/redefinir-senha?returnTo=https://evil.invalid'),
    ).toBe('/redefinir-senha?returnTo=%2Fapp');
    expect(safeCallbackDestination('/redefinir-senha-extra')).toBe('/app');
  });
});

describe('approved auth origins', () => {
  it('ignores arbitrary and spoofed hosts', () => {
    expect(approvedAuthOrigin('evil.invalid', undefined, false)).toBe(
      'https://go.iatron.com.br',
    );
    expect(
      approvedAuthOrigin('go.iatron.com.br@evil.invalid', undefined, false),
    ).toBe('https://go.iatron.com.br');
    expect(approvedAuthOrigin('localhost:3000', undefined, false)).toBe(
      'https://go.iatron.com.br',
    );
  });
  it('supports local tests and the trusted deployment host only', () => {
    expect(approvedAuthOrigin('127.0.0.1:3000', undefined, true)).toBe(
      'http://127.0.0.1:3000',
    );
    expect(
      approvedAuthOrigin('preview.vercel.app', 'preview.vercel.app', false),
    ).toBe('https://preview.vercel.app');
    expect(
      approvedAuthOrigin('other.vercel.app', 'preview.vercel.app', false),
    ).toBe('https://go.iatron.com.br');
  });
});
