import { afterEach, describe, expect, it, vi } from 'vitest';
import { readEnvironment } from './config/environment.js';
import { createAssessmentRepository } from './assessment-repository.js';
const environment = readEnvironment({ NODE_ENV: 'test' });
const token = 'test-student-token';
const completed = (index: number) => ({
  id: `assessment-${index}`,
  status: 'completed',
  completed_at: '2026-10-27T12:00:00Z',
  started_at: '2026-10-27T10:00:00Z',
  question_attempts: [],
});
const pending = {
  id: 'old-pending',
  status: 'paused',
  completed_at: null,
  started_at: '2026-01-01T10:00:00Z',
  question_attempts: [{ id: 'saved-answer' }],
};
const response = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
afterEach(() => vi.unstubAllGlobals());

describe('histórico preserva diagnóstico pendente além do limite recente', () => {
  it('inclui pendente antigo após cem concluídos usando o mesmo token e filtros RLS', async () => {
    const request = vi
      .fn()
      .mockResolvedValueOnce(
        response(Array.from({ length: 100 }, (_, index) => completed(index))),
      )
      .mockResolvedValueOnce(response([pending]));
    vi.stubGlobal('fetch', request);
    const history = await createAssessmentRepository(
      environment,
      token,
    ).listHistory();
    expect(history).toHaveLength(101);
    expect(history.at(-1)).toMatchObject({
      id: 'old-pending',
      status: 'paused',
      completedAt: null,
      answeredCount: 1,
    });
    const url = new URL(String(request.mock.calls[1]![0]));
    expect(url.searchParams.get('status')).toBe('in.(active,paused)');
    expect(url.searchParams.get('completed_at')).toBe('is.null');
    expect(url.searchParams.get('order')).toBe('started_at.desc');
    expect(url.searchParams.get('limit')).toBe('1');
    for (const call of request.mock.calls)
      expect(call[1].headers.authorization).toBe(`Bearer ${token}`);
  });
  it('histórico curto não faz consulta adicional', async () => {
    const request = vi.fn().mockResolvedValueOnce(response([completed(1)]));
    vi.stubGlobal('fetch', request);
    expect(
      await createAssessmentRepository(environment, token).listHistory(),
    ).toHaveLength(1);
    expect(request).toHaveBeenCalledTimes(1);
  });
  it.each(['active', 'paused'])(
    'pendente %s já visível dispensa consulta adicional',
    async (status) => {
      const request = vi
        .fn()
        .mockResolvedValueOnce(
          response([
            ...Array.from({ length: 99 }, (_, index) => completed(index)),
            { ...pending, status },
          ]),
        );
      vi.stubGlobal('fetch', request);
      expect(
        await createAssessmentRepository(environment, token).listHistory(),
      ).toHaveLength(100);
      expect(request).toHaveBeenCalledTimes(1);
    },
  );
  it('falha da consulta adicional propaga erro sem retornar histórico incompleto', async () => {
    const request = vi
      .fn()
      .mockResolvedValueOnce(
        response(Array.from({ length: 100 }, (_, index) => completed(index))),
      )
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({ code: 'UNAVAILABLE', message: 'Unavailable' }),
          { status: 503 },
        ),
      );
    vi.stubGlobal('fetch', request);
    await expect(
      createAssessmentRepository(environment, token).listHistory(),
    ).rejects.toThrow('Assessment repository failed with 503');
  });
  it('não duplica identificador que mudou de estado entre as duas leituras', async () => {
    const recent = Array.from({ length: 100 }, (_, index) => completed(index));
    const request = vi
      .fn()
      .mockResolvedValueOnce(response(recent))
      .mockResolvedValueOnce(response([{ ...pending, id: recent[0]!.id }]));
    vi.stubGlobal('fetch', request);
    expect(
      await createAssessmentRepository(environment, token).listHistory(),
    ).toHaveLength(100);
  });
});
