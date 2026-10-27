import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import AssessmentSessionError from './error';

describe('AssessmentSessionError', () => {
  it('oferece retry e retorno seguro sem afirmar que a resposta foi salva', () => {
    const reset = vi.fn();
    render(<AssessmentSessionError reset={reset} />);

    expect(
      screen.getByRole('heading', {
        name: 'Não conseguimos confirmar sua resposta agora',
      }),
    ).toBeVisible();
    expect(screen.queryByText(/resposta foi salva/i)).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Conferir meu diagnóstico salvo' }),
    ).toHaveAttribute('href', '/app/assessment/entry');

    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(reset).toHaveBeenCalledOnce();
  });
});
