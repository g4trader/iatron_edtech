import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AssessmentShell } from './assessment-shell';

describe('AssessmentShell', () => {
  it('pausa e retoma a avaliação', () => {
    render(<AssessmentShell />);
    fireEvent.click(screen.getByRole('button', { name: 'Pausar' }));
    expect(
      screen.getByRole('heading', { name: 'Avaliação pausada' }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retomar avaliação' }));
    expect(screen.getByText(/questão 1 de 3/i)).toBeInTheDocument();
  });
});
