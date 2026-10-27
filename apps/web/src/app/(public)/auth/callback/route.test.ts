import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ exchange: vi.fn(), verify: vi.fn() }));
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { exchangeCodeForSession: mocks.exchange, verifyOtp: mocks.verify },
  }),
}));
import { GET } from './route';
function request(next: string, query = 'code=fixture') {
  return new Request(
    `https://go.iatron.com.br/auth/callback?${query}&next=${encodeURIComponent(next)}`,
  );
}
beforeEach(() => {
  vi.clearAllMocks();
  mocks.exchange.mockResolvedValue({ error: null });
  mocks.verify.mockResolvedValue({ error: null });
});
describe('auth callback', () => {
  it('keeps the browser host when Next exposes an internal localhost origin', async () => {
    const response = await GET(
      new Request(
        'http://localhost:3000/auth/callback?code=fixture&next=%2Fapp%2Fassessment%2Fentry',
        { headers: { host: '127.0.0.1:3000' } },
      ),
    );
    expect(response.headers.get('location')).toBe(
      'http://127.0.0.1:3000/app/assessment/entry',
    );
  });
  it('uses the approved forwarded host and refuses an arbitrary forwarded origin', async () => {
    const response = await GET(
      new Request(
        'http://localhost:3000/auth/callback?code=fixture&next=%2Fapp',
        {
          headers: {
            host: 'localhost:3000',
            'x-forwarded-host': 'go.iatron.com.br',
          },
        },
      ),
    );
    expect(response.headers.get('location')).toBe(
      'https://go.iatron.com.br/app',
    );
    const unsafe = await GET(
      new Request(
        'http://localhost:3000/auth/callback?code=fixture&next=%2Fapp',
        { headers: { 'x-forwarded-host': 'evil.invalid' } },
      ),
    );
    expect(unsafe.headers.get('location')).toBe('https://go.iatron.com.br/app');
  });

  it('exchanges the code before returning to a protected destination', async () => {
    const response = await GET(request('/app/assessment/entry'));
    expect(mocks.exchange).toHaveBeenCalledWith('fixture');
    expect(response.headers.get('location')).toBe(
      'https://go.iatron.com.br/app/assessment/entry',
    );
  });
  it.each([
    '/\\evil.invalid',
    '/%2f%2fevil.invalid',
    '//evil.invalid',
    '/\t/evil.invalid',
  ])('never follows unsafe next %s', async (next) => {
    expect((await GET(request(next))).headers.get('location')).toBe(
      'https://go.iatron.com.br/app',
    );
  });
  it('keeps intent after an expired code', async () => {
    mocks.exchange.mockResolvedValueOnce({ error: new Error('expired') });
    const response = await GET(request('/app/assessment/entry'));
    const url = new URL(response.headers.get('location')!);
    expect(url.pathname).toBe('/login');
    expect(url.searchParams.get('returnTo')).toBe('/app/assessment/entry');
  });
  it('verifies recovery token and preserves final intent', async () => {
    const response = await GET(
      request(
        '/redefinir-senha?returnTo=%2Fapp%2Fassessment%2Fentry',
        'token_hash=fixture&type=recovery',
      ),
    );
    expect(mocks.verify).toHaveBeenCalledWith({
      token_hash: 'fixture',
      type: 'recovery',
    });
    expect(response.headers.get('location')).toBe(
      'https://go.iatron.com.br/redefinir-senha?returnTo=%2Fapp%2Fassessment%2Fentry',
    );
  });
});
