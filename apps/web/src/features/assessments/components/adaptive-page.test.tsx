import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AssessmentPage } from './adaptive-page';

describe('AssessmentPage', () => {
  it('remove caminhos paralelos durante uma questão', () => {
    render(
      <AssessmentPage
        description="Responda com calma."
        focused
        title="Questão 1 de 10"
      >
        <p>Pergunta atual</p>
      </AssessmentPage>,
    );

    expect(screen.getByText('Pergunta atual')).toBeVisible();
    expect(
      screen.queryByRole('navigation', { name: 'Navegação do diagnóstico' }),
    ).not.toBeInTheDocument();
  });
});
