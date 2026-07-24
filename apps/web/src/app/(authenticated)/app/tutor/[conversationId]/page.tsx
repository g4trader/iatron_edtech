import { notFound } from 'next/navigation';
import { TutorShell } from '@/features/tutor/components/tutor-shell';
import { getTutorConversation } from '@/features/tutor/server/tutor';
import { studyPlans } from '@/features/study-plans/server/study-plans';
import {
  dominantMentor,
  mentorForCompetency,
} from '@/features/mentors/mentors';

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
  let mentor = dominantMentor([]);
  try {
    if (conversation.originType === 'plan_item' && conversation.originId) {
      mentor = mentorForCompetency(
        await studyPlans.item(conversation.originId),
      );
    } else {
      mentor = dominantMentor((await studyPlans.current())?.items ?? []);
    }
  } catch {
    // O anfitrião geral mantém a orientação disponível sem inventar contexto.
  }
  return (
    <TutorShell
      conversation={conversation}
      initialPrompt={
        ask === 'plan-item'
          ? 'Por que esta atividade está no meu plano e como ela ajuda na minha preparação?'
          : undefined
      }
      mentor={mentor}
      messages={conversation.messages}
    />
  );
}
