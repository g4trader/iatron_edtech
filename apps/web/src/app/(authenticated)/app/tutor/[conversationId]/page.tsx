import { notFound } from 'next/navigation';
import { TutorShell } from '@/features/tutor/components/tutor-shell';
import { getTutorConversation } from '@/features/tutor/server/tutor';

export default async function TutorConversationPage({ params }: { params: Promise<{ conversationId: string }> }) {
  const { conversationId } = await params;
  let conversation;
  try {
    conversation = await getTutorConversation(conversationId);
  } catch {
    notFound();
  }
  return <TutorShell conversation={conversation} messages={conversation.messages} />;
}
