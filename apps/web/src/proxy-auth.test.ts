import { NextRequest } from 'next/server';
import { beforeEach, describe, expect, it, vi } from 'vitest';
const state = vi.hoisted(() => ({
  user: null as null | { id: string },
  completed: false,
  refresh: false,
}));
vi.mock('@/lib/auth-bypass', () => ({ isAuthBypassEnabled: () => false }));
vi.mock('@supabase/ssr', () => ({
  createServerClient: (
    _url: string,
    _key: string,
    options: {
      cookies: {
        setAll: (
          items: Array<{
            name: string;
            value: string;
            options: { httpOnly: boolean; path: string };
          }>,
        ) => void;
      };
    },
  ) => ({
    auth: {
      getUser: async () => {
        if (state.refresh)
          options.cookies.setAll([
            {
              name: 'session-fixture',
              value: 'renewed',
              options: { httpOnly: true, path: '/' },
            },
          ]);
        return { data: { user: state.user } };
      },
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          single: async () => ({
            data: {
              onboarding_status: state.completed ? 'completed' : 'pending',
            },
          }),
        }),
      }),
    }),
  }),
}));
import { proxy } from './proxy';
beforeEach(() => {
  state.user = null;
  state.completed = false;
  state.refresh = false;
});
describe('proxy continuity', () => {
  it('preserves protected destination for visitors', async () => {
    const response = await proxy(
      new NextRequest('https://go.iatron.com.br/app/assessment/entry'),
    );
    expect(
      new URL(response.headers.get('location')!).searchParams.get('returnTo'),
    ).toBe('/app/assessment/entry');
  });
  it('keeps the final destination when a session expires during onboarding', async () => {
    const response = await proxy(
      new NextRequest(
        'https://go.iatron.com.br/app/onboarding?returnTo=%2Fapp%2Fassessment%2Fentry',
      ),
    );
    expect(
      new URL(response.headers.get('location')!).searchParams.get('returnTo'),
    ).toBe('/app/assessment/entry');
  });
  it('preserves refreshed session cookies when onboarding redirects', async () => {
    state.user = { id: 'fixture' };
    state.refresh = true;
    const response = await proxy(
      new NextRequest('https://go.iatron.com.br/app/assessment/entry'),
    );
    const url = new URL(response.headers.get('location')!);
    expect(url.pathname).toBe('/app/onboarding');
    expect(url.searchParams.get('returnTo')).toBe('/app/assessment/entry');
    expect(response.cookies.get('session-fixture')?.value).toBe('renewed');
  });
  it('uses sanitized intent when onboarding has already finished', async () => {
    state.user = { id: 'fixture' };
    state.completed = true;
    const response = await proxy(
      new NextRequest(
        'https://go.iatron.com.br/app/onboarding?returnTo=%2Fapp%2Fassessment%2Fentry',
      ),
    );
    expect(response.headers.get('location')).toBe(
      'https://go.iatron.com.br/app/assessment/entry',
    );
  });
  it('overwrites spoofed internal return headers', async () => {
    state.user = { id: 'fixture' };
    state.completed = true;
    const request = new NextRequest(
      'https://go.iatron.com.br/app/assessment/entry',
      { headers: { 'x-iatron-return-to': '//evil.invalid' } },
    );
    const response = await proxy(request);
    expect(
      response.headers.get('x-middleware-request-x-iatron-return-to'),
    ).toBe('/app/assessment/entry');
  });
});
