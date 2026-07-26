import { describe, expect, it } from 'vitest';
import { safeReturnTo, workspaceForRoles } from './auth';

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

describe('workspaceForRoles', () => {
  it.each([
    [['admin'], '/admin'],
    [['super_admin'], '/admin'],
    [['editor'], '/editorial'],
    [['mentor'], '/review'],
    [['medical_reviewer'], '/review'],
    [['student'], '/app'],
    [[], '/app'],
  ])('routes %j to %s', (roles, expected) => {
    expect(workspaceForRoles(roles)).toBe(expected);
  });

  it('uses the most privileged dedicated workspace for legacy multi-role data', () => {
    expect(workspaceForRoles(['student', 'mentor', 'admin'])).toBe('/admin');
  });
});
