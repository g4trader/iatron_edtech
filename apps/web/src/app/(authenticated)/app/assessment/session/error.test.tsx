import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AssessmentSessionError from './error';

describe('AssessmentSessionError', () => {
  it('oferece retry e retorno seguro sem afirmar que a resposta foi salva', () => {
    const reset = vi.fn();
    render(<AssessmentSessionError reset={reset} />);

    expect(
      screen.getByRole('heading', {
        name: 'Não conseguimos registrar esta resposta agora',
      }),
    ).toBeVisible();
    expect(screen.queryByText(/resposta foi salva/i)).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Voltar para minha jornada' }),
    ).toHaveAttribute('href', '/app');

    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(reset).toHaveBeenCalledOnce();
  });
});
