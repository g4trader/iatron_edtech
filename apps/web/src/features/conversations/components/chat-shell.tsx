'use client';

import type { ChatMessage, ChatTransport } from '@iatron/contracts';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { EmptyChatState } from './empty-chat-state';
import { ChatComposer } from './chat-composer';
import { MessageList } from './message-list';
import { ErrorState } from '@/components/feedback/states';
import {
  emptyConversation,
  errorConversation,
  gapConversation,
  planConversation,
  questionConversation,
  streamingConversation,
} from '../mocks/demo-data';
import { MockChatTransport } from '../transport/mock-chat-transport';

function initialConversation(id: string): ChatMessage[] {
  return (
    {
      question: questionConversation,
      gap: gapConversation,
      plan: planConversation,
      error: errorConversation,
      streaming: streamingConversation,
    }[id] ?? emptyConversation
  );
}

function createDevelopmentTransport(): ChatTransport | null {
  return process.env.NODE_ENV === 'production' ? null : new MockChatTransport();
}

export function ChatShell({
  conversationId = 'new',
  initialMessages,
  initialPrompt,
  transport: suppliedTransport,
}: {
  conversationId?: string;
  initialMessages?: ChatMessage[];
  initialPrompt?: string;
  transport?: ChatTransport;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(
    () => initialMessages ?? initialConversation(conversationId),
  );
  const [generating, setGenerating] = useState(false);
  const [offline, setOffline] = useState(false);
  const [transportUnavailable, setTransportUnavailable] = useState(false);
  const activeRequestRef = useRef<string | null>(null);
  const initialPromptSentRef = useRef(false);
  const transport = useMemo(
    () => suppliedTransport ?? createDevelopmentTransport(),
    [suppliedTransport],
  );

  const send = useCallback(
    async (text: string) => {
      if (!transport) {
        setTransportUnavailable(true);
        return;
      }
      const requestId = crypto.randomUUID();
      const assistantId = `assistant-${requestId}`;
      activeRequestRef.current = requestId;
      setGenerating(true);
      setMessages((current) => [
        ...current,
        {
          id: `user-${requestId}`,
          role: 'user',
          createdAt: new Date().toISOString(),
          status: 'complete',
          parts: [{ type: 'text', text }],
        },
        {
          id: assistantId,
          role: 'assistant',
          createdAt: new Date().toISOString(),
          status: 'streaming',
          parts: [{ type: 'text', text: '' }],
        },
      ]);
      for await (const event of transport.sendMessage({
        requestId,
        conversationId,
        text,
      })) {
        if (event.type === 'text-delta')
          setMessages((current) =>
            current.map((message) =>
              message.id === assistantId
                ? {
                    ...message,
                    parts: [
                      {
                        type: 'text',
                        text: `${message.parts[0]?.type === 'text' ? message.parts[0].text : ''}${event.delta}`,
                      },
                    ],
                  }
                : message,
            ),
          );
        if (event.type === 'part')
          setMessages((current) =>
            current.map((message) =>
              message.id === assistantId
                ? { ...message, parts: [...message.parts, event.part] }
                : message,
            ),
          );
        if (event.type === 'reconnecting')
          setMessages((current) => [
            ...current,
            {
              id: `system-${requestId}`,
              role: 'system',
              createdAt: new Date().toISOString(),
              status: 'complete',
              parts: [
                {
                  type: 'text',
                  text: 'Reconectando a simulação… seu conteúdo foi preservado.',
                },
              ],
            },
          ]);
        if (event.type === 'error') {
          setMessages((current) =>
            current.map((message) =>
              message.id === assistantId
                ? {
                    ...message,
                    status: 'error',
                    parts: [{ type: 'text', text: event.message }],
                  }
                : message,
            ),
          );
          setGenerating(false);
        }
        if (event.type === 'complete') {
          setMessages((current) =>
            current.map((message) =>
              message.id === assistantId
                ? { ...message, status: 'complete' }
                : message,
            ),
          );
          setGenerating(false);
        }
      }
      setGenerating(false);
    },
    [conversationId, transport],
  );

  useEffect(() => {
    if (!initialPrompt || initialPromptSentRef.current || messages.length > 0)
      return;
    initialPromptSentRef.current = true;
    window.history.replaceState(
      window.history.state,
      '',
      window.location.pathname,
    );
    void send(initialPrompt);
  }, [initialPrompt, messages.length, send]);

  const cancel = async () => {
    if (transport && activeRequestRef.current)
      await transport.cancel(activeRequestRef.current);
    setGenerating(false);
    setMessages((current) =>
      current.map((message) =>
        message.status === 'streaming'
          ? { ...message, status: 'complete' }
          : message,
      ),
    );
  };
  return (
    <main className="chat-shell">
      <div className="chat-scroll">
        {transportUnavailable && (
          <ErrorState message="A simulação local de chat está disponível apenas em desenvolvimento e testes." />
        )}
        {messages.length === 0 ? (
          <EmptyChatState onSelect={send} />
        ) : (
          <MessageList
            messages={messages}
            onRetry={() => send('Tentar novamente')}
          />
        )}
      </div>
      <ChatComposer
        conversationId={conversationId}
        generating={generating}
        offline={offline}
        onCancel={cancel}
        onSend={send}
      />
      <button
        className="offline-toggle"
        onClick={() => setOffline((value) => !value)}
        type="button"
      >
        {offline ? 'Simular reconexão' : 'Simular modo offline'}
      </button>
    </main>
  );
}
