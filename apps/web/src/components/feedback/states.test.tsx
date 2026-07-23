import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EmptyState, LoadingState } from './states';

describe('estados de experiência', () => {
  it('explica um estado vazio e oferece o próximo passo', () => {
    render(
      <EmptyState
        title="Seu primeiro plano ainda será criado"
        description="Conclua o diagnóstico para organizarmos suas prioridades."
        action={<button>Fazer diagnóstico</button>}
      />,
    );

    expect(
      screen.getByRole('heading', {
        name: 'Seu primeiro plano ainda será criado',
      }),
    ).toBeVisible();
    expect(
      screen.getByText(
        'Conclua o diagnóstico para organizarmos suas prioridades.',
      ),
    ).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Fazer diagnóstico' }),
    ).toBeVisible();
  });

  it('comunica progresso durante o carregamento', () => {
    render(<LoadingState label="Organizando seu plano de estudos." />);

    const state = screen.getByText(
      'Organizando seu plano de estudos.',
    ).closest('section');
    expect(state).toHaveAttribute('aria-busy', 'true');
    expect(
      screen.getByRole('heading', { name: 'Preparando seu conteúdo' }),
    ).toBeVisible();
  });
});
