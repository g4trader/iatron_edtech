import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import MentorSpecialtiesPage from './page';

vi.mock('@/features/editorial/server/editorial', () => ({
  editorial: {
    specialties: vi.fn(async () => [
      {
        id: '10000000-0000-4000-8000-000000000010',
        code: 'CLINICA_MEDICA',
        name: 'Clínica Médica',
        description: null,
        owners: [
          {
            mentorId: '10000000-0000-4000-8000-000000000003',
            professionalName: 'Mentor responsável',
            ownerRole: 'primary',
            status: 'active',
            startsAt: '2026-07-26T12:00:00.000Z',
          },
        ],
        areas: ['Emergências'],
        contents: { total: 4, pending: 1 },
        questions: 10,
        competencies: 3,
        references: { total: 2, pending: 1 },
        videos: 1,
        blueprints: 1,
        lastScientificUpdateAt: '2026-07-26T12:00:00.000Z',
      },
    ]),
  },
}));

describe('medical specialty workspace', () => {
  it('identifies the scientific owner and the accountable knowledge', async () => {
    render(await MentorSpecialtiesPage());
    expect(
      screen.getByRole('heading', { name: 'Suas especialidades' }),
    ).toBeVisible();
    expect(screen.getByText(/Mentor responsável/)).toBeVisible();
    expect(screen.getByText('10')).toBeVisible();
    expect(
      screen.getByRole('link', { name: 'Abrir especialidade' }),
    ).toHaveAttribute(
      'href',
      '/review/specialties/10000000-0000-4000-8000-000000000010',
    );
  });
});
