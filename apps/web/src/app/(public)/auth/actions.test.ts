import { beforeEach, describe, expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({
  signIn: vi.fn(),
  signUp: vi.fn(),
  reset: vi.fn(),
  update: vi.fn(),
  from: vi.fn(),
}));
vi.mock('next/navigation', () => ({
  redirect: (path: string) => {
    throw new Error(`REDIRECT:${path}`);
  },
}));
vi.mock('@/lib/auth-origin', () => ({
  authOrigin: async () => 'https://go.iatron.com.br',
}));
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: {
      signInWithPassword: mocks.signIn,
      signUp: mocks.signUp,
      resetPasswordForEmail: mocks.reset,
      updateUser: mocks.update,
    },
    from: mocks.from,
  }),
}));
import { login, signup, recoverPassword, updatePassword } from './actions';
const destination = '/app/assessment/entry';
function form() {
  const data = new FormData();
  data.set('email', 'fixture@example.com');
  data.set('password', 'NotARealPassword1!');
  data.set('returnTo', destination);
  data.set('origin', 'https://evil.invalid');
  return data;
}
function profile(completed: boolean, roles: string[] = []) {
  mocks.from.mockImplementation((table: string) => ({
    select: () => ({
      eq: () =>
        table === 'profiles'
          ? {
              single: async () => ({
                data: {
                  onboarding_status: completed ? 'completed' : 'pending',
                },
              }),
            }
          : Promise.resolve({ data: roles.map((role) => ({ role })) }),
    }),
  }));
}
beforeEach(() => {
  vi.clearAllMocks();
  mocks.signIn.mockResolvedValue({
    data: { user: { id: 'fixture' } },
    error: null,
  });
  profile(true);
});
describe('auth intent continuity', () => {
  it('returns authenticated students to the intended diagnostic entry', async () => {
    await expect(login(form())).rejects.toThrow(`REDIRECT:${destination}`);
  });
  it('preserves intent through failed login and onboarding', async () => {
    mocks.signIn.mockResolvedValueOnce({
      data: { user: null },
      error: new Error('invalid'),
    });
    await expect(login(form())).rejects.toThrow(
      'REDIRECT:/login?returnTo=%2Fapp%2Fassessment%2Fentry&erro=',
    );
    profile(false);
    await expect(login(form())).rejects.toThrow(
      'REDIRECT:/app/onboarding?returnTo=%2Fapp%2Fassessment%2Fentry',
    );
  });
  it('preserves dedicated workspace defaults', async () => {
    profile(false, ['admin']);
    const data = form();
    data.delete('returnTo');
    await expect(login(data)).rejects.toThrow('REDIRECT:/admin');
  });
  it('puts intent in the email callback, ignores form origin, without claiming signup conversion', async () => {
    mocks.signUp.mockResolvedValueOnce({
      data: { user: { identities: [{ id: 'new' }] }, session: null },
      error: null,
    });
    await expect(signup(form())).rejects.toThrow(
      'REDIRECT:/login?returnTo=%2Fapp%2Fassessment%2Fentry&mensagem=',
    );
    const options = mocks.signUp.mock.calls[0]![0].options;
    const callback = new URL(options.emailRedirectTo);
    expect(callback.origin).toBe('https://go.iatron.com.br');
    expect(callback.searchParams.get('next')).toBe(destination);
  });
  it('keeps confirmation messaging for obfuscated existing accounts and errors', async () => {
    mocks.signUp.mockResolvedValueOnce({
      data: { user: { identities: [] }, session: null },
      error: null,
    });
    await expect(signup(form())).rejects.toThrow('REDIRECT:/login?');
    mocks.signUp.mockResolvedValueOnce({
      data: { user: null, session: null },
      error: new Error('failure'),
    });
    await expect(signup(form())).rejects.toThrow(
      'REDIRECT:/cadastro?returnTo=%2Fapp%2Fassessment%2Fentry&erro=',
    );
  });
  it('handles immediate authenticated signup without an unnecessary login', async () => {
    mocks.signUp.mockResolvedValueOnce({
      data: {
        user: { identities: [{ id: 'new' }] },
        session: { access_token: 'fixture' },
      },
      error: null,
    });
    await expect(signup(form())).rejects.toThrow(`REDIRECT:${destination}`);
  });
  it('preserves intent through recovery and password errors', async () => {
    mocks.reset.mockResolvedValueOnce({ error: null });
    await expect(recoverPassword(form())).rejects.toThrow(
      'REDIRECT:/login?returnTo=%2Fapp%2Fassessment%2Fentry&mensagem=',
    );
    const callback = new URL(mocks.reset.mock.calls[0]![1].redirectTo);
    expect(callback.searchParams.get('next')).toBe(
      '/redefinir-senha?returnTo=%2Fapp%2Fassessment%2Fentry',
    );
    mocks.update.mockResolvedValueOnce({ error: new Error('expired') });
    await expect(updatePassword(form())).rejects.toThrow(
      'REDIRECT:/redefinir-senha?returnTo=%2Fapp%2Fassessment%2Fentry&erro=',
    );
    mocks.update.mockResolvedValueOnce({ error: null });
    await expect(updatePassword(form())).rejects.toThrow(
      `REDIRECT:${destination}`,
    );
  });
});
