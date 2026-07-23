import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import {
  EmptyLearningState,
  LearningPage,
  learningReasonLabel,
  learningTrendLabel,
} from './learning-page';

describe('experiência de progresso', () => {
  it('usa linguagem humana na navegação e no estado vazio', () => {
    render(
      <LearningPage
        title="Seu domínio"
        description="Acompanhe seu aprendizado."
      >
        <EmptyLearningState />
      </LearningPage>,
    );

    expect(
      screen.getByRole('navigation', { name: 'Acompanhar aprendizado' }),
    ).toBeVisible();
    expect(screen.getByRole('link', { name: 'Meu domínio' })).toBeVisible();
    expect(
      screen.getByRole('heading', {
        name: 'Seu progresso aparecerá aqui',
      }),
    ).toBeVisible();
    expect(
      screen.getByRole('link', { name: 'Fazer meu diagnóstico' }),
    ).toBeVisible();
    expect(screen.queryByText(/learning engine/i)).not.toBeInTheDocument();
  });

  it('traduz motivos e tendências internas', () => {
    expect(learningReasonLabel('low_evidence')).toBe(
      'precisamos conhecer melhor seu nível',
    );
    expect(learningTrendLabel('improving')).toBe('em evolução');
  });
});
