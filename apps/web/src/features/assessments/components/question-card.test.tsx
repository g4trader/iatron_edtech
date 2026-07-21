import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { demoQuestion } from '@/features/conversations/mocks/demo-data';
import { QuestionCard } from './question-card';

describe('QuestionCard', () => {
  it('permite trocar alternativa antes da confirmação', () => {
    render(<QuestionCard question={demoQuestion} />);
    const options = screen.getAllByRole('radio').slice(0, 5);
    fireEvent.click(options[0]!);
    fireEvent.click(options[1]!);
    expect(options[1]).toBeChecked();
  });

  it('seleciona confiança, marca revisão e bloqueia após confirmar', () => {
    const onConfirmed = vi.fn();
    render(<QuestionCard onConfirmed={onConfirmed} question={demoQuestion} />);
    fireEvent.click(screen.getByText(/revisar os dados/i));
    fireEvent.click(screen.getByText('Alta'));
    fireEvent.click(
      screen.getByRole('button', { name: /marcar para revisão/i }),
    );
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar resposta' }));
    expect(onConfirmed).toHaveBeenCalledOnce();
    expect(
      screen.getByRole('button', { name: 'Resposta confirmada' }),
    ).toBeDisabled();
    expect(
      screen.getByRole('button', { name: /marcada para revisão/i }),
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('aceita navegação de alternativa por teclado', () => {
    render(<QuestionCard question={demoQuestion} />);
    const first = screen.getAllByRole('radio')[0]!;
    first.focus();
    fireEvent.keyDown(first, { key: ' ' });
    fireEvent.click(first);
    expect(first).toBeChecked();
  });
});
