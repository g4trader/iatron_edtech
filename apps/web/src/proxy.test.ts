import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';
import { canonicalStagingUrl, config } from './proxy';

describe('canonicalStagingUrl', () => {
  it('preserva caminho e busca ao trocar o alias técnico pelo domínio oficial', () => {
    const request = new NextRequest(
      'https://iatron-web-staging.vercel.app/app/assessment/session?id=session-id',
    );

    expect(canonicalStagingUrl(request)?.toString()).toBe(
      'https://go.iatron.com.br/app/assessment/session?id=session-id',
    );
  });

  it('mantém requisições que já usam o domínio oficial', () => {
    const request = new NextRequest(
      'https://go.iatron.com.br/app/assessment/session?id=session-id',
    );

    expect(canonicalStagingUrl(request)).toBeNull();
  });

  it('renova autenticação em todos os ambientes protegidos', () => {
    expect(config.matcher).toEqual(
      expect.arrayContaining([
        '/app/:path*',
        '/review/:path*',
        '/editorial/:path*',
        '/admin/:path*',
      ]),
    );
  });
});
