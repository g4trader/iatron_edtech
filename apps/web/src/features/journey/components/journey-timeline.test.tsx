import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { JourneyTimeline } from './journey-timeline';

describe('JourneyTimeline', () => {
  it('explica o que foi concluído, a etapa atual e o que vem depois', () => {
    render(
      <JourneyTimeline
        steps={[
          { label: 'Perfil', status: 'complete' },
          { label: 'Diagnóstico', status: 'current' },
          { label: 'Fundamentos', status: 'upcoming' },
        ]}
      />,
    );

    expect(
      screen.getByRole('region', { name: 'Progresso da sua jornada' }),
    ).toBeVisible();
    expect(screen.getByText('Você está em: Diagnóstico')).toBeVisible();
    expect(screen.getByText('Concluído')).toBeVisible();
    expect(screen.getByText('Agora')).toBeVisible();
    expect(screen.getByText('Próxima etapa')).toBeVisible();
  });
});
