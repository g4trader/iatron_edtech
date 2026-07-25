import { beforeEach, describe, expect, it, vi } from 'vitest';
import { completeDiagnostic } from './actions';

const { finishAssessment, redirect, revalidatePath } = vi.hoisted(() => ({
  finishAssessment: vi.fn(),
  redirect: vi.fn(),
  revalidatePath: vi.fn(),
}));

vi.mock('./server/adaptive-assessment', () => ({
  answerQuestion: vi.fn(),
  finishAssessment,
  startAssessment: vi.fn(),
}));
vi.mock('next/navigation', () => ({ redirect }));
vi.mock('next/cache', () => ({ revalidatePath }));

describe('completeDiagnostic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('revalida Jornada, resultado e plano depois da conclusão persistida', async () => {
    const form = new FormData();
    form.set('assessmentId', '10000000-0000-4000-8000-000000000001');

    await completeDiagnostic(form);

    expect(finishAssessment).toHaveBeenCalledWith(
      '10000000-0000-4000-8000-000000000001',
    );
    expect(revalidatePath).toHaveBeenCalledWith('/app');
    expect(revalidatePath).toHaveBeenCalledWith('/app/assessment/result');
    expect(revalidatePath).toHaveBeenCalledWith('/app/plan');
    expect(redirect).toHaveBeenCalledWith(
      '/app/assessment/result?id=10000000-0000-4000-8000-000000000001',
    );
  });
});
