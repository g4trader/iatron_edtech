import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type {
  ChatTransport,
  ChatTransportEvent,
  SendMessageInput,
} from '@iatron/contracts';
import { ChatShell } from './chat-shell';

describe('ChatShell', () => {
  it('envia a pergunta contextual automaticamente uma única vez', async () => {
    window.history.replaceState(
      {},
      '',
      '/app/tutor/conversation?ask=plan-item',
    );
    const sendMessage = vi.fn(async function* (
      input: SendMessageInput,
    ): AsyncIterable<ChatTransportEvent> {
      yield { type: 'start', requestId: input.requestId };
      yield {
        type: 'text-delta',
        requestId: input.requestId,
        delta: 'Explicação contextual.',
      };
      yield { type: 'complete', requestId: input.requestId };
    });
    const transport: ChatTransport = {
      sendMessage,
      cancel: vi.fn(async () => undefined),
    };

    const { rerender } = render(
      <ChatShell
        conversationId="conversation"
        initialMessages={[]}
        initialPrompt="Por que esta atividade está no meu plano?"
        transport={transport}
      />,
    );

    await waitFor(() => expect(sendMessage).toHaveBeenCalledOnce());
    expect(
      screen.getByText('Por que esta atividade está no meu plano?'),
    ).toBeInTheDocument();
    expect(screen.getByText('Explicação contextual.')).toBeInTheDocument();
    expect(window.location.search).toBe('');

    rerender(
      <ChatShell
        conversationId="conversation"
        initialMessages={[]}
        initialPrompt="Por que esta atividade está no meu plano?"
        transport={transport}
      />,
    );
    expect(sendMessage).toHaveBeenCalledOnce();
  });
});
