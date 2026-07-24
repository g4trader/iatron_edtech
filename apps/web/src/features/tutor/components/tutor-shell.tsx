'use client';
import type {
  ChatMessage,
  TutorConversation,
  TutorMessage,
} from '@iatron/contracts';
import { useMemo } from 'react';
import { ChatShell } from '@/features/conversations/components/chat-shell';
import { RealTutorTransport } from '../transport/real-tutor-transport';
import type { Mentor } from '@/features/mentors/mentors';
import { MentorIdentity } from '@/features/mentors/components/mentor';

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
  mentor,
  messages,
}: {
  conversation: TutorConversation;
  initialPrompt?: string;
  mentor: Mentor;
  messages: TutorMessage[];
}) {
  const transport = useMemo(() => new RealTutorTransport(), []);
  return (
    <section className="tutor-conversation-page">
      <header className="catalog-card mx-auto mt-4 max-w-3xl">
        <MentorIdentity mentor={mentor} />
        <p className="eyebrow">Orientação conduzida por {mentor.displayName}</p>
        <h1>
          {conversation.title === 'Nova conversa'
            ? `Converse com ${mentor.displayName}`
            : conversation.title}
        </h1>
        <p>
          {mentor.displayName} orienta esta conversa com base no seu diagnóstico,
          no seu plano e nos conteúdos estudados. A tecnologia apoia a resposta
          com o contexto da sua preparação. As orientações são educacionais e
          não substituem atendimento médico.
        </p>
      </header>
      <ChatShell
        assistantIdentity={{
          initials: mentor.initials,
          name: mentor.displayName,
        }}
        conversationId={conversation.id}
        initialMessages={messages.map(toChatMessage)}
        initialPrompt={initialPrompt}
        transport={transport}
      />
    </section>
  );
}
