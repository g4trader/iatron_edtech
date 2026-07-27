import { describe, expect, it } from 'vitest';
import {
  classifyError,
  OperationalState,
  requestId,
  sanitize,
} from './observability.js';

describe('observability', () => {
  it('accepts safe request IDs and replaces invalid values', () => {
    expect(requestId('support_ABC-123')).toBe('support_ABC-123');
    expect(requestId('Bearer secret')).toMatch(/^[0-9a-f]{8}-[0-9a-f-]{27}$/);
  });

  it('redacts credentials, tokens and sensitive fields', () => {
    const output = sanitize({
      authorization: 'Bearer private',
      password: 'private',
      nested: { connectionString: 'postgresql://private' },
      route: '/v1/meta',
    });
    expect(output).toEqual({
      authorization: '[REDACTED]',
      password: '[REDACTED]',
      nested: { connectionString: '[REDACTED]' },
      route: '/v1/meta',
    });
  });

  it('classifies retryable timeouts without leaking their message', () => {
    expect(classifyError(new DOMException('secret', 'TimeoutError'))).toEqual({
      code: 'DEPENDENCY_TIMEOUT',
      status: 504,
      retryable: true,
      message: 'Um serviço necessário demorou para responder.',
    });
  });

  it('aggregates only safe operational data', () => {
    const state = new OperationalState();
    state.recordResponse({
      requestId: 'support_ABC-123',
      route: '/v1/admin/overview',
      statusCode: 503,
      errorCode: 'DEPENDENCY_UNAVAILABLE',
      frontendSha: '068a522',
    });
    state.dependencyFailure('supabase');
    expect(state.snapshot()).toMatchObject({
      frontendSha: '068a522',
      errors5xxLastHour: 1,
      dependencies: expect.arrayContaining([
        expect.objectContaining({ name: 'supabase', status: 'degraded' }),
      ]),
    });
  });
});
