import { beforeEach, describe, expect, it, vi } from 'vitest';
import { saveExamTargets } from './actions';
const mocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  rpc: vi.fn(),
  single: vi.fn(),
  revalidate: vi.fn(),
}));
vi.mock('next/cache', () => ({ revalidatePath: mocks.revalidate }));
vi.mock('@/lib/supabase/server', () => ({
  createClient: async () => ({
    auth: { getUser: mocks.getUser },
    rpc: mocks.rpc,
    from: () => ({ select: () => ({ eq: () => ({ single: mocks.single }) }) }),
  }),
}));
const id = '64000000-0000-4000-8000-000000000001';
beforeEach(() => {
  vi.clearAllMocks();
  mocks.getUser.mockResolvedValue({ data: { user: { id: 'own-user' } } });
  mocks.single.mockResolvedValue({
    data: { onboarding_status: 'completed' },
    error: null,
  });
  mocks.rpc.mockResolvedValue({ error: null });
});
describe('saveExamTargets', () => {
  it('valida identificadores antes de gravar', async () => {
    expect((await saveExamTargets(['invalid'])).ok).toBe(false);
    expect((await saveExamTargets([])).ok).toBe(false);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it('exige sessão autenticada', async () => {
    mocks.getUser.mockResolvedValue({ data: { user: null } });
    expect(await saveExamTargets([id])).toMatchObject({
      ok: false,
      requiresLogin: true,
    });
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it('não completa cadastro incompleto ao alterar prova', async () => {
    mocks.single.mockResolvedValue({
      data: { onboarding_status: 'in_progress' },
    });
    expect((await saveExamTargets([id])).ok).toBe(false);
    expect(mocks.rpc).not.toHaveBeenCalled();
  });
  it('preserva perfil e planos e revalida apenas após persistência', async () => {
    expect((await saveExamTargets([id, id])).ok).toBe(true);
    expect(mocks.rpc).toHaveBeenCalledWith('save_onboarding', {
      p_step: 4,
      p_complete: true,
      p_exam_edition_ids: [id],
    });
    expect(mocks.revalidate).toHaveBeenCalledWith('/app');
  });
  it('não avança com prova indisponível', async () => {
    mocks.rpc.mockResolvedValue({ error: { code: '22023' } });
    expect((await saveExamTargets([id])).ok).toBe(false);
    expect(mocks.revalidate).not.toHaveBeenCalled();
  });
});
