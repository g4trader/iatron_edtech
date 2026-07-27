import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { KnowledgeLibrary } from './knowledge-library';

vi.mock('../server/editorial', () => ({
  editorial: {
    libraryOverview: vi.fn(async () => ({
      publishedContents: 4,
      contentsInReview: 2,
      publishedQuestions: 10,
      diagnosticEligibleQuestions: 8,
      verifiedReferences: 3,
      pendingReferences: 1,
      activeBlueprints: 1,
      coveredCompetencies: 2,
      uncoveredCompetencies: 1,
      possibleDuplicates: 0,
      outdatedItems: 0,
      priorityGaps: 1,
    })),
    library: vi.fn(async () => ({
      items: [
        {
          id: '10000000-0000-4000-8000-000000000001',
          kind: 'contents',
          title: 'Choque séptico',
          identifier: 'clinica.choque-septico',
          specialtyId: '10000000-0000-4000-8000-000000000002',
          specialtyName: 'Clínica Médica',
          competencyId: '10000000-0000-4000-8000-000000000003',
          competencyName: 'Reconhecer instabilidade',
          status: 'published',
          ownerName: 'Mentor responsável',
          updatedAt: '2026-07-27T12:00:00.000Z',
          detail: 'Versão 1',
          metadata: {},
        },
      ],
      page: 1,
      pageSize: 20,
      total: 1,
    })),
  },
}));

describe('Knowledge Library', () => {
  it('explains discovery and renders searchable operational data', async () => {
    render(
      await KnowledgeLibrary({
        scope: 'editorial',
        basePath: '/editorial/library',
        searchParams: Promise.resolve({}),
      }),
    );
    expect(
      screen.getByRole('heading', { name: 'Conhecimento em um só lugar' }),
    ).toBeVisible();
    expect(screen.getByLabelText('Buscar na seção')).toBeVisible();
    expect(screen.getByText('Choque séptico')).toBeVisible();
    expect(screen.getByText('Mentor responsável')).toBeVisible();
  });
});
