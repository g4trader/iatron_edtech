import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AdminHome from './page';

vi.mock('@/features/admin/server/admin', () => ({
  admin: {
    overview: vi.fn(async () => ({
      generatedAt: '2026-07-26T12:00:00.000Z',
      students: {
        registered: 12,
        activeLast30Days: 8,
        newToday: 1,
        diagnosticsCompleted: 6,
        diagnosticsInProgress: 2,
        activePlans: 5,
        activitiesCompleted: 24,
        completionRate: 0.75,
        inactive: 4,
      },
      mentors: { active: 3, awaitingReview: 2, pendingRequests: 1 },
      editorial: {
        published: 10,
        drafts: 3,
        inReview: 2,
        readyToPublish: 1,
        pendingReferences: 1,
        newVersionsLast30Days: 4,
      },
      ai: {
        drafts: 2,
        awaitingReview: 1,
        approved: 1,
        rejected: 0,
        queued: 0,
        usage: { value: 500, available: true, note: 'Tokens registrados.' },
      },
      platform: {
        health: 'ok',
        ready: 'ready',
        buildSha: '07ebfbc123',
        migrationBaseline: '202607250005',
        failures: { value: null, available: false, note: 'Indisponível.' },
        averageResponseTimeMs: {
          value: null,
          available: false,
          note: 'Indisponível.',
        },
      },
    })),
  },
}));

describe('Executive Console', () => {
  it('explains the operation with real, actionable sections', async () => {
    render(await AdminHome());
    expect(
      screen.getByRole('heading', { name: 'Como está o Iatron hoje' }),
    ).toBeVisible();
    expect(screen.getByText('12')).toBeVisible();
    expect(
      screen.getByRole('link', { name: 'Acompanhar alunos' }),
    ).toHaveAttribute('href', '/admin/students');
    expect(screen.getByText(/Health: operacional/)).toBeVisible();
  });
});
