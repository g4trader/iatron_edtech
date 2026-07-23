import Link from 'next/link';
import type { Route } from 'next';
import { redirect } from 'next/navigation';
import type { TutorMode, TutorOriginType } from '@iatron/contracts';
import { createTutorConversation, listTutorConversations } from '@/features/tutor/server/tutor';
import { EmptyState } from '@/components/feedback/states';

export default async function TutorPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams;
  async function create() {
    'use server';
    const mode = (params.mode ?? 'general') as TutorMode;
    const originType = (params.originType ?? null) as TutorOriginType | null;
    const result = await createTutorConversation({ mode, originType, originId: params.originId ?? null });
    redirect(`/app/tutor/${result.id}` as Route);
  }
  const conversations = await listTutorConversations();
  return (
    <main className="catalog-page">
      <header className="catalog-header">
        <p className="eyebrow">Seu tutor de estudos</p>
        <h1>Entenda melhor cada próximo passo</h1>
        <p>
          Tire dúvidas sobre seu diagnóstico, seu plano ou uma competência. O
          tutor usa as informações do seu aprendizado para dar explicações mais
          úteis.
        </p>
        <form action={create}>
          <button className="primary-action" type="submit">
            Começar conversa
          </button>
        </form>
      </header>
      <section className="catalog-grid" aria-label="Histórico de conversas">
        {conversations.length === 0 && (
          <EmptyState
            title="Comece sua primeira conversa"
            description="Você pode perguntar por que uma prioridade entrou no plano, o que significa seu domínio ou como melhorar em um tema."
          />
        )}
        {conversations.map((conversation) => (
          <Link className="catalog-card" href={`/app/tutor/${conversation.id}` as Route} key={conversation.id}>
            <strong>{conversation.title}</strong>
            <span>Continuar conversa</span>
          </Link>
        ))}
      </section>
    </main>
  );
}
