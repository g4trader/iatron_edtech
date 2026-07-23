import { redirect } from 'next/navigation';
import type { Route } from 'next';

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = await params;
  redirect((conversationId === 'new' ? '/app/tutor' : `/app/tutor/${conversationId}`) as Route);
}
