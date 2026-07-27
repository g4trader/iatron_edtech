import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AdminPlatformPage from './page';

vi.mock('@/features/admin/server/admin', () => ({
  admin: {
    overview: vi.fn(async () => ({
      platform: { health: 'ok', ready: 'ready' },
    })),
    operations: vi.fn(async () => ({
      frontendSha: 'frontend123',
      errors5xxLastHour: 0,
      recentErrors: [],
      dependencies: [
        { name: 'supabase', status: 'ok', lastFailureAt: null },
        { name: 'openai', status: 'ok', lastFailureAt: null },
        { name: 'email', status: 'ok', lastFailureAt: null },
      ],
      lastIncident: null,
    })),
    meta: vi.fn(async () => ({
      environment: 'staging',
      apiSha: 'api123456789',
      schemaVersion: '202607260001',
      cloudRunRevision: 'iatron-api-staging-00035',
      buildTimestamp: '2026-07-27T10:00:00.000Z',
    })),
    audit: vi.fn(async () => []),
  },
}));

describe('Admin Platform', () => {
  it('shows release, dependencies and minimized incident data', async () => {
    render(await AdminPlatformPage());
    expect(screen.getByText('frontend123')).toBeVisible();
    expect(screen.getByText('api123456789')).toBeVisible();
    expect(screen.getByText(/0 respostas 5xx/)).toBeVisible();
    expect(screen.getByText('supabase: operacional')).toBeVisible();
    expect(
      screen.getByText('Nenhum incidente registrado nesta instância.'),
    ).toBeVisible();
  });
});
