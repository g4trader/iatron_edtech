import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ChatComposer } from './chat-composer';

const defaults = {
  conversationId: 'test',
  generating: false,
  offline: false,
  onCancel: vi.fn(),
  onSend: vi.fn(),
};

describe('ChatComposer', () => {
  it('impede envio vazio e envia texto com Enter', () => {
    const onSend = vi.fn();
    render(<ChatComposer {...defaults} onSend={onSend} />);
    expect(
      screen.getByRole('button', { name: 'Enviar mensagem' }),
    ).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Mensagem'), {
      target: { value: 'Minha pergunta' },
    });
    fireEvent.keyDown(screen.getByLabelText('Mensagem'), { key: 'Enter' });
    expect(onSend).toHaveBeenCalledWith('Minha pergunta');
  });

  it('preserva nova linha com Shift+Enter e ignora composição IME', () => {
    const onSend = vi.fn();
    render(<ChatComposer {...defaults} onSend={onSend} />);
    const input = screen.getByLabelText('Mensagem');
    fireEvent.change(input, { target: { value: 'Linha' } });
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
    expect(onSend).not.toHaveBeenCalled();
  });

  it('restaura rascunho e apresenta estado offline', () => {
    window.localStorage.setItem('iatron:draft:test', 'Rascunho salvo');
    render(<ChatComposer {...defaults} offline />);
    expect(screen.getByDisplayValue('Rascunho salvo')).toBeDisabled();
    expect(screen.getByText(/você está offline/i)).toBeInTheDocument();
  });

  it('exibe ação de interrupção durante geração', () => {
    const onCancel = vi.fn();
    render(<ChatComposer {...defaults} generating onCancel={onCancel} />);
    fireEvent.click(screen.getByRole('button', { name: /interromper/i }));
    expect(onCancel).toHaveBeenCalledOnce();
  });
});
