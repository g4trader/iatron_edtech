import { ChatShell } from '@/features/conversations/components/chat-shell';

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  return <ChatShell conversationId={conversationId} />;
}
