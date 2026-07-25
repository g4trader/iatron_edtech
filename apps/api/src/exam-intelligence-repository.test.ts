import { afterEach, describe, expect, it, vi } from 'vitest';
import { readEnvironment } from './config/environment.js';
import { createExamIntelligenceRepository } from './exam-intelligence-repository.js';

const environment = readEnvironment({ NODE_ENV: 'test' });

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('exam intelligence repository', () => {
  it('desambigua as relações do programa ao consultar perfis', async () => {
    const request = vi.fn().mockResolvedValue(
      new Response('[]', {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', request);

    await createExamIntelligenceRepository(
      environment,
      'authenticated-token',
    ).listProfiles();

    const url = String(request.mock.calls[0]?.[0]);
    expect(url).toContain(
      'exam_programs!exam_intelligence_profiles_exam_program_id_fkey!inner',
    );
    expect(url).toContain('institutions!exam_programs_institution_id_fkey');
    expect(url).toContain('exam_boards!exam_programs_exam_board_id_fkey');
  });
});
