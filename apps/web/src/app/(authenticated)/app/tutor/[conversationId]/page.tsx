import { notFound } from 'next/navigation';
import { TutorShell } from '@/features/tutor/components/tutor-shell';
import { getTutorConversation } from '@/features/tutor/server/tutor';

export default async function TutorConversationPage({
  params,
  searchParams,
}: {
  params: Promise<{ conversationId: string }>;
  searchParams: Promise<{ ask?: string }>;
}) {
  const { conversationId } = await params;
  const { ask } = await searchParams;
  let conversation;
  try {
    conversation = await getTutorConversation(conversationId);
  } catch {
    notFound();
  }
  return (
    <TutorShell
      conversation={conversation}
      initialPrompt={
        ask === 'plan-item'
          ? 'Por que esta atividade está no meu plano e como ela ajuda na minha preparação?'
          : undefined
      }
      messages={conversation.messages}
    />
  );
}
