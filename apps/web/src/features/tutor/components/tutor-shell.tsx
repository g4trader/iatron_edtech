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
        <p className="eyebrow">Mentoria em {mentor.specialty}</p>
        <h1>
          {conversation.title === 'Nova conversa'
            ? `Converse com ${mentor.displayName}`
            : conversation.title}
        </h1>
        <p>
          Mentor da área: {mentor.displayName}. As explicações usam seu
          diagnóstico, seu plano e os conteúdos estudados para manter o contexto
          da sua preparação.
        </p>
        <p className="text-sm text-[var(--foreground-muted)]">
          Explicação gerada pela IA do Iatron com base no contexto da sua
          preparação. Não representa uma fala ou revisão individual do mentor.
        </p>
      </header>
      <ChatShell
        assistantIdentity={{
          initials: 'IA',
          name: 'IA do Iatron',
        }}
        conversationId={conversation.id}
        initialMessages={messages.map(toChatMessage)}
        initialPrompt={initialPrompt}
        transport={transport}
      />
    </section>
  );
}
