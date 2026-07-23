import { redirect } from 'next/navigation';
import type { Route } from 'next';
import { ChatShell } from '@/features/conversations/components/chat-shell';
import { isAuthBypassEnabled } from '@/lib/auth-bypass';

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  if (isAuthBypassEnabled(process.env))
    return <ChatShell conversationId={conversationId} />;
  redirect((conversationId === 'new' ? '/app/tutor' : `/app/tutor/${conversationId}`) as Route);
}
