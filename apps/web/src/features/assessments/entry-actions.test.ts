import { revalidatePath } from 'next/cache';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { assessmentSummarySchema } from '@iatron/contracts';
import {
  beginAcquisitionDiagnostic,
  resumeAcquisitionDiagnostic,
  finishAcquisitionDiagnostic,
} from './entry-actions';
import { selectAssessmentEntry } from './entry-state';
const api = vi.hoisted(() => ({
  assessmentHistory: vi.fn(),
  startAssessment: vi.fn(),
  resumeAssessment: vi.fn(),
  finishAssessment: vi.fn(),
}));
vi.mock('./server/adaptive-assessment', () => api);
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
const id = '10000000-0000-4000-8000-000000000001';
function assessment(
  status = 'active',
  startedAt = '2026-10-27T10:00:00Z',
  completedAt: string | null = null,
) {
  return assessmentSummarySchema.parse({
    id,
    objective: 'Diagnóstico',
    status,
    algorithmVersion: 'test',
    durationMinutes: 30,
    questionCount: 10,
    answeredCount: 2,
    startedAt,
    completedAt,
  });
}
function form() {
  const data = new FormData();
  data.set('mode', 'quick_screening');
  data.set('assessmentId', id);
  return data;
}

describe('entrada e confirmação do diagnóstico', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    api.assessmentHistory.mockResolvedValue([]);
    api.startAssessment.mockResolvedValue(id);
  });
  it('preserva aberto mesmo anterior à última conclusão e não muta histórico', () => {
    const old = assessment('paused', '2026-10-25T10:00:00Z');
    const completed = assessment(
      'completed',
      '2026-10-26T10:00:00Z',
      '2026-10-26T11:00:00Z',
    );
    const items = [old, completed];
    expect(selectAssessmentEntry(items)).toEqual({ current: old, completed });
    expect(items[0]).toBe(old);
    const active = assessment();
    expect(selectAssessmentEntry([old, completed, active]).current).toBe(
      active,
    );
    expect(selectAssessmentEntry([assessment('cancelled')]).current).toBeNull();
  });
  it('não cria nem emite início quando histórico está indisponível', async () => {
    api.assessmentHistory.mockRejectedValue(new Error('unavailable'));
    expect(
      (await beginAcquisitionDiagnostic({ status: 'idle' }, form())).status,
    ).toBe('error');
    expect(api.startAssessment).not.toHaveBeenCalled();
  });
  it('só confirma início após criação persistida e não emite quando API falha', async () => {
    expect(
      await beginAcquisitionDiagnostic({ status: 'idle' }, form()),
    ).toEqual({
      status: 'success',
      destination: `/app/assessment/session?id=${id}`,
      event: 'diagnostic_started',
    });
    api.startAssessment.mockRejectedValue(new Error('failed'));
    const result = await beginAcquisitionDiagnostic({ status: 'idle' }, form());
    expect(result.status).toBe('error');
    expect(result).not.toHaveProperty('event');
  });
  it.each(['active', 'paused'])(
    'retoma %s sem criar ou emitir novo início',
    async (status) => {
      api.assessmentHistory.mockResolvedValue([assessment(status)]);
      const result = await beginAcquisitionDiagnostic(
        { status: 'idle' },
        form(),
      );
      expect(result).toEqual({
        status: 'success',
        destination: `/app/assessment/session?id=${id}`,
      });
      expect(api.startAssessment).not.toHaveBeenCalled();
      expect(api.resumeAssessment).toHaveBeenCalledTimes(
        status === 'paused' ? 1 : 0,
      );
    },
  );
  it('retoma uma avaliação antiga pendente mesmo após outra conclusão, sem criar uma nova', async () => {
    api.assessmentHistory.mockResolvedValue([
      {
        ...assessment(
          'completed',
          '2026-10-27T10:00:00Z',
          '2026-10-27T11:00:00Z',
        ),
        id: '10000000-0000-4000-8000-000000000002',
      },
      assessment('paused', '2026-10-25T10:00:00Z'),
    ]);
    expect(
      await beginAcquisitionDiagnostic({ status: 'idle' }, form()),
    ).toEqual({
      status: 'success',
      destination: `/app/assessment/session?id=${id}`,
    });
    expect(api.resumeAssessment).toHaveBeenCalledWith(id);
    expect(api.startAssessment).not.toHaveBeenCalled();
  });
  it('não retoma um identificador que não corresponde ao histórico atual', async () => {
    api.assessmentHistory.mockResolvedValue([assessment('paused')]);
    const data = form();
    data.set('assessmentId', 'outro');
    expect(
      (await resumeAcquisitionDiagnostic({ status: 'idle' }, data)).status,
    ).toBe('error');
    expect(api.resumeAssessment).not.toHaveBeenCalled();
  });
  it('conclusão só retorna evento depois de finish confirmado', async () => {
    api.assessmentHistory.mockResolvedValue([assessment()]);
    api.finishAssessment.mockRejectedValueOnce(new Error('incomplete'));
    expect(
      await finishAcquisitionDiagnostic({ status: 'idle' }, form()),
    ).not.toHaveProperty('event');
    expect(
      await finishAcquisitionDiagnostic({ status: 'idle' }, form()),
    ).toEqual({
      status: 'success',
      destination: `/app/assessment/result?id=${id}`,
      event: 'diagnostic_completed',
    });
    // A rerender here can remove the submitting form before its success effect runs.
    expect(revalidatePath).not.toHaveBeenCalled();
  });
  it('redireciona conclusão já salva sem repetir finish ou evento', async () => {
    api.assessmentHistory.mockResolvedValue([
      assessment('completed', '2026-10-27T10:00:00Z', '2026-10-27T11:00:00Z'),
    ]);
    expect(
      await finishAcquisitionDiagnostic({ status: 'idle' }, form()),
    ).toEqual({
      status: 'success',
      destination: `/app/assessment/result?id=${id}`,
    });
    expect(api.finishAssessment).not.toHaveBeenCalled();
  });
  it('bloqueia conclusão para UUID inválido, histórico ausente ou nenhuma resposta', async () => {
    const invalid = form();
    invalid.set('assessmentId', 'invalid');
    expect(
      (await finishAcquisitionDiagnostic({ status: 'idle' }, invalid)).status,
    ).toBe('error');
    expect(api.assessmentHistory).not.toHaveBeenCalled();
    expect(
      (await finishAcquisitionDiagnostic({ status: 'idle' }, form())).status,
    ).toBe('error');
    api.assessmentHistory.mockResolvedValue([
      { ...assessment(), answeredCount: 0 },
    ]);
    expect(
      (await finishAcquisitionDiagnostic({ status: 'idle' }, form())).status,
    ).toBe('error');
    expect(api.finishAssessment).not.toHaveBeenCalled();
  });
  it('rejeita modo inválido antes de consultar ou criar', async () => {
    const data = form();
    data.set('mode', 'invalid');
    expect(
      (await beginAcquisitionDiagnostic({ status: 'idle' }, data)).status,
    ).toBe('error');
    expect(api.assessmentHistory).not.toHaveBeenCalled();
  });
});
