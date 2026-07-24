import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { EmptyChatState } from './empty-chat-state';

describe('EmptyChatState', () => {
  it('renderiza sugestões e inicia uma ação', () => {
    const onSelect = vi.fn();
    render(<EmptyChatState onSelect={onSelect} />);
    fireEvent.click(
      screen.getByRole('button', {
        name: /por que este tema está no meu plano/i,
      }),
    );
    expect(onSelect).toHaveBeenCalledWith(
      'Por que este tema está no meu plano?',
    );
  });
});
