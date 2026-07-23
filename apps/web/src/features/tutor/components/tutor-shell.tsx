'use client';
import type {
  ChatMessage,
  TutorConversation,
  TutorMessage,
} from '@iatron/contracts';
import { useMemo } from 'react';
import { ChatShell } from '@/features/conversations/components/chat-shell';
import { RealTutorTransport } from '../transport/real-tutor-transport';

function toChatMessage(message: TutorMessage): ChatMessage {
  return {
    id: message.id,
    role: message.role,
    createdAt: message.createdAt,
    status:
      message.status === 'failed'
        ? 'error'
        : message.status === 'streaming'
          ? 'streaming'
          : 'complete',
    parts: [{ type: 'text', text: message.content }],
  };
}

export function TutorShell({
  conversation,
  initialPrompt,
  messages,
}: {
  conversation: TutorConversation;
  initialPrompt?: string;
  messages: TutorMessage[];
}) {
  const transport = useMemo(() => new RealTutorTransport(), []);
  return (
    <section className="tutor-conversation-page">
      <header className="catalog-card mx-auto mt-4 max-w-3xl">
        <p className="eyebrow">Seu tutor de estudos</p>
        <h1>{conversation.title}</h1>
        <p>
          Use esta conversa para entender seu diagnóstico, seu plano e os
          conteúdos estudados. As orientações são educacionais e não substituem
          atendimento médico.
        </p>
      </header>
      <ChatShell
        conversationId={conversation.id}
        initialMessages={messages.map(toChatMessage)}
        initialPrompt={initialPrompt}
        transport={transport}
      />
    </section>
  );
}
